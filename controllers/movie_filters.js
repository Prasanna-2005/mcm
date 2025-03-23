const db = require('../config/db.config');

const MovieFilterController = {

  getLatestMovies: async (req, res) => {
    try {
      const userId = req.session.user.id; 

      const [movies] = await db.query(`
        SELECT m.id, m.title, m.average_rating, m.release_year,
               CONCAT('${process.env.BACKEND_URL}/grid_images/', m.id, '.jpg') AS posterImageUrl,
               IF(lm.user_id IS NOT NULL, TRUE, FALSE) AS isLiked,
               IF(w.user_id IS NOT NULL, TRUE, FALSE) AS isWatchlisted
        FROM movies m
        LEFT JOIN liked_movies lm ON m.id = lm.movie_id AND lm.user_id = ?
        LEFT JOIN watchlists w ON m.id = w.movie_id AND w.user_id = ?
        ORDER BY m.release_year DESC
      `, [userId, userId]);

      res.status(200).json({ status: 'success', data: { movies } });
    } catch (error) {
      console.error('Error fetching latest movies:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch movies' });
    }
  },







  getTopRatedMovies: async (req, res) => {
    try {
      const userId = req.session.user.id; 

      const [movies] = await db.query(`
        SELECT m.id, m.title, m.average_rating, 
               CONCAT('${process.env.BACKEND_URL}/grid_images/', m.id, '.jpg') AS posterImageUrl,
               IF(lm.user_id IS NOT NULL, TRUE, FALSE) AS isLiked,
               IF(w.user_id IS NOT NULL, TRUE, FALSE) AS isWatchlisted
        FROM movies m
        LEFT JOIN liked_movies lm ON m.id = lm.movie_id AND lm.user_id = ?
        LEFT JOIN watchlists w ON m.id = w.movie_id AND w.user_id = ?
        ORDER BY m.average_rating DESC
      `, [userId, userId]);

      res.status(200).json({ status: 'success', data: { movies } });
    } catch (error) {
      console.error('Error fetching top-rated movies:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch movies' });
    }
  },








  getMoviesByLanguage: async (req, res) => {
    try {
      const { language } = req.query;
      if (!language) return res.status(400).json({ status: 'fail', message: 'Language required' });

      const userId = req.session.user.id; 

      const [movies] = await db.query(`
        SELECT m.id, m.title, m.average_rating, 
               CONCAT('${process.env.BACKEND_URL}/grid_images/', m.id, '.jpg') AS posterImageUrl,
               IF(lm.user_id IS NOT NULL, TRUE, FALSE) AS isLiked,
               IF(w.user_id IS NOT NULL, TRUE, FALSE) AS isWatchlisted
        FROM movies m
        LEFT JOIN liked_movies lm ON m.id = lm.movie_id AND lm.user_id = ?
        LEFT JOIN watchlists w ON m.id = w.movie_id AND w.user_id = ?
        WHERE m.language = ?
      `, [userId, userId, language]);

      res.status(200).json({ status: 'success', data: { movies } });
    } catch (error) {
      console.error('Error fetching movies by language:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch movies' });
    }
  },









  getMoviesByGenre: async (req, res) => {
    try {
      const { genre } = req.query;
      if (!genre) return res.status(400).json({ status: 'fail', message: 'Genre required' });

      const userId = req.session.user.id; 

      const [movies] = await db.query(`
        SELECT m.id, m.title, m.average_rating, 
               CONCAT('${process.env.BACKEND_URL}/grid_images/', m.id, '.jpg') AS posterImageUrl,
               IF(lm.user_id IS NOT NULL, TRUE, FALSE) AS isLiked,
               IF(w.user_id IS NOT NULL, TRUE, FALSE) AS isWatchlisted
        FROM movies m
        INNER JOIN movie_genres mg ON m.id = mg.movie_id
        INNER JOIN genres g ON mg.genre_id = g.id
        LEFT JOIN liked_movies lm ON m.id = lm.movie_id AND lm.user_id = ?
        LEFT JOIN watchlists w ON m.id = w.movie_id AND w.user_id = ?
        WHERE g.name = ?
      `, [userId, userId, genre]);

      res.status(200).json({ status: 'success', data: { movies } });
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch movies' });
    }
  },






  getLikedMovies: async (req, res) => {
    try {
      const userId = req.session.user.id; 

      const [movies] = await db.query(`
        SELECT m.id, m.title, m.average_rating, 
               CONCAT('${process.env.BACKEND_URL}/grid_images/', m.id, '.jpg') AS posterImageUrl,
               TRUE AS isLiked,
               IF(w.user_id IS NOT NULL, TRUE, FALSE) AS isWatchlisted
        FROM movies m
        INNER JOIN liked_movies lm ON m.id = lm.movie_id
        LEFT JOIN watchlists w ON m.id = w.movie_id AND w.user_id = ?
        WHERE lm.user_id = ?
      `, [userId, userId]);

      res.status(200).json({ status: 'success', data: { movies } });
    } catch (error) {
      console.error('Error fetching liked movies:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch movies' });
    }
  },

  getWatchlistedMovies: async (req, res) => {
    try {
      const user_id = req.session.user.id; 
        if (!user_id) {
            return res.status(400).json({ status: 'fail', message: 'User ID required' });
        }

        const [movies] = await db.query(`
            SELECT m.id, m.title, m.average_rating, 
                   CONCAT('${process.env.BACKEND_URL}/grid_images/', m.id, '.jpg') AS posterImageUrl,
                   CASE WHEN lm.user_id IS NOT NULL THEN 1 ELSE 0 END AS isLiked,
                   1 AS isWatchlisted
            FROM movies m
            INNER JOIN watchlists w ON m.id = w.movie_id
            LEFT JOIN liked_movies lm ON m.id = lm.movie_id AND lm.user_id = ?
            WHERE w.user_id = ?
        `, [user_id, user_id]);

        res.status(200).json({ status: 'success', data: { movies } });
    } catch (error) {
        console.error('Error fetching watchlisted movies:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch movies' });
    }
}


};

module.exports = MovieFilterController;