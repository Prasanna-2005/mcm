const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const MovieFilterController = require('../controllers/movie_filters');


router.get('/movies/latest', authController.isAuthenticated, MovieFilterController.getLatestMovies);
router.get('/movies/top-rated', authController.isAuthenticated,MovieFilterController.getTopRatedMovies);
router.get('/movies/lang', authController.isAuthenticated,MovieFilterController.getMoviesByLanguage); // Uses query parameter `?language=`
router.get('/movies/genre',authController.isAuthenticated, MovieFilterController.getMoviesByGenre); // Uses query parameter `?genre=`
router.get('/movies/liked',authController.isAuthenticated, MovieFilterController.getLikedMovies); // Uses query parameter `?user_id=`
router.get('/movies/watchlists',authController.isAuthenticated, MovieFilterController.getWatchlistedMovies); // Uses query parameter `?user_id=`


module.exports = router;