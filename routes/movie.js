const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const MovieController = require('../controllers/movie');


router.get('/movie_grid_layout', authController.isAuthenticated ,MovieController.getAllMoviesForGridview); 
router.get('/movie/:id', authController.isAuthenticated ,MovieController.getMovieById);
router.get('/search', MovieController.searchMoviesByTitle);

router.get('/no_auth/movie_grid_layout',MovieController.NAgetAllMoviesForGridview); 
router.get('/no_auth/movie/:id',MovieController.NAgetMovieById);
module.exports = router;