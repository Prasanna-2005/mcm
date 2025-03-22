const db = require('../config/db.config');


const MovieController = {
    // Get all movies (id, title, rating) with image
    getAllMovies: async (req, res) => {
      try {
        const [movies] = await db.query(`
          SELECT id, title, average_rating 
          FROM movies
          ORDER BY title ASC
        `);
  
        // Append image URL dynamically
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
    }
,
  




getMovieById: async (req, res) => {
  try {
    const movieId = req.params.id;
    
    // Fetch movie details
    const [movieDetails] = await db.query(`
      SELECT m.* 
      FROM movies m
      WHERE m.id = ?
    `, [movieId]);

    if (movieDetails.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Movie not found'
      });
    }

    // Get genres for the movie
    const [genres] = await db.query(`
      SELECT g.id, g.name
      FROM genres g
      JOIN movie_genres mg ON g.id = mg.genre_id
      WHERE mg.movie_id = ?
    `, [movieId]);

    // Get cast and crew for the movie
    const [castCrew] = await db.query(`
      SELECT mcc.id, mcc.character_name, mcc.role, 
             p.id AS person_id, p.name
      FROM movie_cast_crew mcc
      JOIN people p ON mcc.person_id = p.id
      WHERE mcc.movie_id = ?
    `, [movieId]);

    // Combine all data
    const movie = movieDetails[0];
    movie.genres = genres;
    movie.castCrew = castCrew;
    
    // Add image URL
    movie.posterimageUrl = `${process.env.BACKEND_URL}/grid_images/${movie.id}.jpg`;
    movie.themeimageUrl = `${process.env.BACKEND_URL}/theme_images/${movie.id}.jpg`;

    res.status(200).json({
      status: 'success',
      data: {
        movie
      }
    });
  } catch (error) {
    console.error(`Error getting movie with ID ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch movie details'
    });
  }
},




  // Search movies by title
  searchMovies: async (req, res) => {
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
  }
  ,



getAllMoviesWithDetails: async (req, res) => {
  try {
    console.log(1);
    // Fetch all movies
    const [movies] = await db.query(`
      SELECT * FROM movies
      ORDER BY title ASC
    `);
  

    if (movies.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No movies found'
      });
    }

    // Fetch genres for all movies
    const [movieGenres] = await db.query(`
      SELECT mg.movie_id, g.id AS genre_id, g.name AS genre_name
      FROM movie_genres mg
      JOIN genres g ON mg.genre_id = g.id
    `);

    // Fetch cast and crew for all movies
    const [castCrew] = await db.query(`
      SELECT mcc.movie_id, mcc.id AS cast_id, mcc.character_name, mcc.role, 
             p.id AS person_id, p.name 
      FROM movie_cast_crew mcc
      JOIN people p ON mcc.person_id = p.id
    `);

    // Process movies to include genres, cast, crew, and image URL
    const moviesWithDetails = movies.map(movie => {
      return {
        ...movie,
        genres: movieGenres
          .filter(g => g.movie_id === movie.id)
          .map(g => ({ id: g.genre_id, name: g.genre_name })),
        castCrew: castCrew
          .filter(c => c.movie_id === movie.id)
          .map(c => ({
            id: c.cast_id,
            personId: c.person_id,
            name: c.name,
            characterName: c.character_name,
            role: c.role
          })),
          posterimageUrl : `${process.env.BACKEND_URL}/grid_images/${movie.id}.jpg`,
         themeimageUrl : `${process.env.BACKEND_URL}/theme_images/${movie.id}.jpg`
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        movies: moviesWithDetails
      }
    });
  } catch (error) {
    console.error('Error fetching all movies with details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch movie details'
    });
  }
},

};

module.exports = MovieController;