const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const MovieFilterController = require("../controllers/review");

router.get(
  "/movies/:movieId/reviews",
  authController.isAuthenticated,
  MovieFilterController.getReviewsByMovieId
);

router.post(
  "/movies/:movieId/reviews",
  authController.isAuthenticated,
  MovieFilterController.addReview
);

router.post(
  "/movies/:movieId/reviews/:reviewId/:action", // action can be 'like' or 'dislike'
  authController.isAuthenticated,
  MovieFilterController.likeOrDislikeReview
);

router.delete(
  "/movies/:movieId/reviews/:reviewId",
  authController.isAuthenticated,
  MovieFilterController.deleteReview
);

module.exports = router;
