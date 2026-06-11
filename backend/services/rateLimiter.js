/**
 * In-memory rate limiter for push notifications.
 * Prevents notification spam at per-user and global levels.
 *
 * Limits:
 *   - Per user: max 10 notifications per hour
 *   - Global:   max 50 notifications per minute
 */

// Store: userId -> [timestamp, timestamp, ...]
const userBuckets = new Map();
// Store: [timestamp, timestamp, ...]
let globalBucket = [];

const USER_LIMIT = 10;         // Max notifications per user per window
const USER_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const GLOBAL_LIMIT = 50;       // Max notifications globally per window
const GLOBAL_WINDOW_MS = 60 * 1000;    // 1 minute

/**
 * Clean expired timestamps from a bucket
 */
function pruneTimestamps(timestamps, windowMs) {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter((ts) => ts > cutoff);
}

/**
 * Check if a notification can be sent for a given user.
 * Returns true if within limits, false if rate-limited.
 */
function checkRateLimit(userId) {
  const now = Date.now();

  // 1. Check global limit
  globalBucket = pruneTimestamps(globalBucket, GLOBAL_WINDOW_MS);
  if (globalBucket.length >= GLOBAL_LIMIT) {
    console.warn(`[RateLimiter] Global limit reached (${GLOBAL_LIMIT}/min)`);
    return false;
  }

  // 2. Check per-user limit
  const userKey = userId.toString();
  let userTimestamps = userBuckets.get(userKey) || [];
  userTimestamps = pruneTimestamps(userTimestamps, USER_WINDOW_MS);

  if (userTimestamps.length >= USER_LIMIT) {
    console.warn(`[RateLimiter] User ${userKey} hit limit (${USER_LIMIT}/hr)`);
    return false;
  }

  // 3. Record this notification
  userTimestamps.push(now);
  userBuckets.set(userKey, userTimestamps);
  globalBucket.push(now);

  return true;
}

/**
 * Get remaining quota for a user
 */
function getRemainingQuota(userId) {
  const userKey = userId.toString();
  let userTimestamps = userBuckets.get(userKey) || [];
  userTimestamps = pruneTimestamps(userTimestamps, USER_WINDOW_MS);
  return {
    userRemaining: Math.max(0, USER_LIMIT - userTimestamps.length),
    userLimit: USER_LIMIT,
    userWindowMs: USER_WINDOW_MS,
  };
}

/**
 * Periodic cleanup of stale user buckets (run every 10 minutes)
 */
function startCleanup(intervalMs = 10 * 60 * 1000) {
  setInterval(() => {
    const cutoff = Date.now() - USER_WINDOW_MS;
    for (const [key, timestamps] of userBuckets.entries()) {
      const pruned = timestamps.filter((ts) => ts > cutoff);
      if (pruned.length === 0) {
        userBuckets.delete(key);
      } else {
        userBuckets.set(key, pruned);
      }
    }
    globalBucket = pruneTimestamps(globalBucket, GLOBAL_WINDOW_MS);
  }, intervalMs);
}

module.exports = {
  checkRateLimit,
  getRemainingQuota,
  startCleanup,
};
