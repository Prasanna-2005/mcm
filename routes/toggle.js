const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const toggleController = require('../controllers/toggle');

router.patch('/movie/toggle-like', authController.isAuthenticated, toggleController.toggleLike);
router.patch('/movie/toggle-watchlist', authController.isAuthenticated, toggleController.toggleWatchlist);

module.exports = router;