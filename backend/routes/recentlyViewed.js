// backend/routes/recentlyViewed.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/recentlyViewedController');

// GET /recently-viewed and GET /recently-viewed/:userId -> returns last 10 items
router.get('/', controller.getRecentlyViewed);
router.get('/:userId', controller.getRecentlyViewed);

// POST /recently-viewed -> add or update a single view
router.post('/', controller.addOrUpdate);

// POST /recently-viewed/sync -> bulk sync (merge) for authenticated user
router.post('/sync', controller.sync);

module.exports = router;
