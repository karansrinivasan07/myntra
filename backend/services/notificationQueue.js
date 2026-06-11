const { Expo } = require("expo-server-sdk");
const DeviceToken = require("../models/DeviceToken");
const Notification = require("../models/Notification");
const NotificationLog = require("../models/NotificationLog");
const NotificationJob = require("../models/NotificationJob");

const expo = new Expo();

/**
 * Enqueue a notification for sending to all registered device tokens of a user
 */
async function enqueueNotification(notification) {
  try {
    const tokens = await DeviceToken.find({ userId: notification.userId });
    if (!tokens || tokens.length === 0) {
      console.log(`No device tokens found for user ${notification.userId}`);
      notification.status = "failed";
      await notification.save();
      return;
    }

    const jobs = tokens.map((deviceToken) => {
      return {
        notificationId: notification._id,
        deviceToken: deviceToken.token,
        status: "pending",
        runAt: notification.scheduledAt || new Date(),
        maxAttempts: 5,
      };
    });

    await NotificationJob.insertMany(jobs);
    console.log(`Enqueued ${jobs.length} push notification jobs for notification ${notification._id}`);
  } catch (error) {
    console.error("Failed to enqueue notification jobs:", error);
  }
}

/**
 * Main worker logic to process pending jobs in chunks
 */
async function processJobs() {
  try {
    // Find jobs scheduled to run now or in the past
    const jobs = await NotificationJob.find({
      status: "pending",
      runAt: { $lte: new Date() },
    })
      .limit(100) // batch processing
      .populate("notificationId");

    if (jobs.length === 0) {
      return;
    }

    console.log(`[Worker] Found ${jobs.length} jobs to process.`);

    // Set status of these jobs to processing to avoid double execution
    const jobIds = jobs.map((job) => job._id);
    await NotificationJob.updateMany({ _id: { $in: jobIds } }, { status: "processing" });

    const messages = [];
    const jobMap = {}; // Maps token to job array for receipt handling

    for (const job of jobs) {
      const notification = job.notificationId;
      if (!notification) {
        // Orphaned job
        job.status = "dlq";
        job.errors.push({ message: "Parent notification not found" });
        await job.save();
        continue;
      }

      const token = job.deviceToken;
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        job.status = "dlq";
        job.errors.push({ message: "Invalid push token format" });
        await job.save();
        // Remove from db
        await DeviceToken.deleteOne({ token });
        continue;
      }

      messages.push({
        to: token,
        sound: "default",
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      });

      if (!jobMap[token]) {
        jobMap[token] = [];
      }
      jobMap[token].push(job);
    }

    if (messages.length === 0) {
      return;
    }

    // Chunk messages to respect rate limits
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending chunk of push notifications:", error);
        // Fail all jobs in this chunk to be retried
        for (const msg of chunk) {
          const matchingJobs = jobMap[msg.to] || [];
          for (const job of matchingJobs) {
            await handleJobFailure(job, error.message || "Failed to send chunk");
          }
        }
      }
    }

    // Match tickets back to jobs
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const message = messages[i];
      const matchingJobs = jobMap[message.to] || [];

      for (const job of matchingJobs) {
        if (ticket.status === "ok") {
          // Success
          job.status = "completed";
          job.attempts += 1;
          await job.save();

          // Log delivery success
          await NotificationLog.create({
            notificationId: job.notificationId._id,
            deviceToken: job.deviceToken,
            status: "success",
          });

          // Mark notification as sent
          await Notification.updateOne(
            { _id: job.notificationId._id },
            { status: "sent", sentAt: new Date() }
          );
        } else {
          // Expo returned error
          const errorDetails = ticket.details;
          const errorCode = errorDetails ? errorDetails.error : "UnknownError";

          console.error(`Expo returned error for token ${job.deviceToken}: ${errorCode}`);

          if (errorCode === "DeviceNotRegistered") {
            // Token is no longer valid, delete it
            await DeviceToken.deleteOne({ token: job.deviceToken });
            job.status = "dlq";
            job.errors.push({ message: "DeviceNotRegistered - token deleted" });
            await job.save();
          } else {
            // Temporary error, retry with backoff
            await handleJobFailure(job, errorCode || "Expo push error");
          }
        }
      }
    }
  } catch (error) {
    console.error("Worker process error:", error);
  }
}

/**
 * Handle job failures with exponential backoff & DLQ transition
 */
async function handleJobFailure(job, errorMessage) {
  try {
    job.attempts += 1;
    job.errors.push({ message: errorMessage });

    // Log delivery failure
    await NotificationLog.create({
      notificationId: job.notificationId._id,
      deviceToken: job.deviceToken,
      status: "failure",
      error: errorMessage,
    });

    if (job.attempts >= job.maxAttempts) {
      // Transition to DLQ
      job.status = "dlq";
      console.log(`Job ${job._id} exceeded max attempts. Sent to DLQ.`);
      
      // Update parent notification state if no other jobs succeed
      await Notification.updateOne(
        { _id: job.notificationId._id },
        { status: "failed" }
      );
    } else {
      // Exponential Backoff: (2 ^ attempts) * 30 seconds
      const backoffSecs = Math.pow(2, job.attempts) * 30;
      job.runAt = new Date(Date.now() + backoffSecs * 1000);
      job.status = "pending";
      console.log(`Job ${job._id} failed. Retrying in ${backoffSecs} seconds.`);
    }

    await job.save();
  } catch (error) {
    console.error("Error handling job failure:", error);
  }
}

// Global reference for interval
let workerInterval = null;

function startWorker(intervalMs = 10000) {
  if (workerInterval) {
    return;
  }
  console.log("Notification queue worker started successfully.");
  workerInterval = setInterval(processJobs, intervalMs);
}

function stopWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log("Notification queue worker stopped.");
  }
}

module.exports = {
  enqueueNotification,
  startWorker,
  stopWorker,
};
