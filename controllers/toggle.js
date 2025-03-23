const db = require('../config/db.config');


const toggleController = {

toggleLike: async (req, res) => {
    try {
      const { user_id, movie_id } = req.body;
  
      if (!user_id || !movie_id) {
        return res.status(400).json({
          status: 'fail',
          message: 'User ID and Movie ID are required'
        });
      }
  
      // Check if the movie is already liked
      const [[liked]] = await db.query(`
        SELECT 1 FROM liked_movies WHERE user_id = ? AND movie_id = ?
      `, [user_id, movie_id]);
  
      if (liked) {
        // If exists, remove (Unlike)
        await db.query(`
          DELETE FROM liked_movies WHERE user_id = ? AND movie_id = ?
        `, [user_id, movie_id]);
  
        return res.status(200).json({
          status: 'success',
          message: `Movie ${movie_id} removed from liked movies`
        });
      } else {
        // If not exists, add (Like)
        await db.query(`
          INSERT INTO liked_movies (user_id, movie_id) VALUES (?, ?)
        `, [user_id, movie_id]);
  
        return res.status(200).json({
          status: 'success',
          message: `Movie ${movie_id} added to liked movies`
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to toggle like'
      });
    }
  },

  toggleWatchlist: async (req, res) => {
    try {
      const { user_id, movie_id } = req.body;
  
      if (!user_id || !movie_id) {
        return res.status(400).json({
          status: 'fail',
          message: 'User ID and Movie ID are required'
        });
      }
  
      // Check if the movie is already in watchlist
      const [[watchlisted]] = await db.query(`
        SELECT 1 FROM watchlists WHERE user_id = ? AND movie_id = ?
      `, [user_id, movie_id]);
  
      if (watchlisted) {
        // If exists, remove (Remove from watchlist)
        await db.query(`
          DELETE FROM watchlists WHERE user_id = ? AND movie_id = ?
        `, [user_id, movie_id]);
  
        return res.status(200).json({
          status: 'success',
          message: `Movie ${movie_id} removed from watchlist`
        });
      } else {
        // If not exists, add (Add to watchlist)
        await db.query(`
          INSERT INTO watchlists (user_id, movie_id) VALUES (?, ?)
        `, [user_id, movie_id]);
  
        return res.status(200).json({
          status: 'success',
          message: `Movie ${movie_id} added to watchlist`
        });
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to toggle watchlist'
      });
    }
  }
  


};

module.exports = toggleController;