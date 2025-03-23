const db = require("../config/db.config");

const reviewController = {
  getReviewsByMovieId: async (req, res) => {
    //get the movieId from the URL
    const movieId = req.params.movieId;
    // check if the movieId is of type number
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }
    // check if the movie exists
    const [movies] = await db.query("SELECT id FROM movies WHERE id = ?", [
      movieId,
    ]);

    if (movies.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // get reviews from the table
    const [reviews] = await db.query(
      "select r.id, r.movie_id, r.content, r.rating, r.likes_count,r.dislikes_count,u.id as user_id, u.username, u.email from reviews r join users u on r.user_id=u.id where r.movie_id=?",
      [movieId]
    );

    let reviewResponse = [];
    for (let review of reviews) {
      let resp = {
        id: review.id,
        content: review.content,
        rating: review.rating,
        movie_id: review.movie_id,
        likes_count: review.likes_count,
        dislikes_count: review.dislikes_count,
        user: {
          id: review.user_id,
          username: review.username,
          email: review.email,
        },
      };

      reviewResponse.push(resp);
    }

    return res.json(reviewResponse);
  },

  addReview: async (req, res) => {
    /*
           Sample body:
              content: "This is a great movie!",
              rating: 5 
          */

    // get the movieId from the URL
    const movieId = req.params.movieId;

    // check if the movieId is of type number
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    // check if the movie exists
    const [movies] = await db.query("SELECT id FROM movies WHERE id = ?", [
      movieId,
    ]);

    if (movies.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // get the user id from the session
    const { id: userId } = req.session.user;

    // get the content and rating from the body
    const { content, rating } = req.body;

    // check if the content and rating are provided
    if (!content || !rating) {
      return res
        .status(400)
        .json({ message: "Content and rating are required!" });
    }

    // check if the rating is between 1 and 5
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // check if the content is of type string
    if (typeof content !== "string") {
      return res.status(400).json({ message: "Content must be a string" });
    }

    // check if the user has already reviewed the movie
    const [reviews] = await db.query(
      "SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (reviews.length > 0) {
      return res.status(400).json({
        message: `User has already reviewed the movie with id: ${movieId}`,
      });
    }

    // update the average rating in the movies table set average_rating = (average_rating * rating_count + new_rating) / (rating_count + 1)
    await db.query(
      "UPDATE movies SET average_rating = (average_rating * rating_count + ?) / (rating_count + 1) WHERE id = ?",
      [rating, movieId]
    );
    // update rating count in the movies table
    await db.query(
      "UPDATE movies SET rating_count = rating_count + 1 WHERE id = ?",
      [movieId]
    );
    // save the review to the database
    try {
      const [result] = await db.query(
        "INSERT INTO reviews(movie_id, user_id, content, rating) VALUES (?, ?, ?, ?)",
        [movieId, userId, content, rating]
      );

      if (result.affectedRows === 1) {
        return res.status(201).json({
          message: "Review added successfully",
        });
      } else {
        return res.status(500).json({ message: "Failed to add review" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },

  likeOrDislikeReview: async (req, res) => {
    const movieId = req.params.movieId;
    const reviewId = req.params.reviewId;
    const action = req.params.action; // can be either 'like' or 'dislike'
    //check if the movieId is of type number
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }
    //check if the movie exists
    const [movies] = await db.query("SELECT id FROM movies WHERE id = ?", [
      movieId,
    ]);
    if (movies.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }
    //check reviewId is of type number
    if (isNaN(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }
    //check if the review exists
    const [reviews] = await db.query("SELECT id FROM reviews WHERE id = ?", [
      reviewId,
    ]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    //check if the action is either like or dislike
    if (action !== "like" && action !== "dislike") {
      return res.status(400).json({ message: "Invalid action" });
    }
    //get the user id from the session
    const { id: userId } = req.session.user;
    //check if the user has already liked or disliked the review
    const [likes] = await db.query(
      "SELECT * FROM review_likes WHERE user_id = ? AND review_id = ?",
      [userId, reviewId]
    );
    if (likes.length > 0) {
      return res
        .status(400)
        .json({ message: "User has already liked or disliked the review" });
    }
    // update the likes or dislikes count in the reviews table
    if (action === "like") {
      await db.query(
        "UPDATE reviews SET likes_count = likes_count + 1 WHERE id = ?",
        [reviewId]
      );
    }
    if (action === "dislike") {
      await db.query(
        "UPDATE reviews SET dislikes_count = dislikes_count + 1 WHERE id = ?",
        [reviewId]
      );
    }
    //save the like or dislike to the database
    try {
      const [result] = await db.query(
        "INSERT INTO review_likes(review_id, user_id, action) VALUES (?, ?, ?)",
        [reviewId, userId, action]
      );
      if (result.affectedRows === 1) {
        return res.status(201).json({ message: "Action added successfully" });
      } else {
        return res.status(500).json({ message: "Failed to add action" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },

  deleteReview: async (req, res) => {
    // get the movieId and reviewId from the request
    const movieId = req.params.movieId;
    const reviewId = req.params.reviewId;

    // check if the movieId is of type number
    if (isNaN(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    // check if the movie exists
    const [movies] = await db.query("SELECT id FROM movies WHERE id = ?", [
      movieId,
    ]);
    if (movies.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // check if the reviewId is of type number
    if (isNaN(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    // check if the review exists
    const [reviews] = await db.query("SELECT id FROM reviews WHERE id = ?", [
      reviewId,
    ]);

    if (reviews.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    // get the user id from the session
    const { id: userId } = req.session.user;

    // check if the user is the author of the review
    const [review] = await db.query(
      "SELECT user_id FROM reviews WHERE id = ?",
      [reviewId]
    );

    if (review[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden, cannot delete other users' reviews" });
    }

    // delete the review
    await db.query("DELETE FROM reviews WHERE id = ?", [reviewId]);

    // update the rating_count and the average_rating in the movies table
    const [ratings] = await db.query(
      "SELECT rating FROM reviews WHERE movie_id = ?",
      [movieId]
    );

    const ratingCount = ratings.length;
    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRating / ratingCount;

    await db.query(
      "UPDATE movies SET rating_count = ?, average_rating = ? WHERE id = ?",
      [ratingCount, averageRating, movieId]
    );

    return res.status(200).json({ message: "Review deleted successfully" });
  },
};
module.exports = reviewController;
