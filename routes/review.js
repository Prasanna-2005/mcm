const express = require("express");
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const ReviewController = require("../controllers/review"); 

router.get(
  '/review/:movieId', authController.isAuthenticated,ReviewController.getReviewsByMovieId
);

router.post(
  '/review/:movieId/', authController.isAuthenticated, ReviewController.addOrUpdateReview 
);

router.delete(
  "/review/:movieId/:reviewId",authController.isAuthenticated,ReviewController.deleteReview
);

module.exports = router;

