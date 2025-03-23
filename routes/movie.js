const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const MovieController = require('../controllers/movie');


router.get('/movie_grid_layout', authController.isAuthenticated ,MovieController.getAllMoviesForGridview); 
router.get('/movie/:id', authController.isAuthenticated ,MovieController.getMovieById);
router.get('/search',authController.isAuthenticated , MovieController.searchMoviesByTitle);

module.exports = router;