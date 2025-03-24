const db = require('../config/db.config');


const MovieController = {


  //  @get /movie_grid_layout  ---->  list[ json{ movies (id, title, rating ,imageUrl ,isLiked, isWatchlisted)} ]
  getAllMoviesForGridview: async (req, res) => {
    try {
      const user_id  = req.session.user.id;
      if (!user_id) {
        return res.status(400).json({ status: 'fail', message: 'User ID is required' });
      }
  
      const [movies] = await db.query(`
        SELECT 
          m.id, m.title, m.average_rating,
          CASE WHEN lm.user_id IS NOT NULL THEN true ELSE false END AS isLiked,
          CASE WHEN w.user_id IS NOT NULL THEN true ELSE false END AS isWatchlisted
        FROM movies m
        LEFT JOIN liked_movies lm ON m.id = lm.movie_id AND lm.user_id = ?
        LEFT JOIN watchlists w ON m.id = w.movie_id AND w.user_id = ?
        ORDER BY m.title ASC
      `, [user_id, user_id]);
  
      const moviesWithImages = movies.map(movie => ({
        ...movie,
        imageUrl: `${process.env.BACKEND_URL}/grid_posters/${movie.id}.jpg`
      }));
  
      res.status(200).json({
        status: 'success',
        data: {
          movies: moviesWithImages
        }
      });
    } catch (error) {
      console.error('Error getting all movies:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch movies'
      });
    }
  },
  
  NAgetAllMoviesForGridview: async (req, res) => {
    try {      
      const [movies] = await db.query(`
        SELECT 
          m.id, m.title, m.average_rating
        FROM movies m
        ORDER BY m.title ASC`);
  
      const moviesWithImages = movies.map(movie => ({
        ...movie,
        imageUrl: `${process.env.BACKEND_URL}/grid_posters/${movie.id}.jpg`
      }));
  
      res.status(200).json({
        status: 'success',
        data: {
          movies: moviesWithImages
        }
      });
    } catch (error) {
      console.error('Error getting all movies:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch movies'
      });
    }
  },



// @get  /movie/:id    ---> json { id, title, rating ,list [genre], list[crew] ,posterimage ,isLiked,isWatchlisted, themeimage}
getMovieById: async (req, res) => {
  try {
    const { id } = req.params;
    const user_id  = req.session.user.id;

    // Fetch movie details
    const [movieDetails] = await db.query(`
      SELECT * FROM movies WHERE id = ?
    `, [id]);

    if (movieDetails.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Movie not found'
      });
    }

    // Fetch genres for the movie
    const [genres] = await db.query(`
      SELECT g.id, g.name
      FROM genres g
      JOIN movie_genres mg ON g.id = mg.genre_id
      WHERE mg.movie_id = ?
    `, [id]);

    // Fetch cast and crew for the movie
    const [castCrew] = await db.query(`
      SELECT mcc.id, mcc.character_name, mcc.role, 
             p.id AS person_id, p.name
      FROM movie_cast_crew mcc
      JOIN people p ON mcc.person_id = p.id
      WHERE mcc.movie_id = ?
    `, [id]);

    let isLiked = false, isWatchlisted = false;
    
    // If user_id is provided, check liked and watchlisted status
    if (user_id) {
      const [[liked]] = await db.query(`
        SELECT 1 FROM liked_movies WHERE user_id = ? AND movie_id = ?
      `, [user_id, id]);

      const [[watchlisted]] = await db.query(`
        SELECT 1 FROM watchlists WHERE user_id = ? AND movie_id = ?
      `, [user_id, id]);

      isLiked = !!liked;
      isWatchlisted = !!watchlisted;
    }

    // Combine all data
    const movie = movieDetails[0];
    movie.genres = genres;
    movie.castCrew = castCrew;
    movie.posterimageUrl = `${process.env.BACKEND_URL}/grid_images/${movie.id}.jpg`;
    movie.themeimageUrl = `${process.env.BACKEND_URL}/theme_images/${movie.id}.jpg`;
    movie.isLiked = isLiked;
    movie.isWatchlisted = isWatchlisted;

    res.status(200).json({
      status: 'success',
      data: { movie }
    });
  } catch (error) {
    console.error(`Error getting movie with ID ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch movie details'
    });
  }
},


NAgetMovieById: async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch movie details
    const [movieDetails] = await db.query(`
      SELECT * FROM movies WHERE id = ?
    `, [id]);

    if (movieDetails.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Movie not found'
      });
    }

    // Fetch genres for the movie
    const [genres] = await db.query(`
      SELECT g.id, g.name
      FROM genres g
      JOIN movie_genres mg ON g.id = mg.genre_id
      WHERE mg.movie_id = ?
    `, [id]);

    // Fetch cast and crew for the movie
    const [castCrew] = await db.query(`
      SELECT mcc.id, mcc.character_name, mcc.role, 
             p.id AS person_id, p.name
      FROM movie_cast_crew mcc
      JOIN people p ON mcc.person_id = p.id
      WHERE mcc.movie_id = ?
    `, [id]);

    // Combine all data
    const movie = movieDetails[0];
    movie.genres = genres;
    movie.castCrew = castCrew;
    movie.posterimageUrl = `${process.env.BACKEND_URL}/grid_images/${movie.id}.jpg`;
    movie.themeimageUrl = `${process.env.BACKEND_URL}/theme_images/${movie.id}.jpg`;

    res.status(200).json({
      status: 'success',
      data: { movie }
    });
  } catch (error) {
    console.error(`Error getting movie with ID ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch movie details'
    });
  }
},



  // for SEARCH BAR
  //   @get  /search?title="MOVIENAME"  --->  list[ json{ id, title}]
  searchMoviesByTitle: async (req, res) => {
    try {
      const { title } = req.query;
      
      if (!title) {
        return res.status(400).json({
          status: 'fail',
          message: 'Search term is required'
        });
      }

      const [movies] = await db.query(`
        SELECT id, title, average_rating 
        FROM movies
        WHERE title LIKE ?
        ORDER BY title ASC
      `, [`%${title}%`]);

      res.status(200).json({
        status: 'success',
        data: {
          movies
        }
      });
    } catch (error) {
      console.error('Error searching movies:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to search movies'
      });
    }
  },



  

};

module.exports = MovieController;