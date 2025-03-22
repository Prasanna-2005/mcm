const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const MovieController = require('../controllers/movie');


router.get('/movie_grid_layout', authController.isAuthenticated ,MovieController.getAllMovies); 
router.get('/movie/:id', authController.isAuthenticated ,MovieController.getMovieById); //single json
router.get('/movies/all', authController.isAuthenticated, MovieController.getAllMoviesWithDetails); //list of jsons
router.get('/search_by_title',authController.isAuthenticated , MovieController.searchMovies);

module.exports = router;