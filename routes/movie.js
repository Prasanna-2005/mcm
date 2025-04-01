const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require('fs');

const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      let dest;
      if (file.fieldname === 'grid_img') {
        dest = path.join(__dirname, '../../CLIENT/uploads/grid_images');
      } else {
        dest = path.join(__dirname, '../../CLIENT/uploads/theme_images');
      }
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      cb(null, dest);
    },
    filename: function(req, file, cb) {
      cb(null, req.params.id + path.extname(file.originalname));
    }
  })
});


// *******************************************************************************************************************************
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // User is authenticated, proceed
  }
  res.redirect("/login"); // Redirect to login if not authenticated
};
// *******************************************************************************************************************************



router.get("/view-movies", isAuthenticated, async (req, res) => {
  try {
    let movieMap = new Map();
    const [movies] = await db.query(
      "SELECT m.*, u.username as created_by_user FROM movies m LEFT JOIN users u ON u.id = m.created_by;"
    );
    for (let movie of movies) {
      movieMap.set(movie?.id, movie);
    }

    // get movie genres
    const [movieGenres] = await db.query(
      "SELECT mg.*, g.name FROM movie_genres mg JOIN genres g ON g.id = mg.genre_id;"
    );

    for (let movieGenre of movieGenres) {
      let movieId = movieGenre?.movie_id;
      let movieRecord = movieMap.get(movieId);
      if (!movieRecord.genres) {
        movieRecord.genres = [];
      }
      movieRecord?.genres?.push(movieGenre.name);
      movieMap.set(movieId, movieRecord);
    }

    // get movie casts
    const [movieCasts] = await db.query(
      "select mc.*, p.name as person_name from movie_cast_crew mc JOIN people p ON mc.person_id = p.id;"
    );

    for (let movieCast of movieCasts) {
      let movieId = movieCast?.movie_id;
      let movieRecord = movieMap.get(movieId);
      if (!movieRecord.casts) {
        movieRecord.casts = [];
      }
      movieRecord?.casts?.push({
        character_name: movieCast.character_name,
        person_name: movieCast.person_name,
        role: movieCast.role,
      });
      movieMap.set(movieId, movieRecord);
    }

    let moviesList = [];
    for (let [key, value] of movieMap) {
      moviesList.push(value);
    }

    res.render("movies", {
      moviesList,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching movies");
  }
});


// separate route for adding movie
router.get("/add-movie", isAuthenticated, async (req, res) => {
  try {
    const [genres] = await db.query("SELECT * FROM genres");
    const [people] = await db.query("SELECT * FROM people");
    res.render("addMovie", {
      genres,
      people,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching genres or people");
  }
});



const uploadFiles = upload.fields([
  { name: "grid_img", maxCount: 1 },
  { name: "poster_img", maxCount: 1 },
]);

// post request for adding movie
router.post("/add-movie", isAuthenticated, uploadFiles, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const {
      title,
      rating,
      release_year,
      runtime,
      synopsis,
      language,
      country,
      genres,
      casts,
    } = req.body;

    const created_by = req.session.user.id;

    const [result] = await connection.query(
      "INSERT INTO movies (title, release_year, runtime,average_rating, synopsis, language, country, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        release_year,
        runtime || null,
        rating||null,
        synopsis || null,
        language || null,
        country || null,
        created_by,
      ]
    );

    const movieId = result.insertId;
    if (req.files["grid_img"]) {
      const gridImgFile = req.files["grid_img"][0];
      const newGridImgPath = path.join(
        gridImgFile.destination,
        `${movieId}${path.extname(gridImgFile.originalname)}`
      );
      fs.renameSync(gridImgFile.path, newGridImgPath);
    }

    if (req.files["poster_img"]) {
      const posterImgFile = req.files["poster_img"][0];
      const newPosterImgPath = path.join(
        posterImgFile.destination,
        `${movieId}${path.extname(posterImgFile.originalname)}`
      );
      fs.renameSync(posterImgFile.path, newPosterImgPath);
    }
      if (genres) {
        const genreValues = Array.isArray(genres) ? genres : [genres];
        for (const genreId of genreValues) {
          await connection.query("INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)", [movieId, genreId]);
        }
      }

      // Insert casts into the movie_cast_crew table
      if (req.body["casts[0][person_id]"]) {
        const castCount = Object.keys(req.body).filter((key) => key.match(/casts\[\d+\]\[person_id\]/)).length;
        for (let i = 0; i < castCount; i++) {
          const personId = req.body[`casts[${i}][person_id]`];
          const role = req.body[`casts[${i}][role]`];
          const characterName = req.body[`casts[${i}][character_name]`] || null;

          if (personId && role) {
            await connection.query(
              "INSERT INTO movie_cast_crew (movie_id, person_id, character_name, role) VALUES (?, ?, ?, ?)",
              [movieId, personId, characterName, role]
            );
          }
        }
      } else if (casts && typeof casts === "object") {
        for (const index in casts) {
          const cast = casts[index];
          if (cast.person_id && cast.role) {
            await connection.query(
              "INSERT INTO movie_cast_crew (movie_id, person_id, character_name, role) VALUES (?, ?, ?, ?)",
              [movieId, cast.person_id, cast.character_name || null, cast.role]
            );
          }
        }
      }

      await connection.commit();
      res.redirect("/view-movies");
    }

    catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).send("Error adding movie: " + error.message);
  } finally {
    connection.release();
  }
});



router.delete("/delete-movie/:id", isAuthenticated, async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const movieId = req.params.id;

    // Fetch movie details including image paths
    const [movie] = await connection.query("SELECT * FROM movies WHERE id = ?", [movieId]);

    if (movie.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Movie not found" });
    }

    // Define image paths
    const gridImgPath = path.join(__dirname, `../uploads/grid_images/${movieId}.jpeg`);
    const posterImgPath = path.join(__dirname, `../uploads/theme_images/${movieId}.jpeg`);

    // Delete image files if they exist
    [gridImgPath, posterImgPath].forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete movie record
    await connection.query("DELETE FROM movies WHERE id = ?", [movieId]);

    await connection.commit();
    res.json({ message: "Movie and images deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Error deleting movie: " + error.message });
  } finally {
    connection.release();
  }
});






// Get route for editing a movie
router.get("/edit-movie/:id", isAuthenticated, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const movieId = req.params.id;

    // Get movie details
    const [movies] = await connection.query(
      "SELECT * FROM movies WHERE id = ?",
      [movieId]
    );

    if (movies.length === 0) {
      return res.status(404).send("Movie not found");
    }

    const movie = movies[0];

    // Get genres for the movie
    const [movieGenres] = await connection.query(
      "SELECT genre_id FROM movie_genres WHERE movie_id = ?",
      [movieId]
    );

    // Get all available genres
    const [genres] = await connection.query("SELECT * FROM genres");

    // Get cast and crew for the movie
    const [movieCasts] = await connection.query(
      "SELECT * FROM movie_cast_crew WHERE movie_id = ?",
      [movieId]
    );

    // Get all available people
    const [people] = await connection.query("SELECT * FROM people");

    res.render("editMovie", {
      movie,
      movieGenres: movieGenres.map((g) => g.genre_id),
      movieCasts,
      genres,
      people,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching movie data: " + error.message);
  } finally {
    connection.release();
  }
});







// Apply the middleware directly to the route
router.post("/update-movie/:id", upload.any(), async (req, res) => {
  
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const movieId = req.params.id;
    const {
      title,
      release_year,
      rating,
      runtime,
      synopsis,
      language,
      country,
      genres,
      casts,
    } = req.body;
   
    // Update movie details in the movies table
    await connection.query(
      "UPDATE movies SET title = ?, release_year = ?, average_rating = ?, runtime = ?, synopsis = ?, language = ?, country = ? WHERE id = ?",
      [
        title,
        release_year,
        rating,
        runtime || null,
        synopsis || null,
        language || null,
        country || null,
        movieId,
      ]
    );

    // Delete existing genres and re-insert them
    await connection.query("DELETE FROM movie_genres WHERE movie_id = ?", [movieId]);

    if (genres) {
      const genreValues = Array.isArray(genres) ? genres : [genres];
      for (const genreId of genreValues) {
        await connection.query("INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)", [movieId, genreId]);
      }
    }

    // Delete existing cast and crew and re-insert them
    await connection.query("DELETE FROM movie_cast_crew WHERE movie_id = ?", [movieId]);

    if (req.body["casts[0][person_id]"]) {
      const castCount = Object.keys(req.body).filter((key) => key.match(/casts\[\d+\]\[person_id\]/)).length;
      for (let i = 0; i < castCount; i++) {
        const personId = req.body[`casts[${i}][person_id]`];
        const role = req.body[`casts[${i}][role]`];
        const characterName = req.body[`casts[${i}][character_name]`] || null;

        if (personId && role) {
          await connection.query(
            "INSERT INTO movie_cast_crew (movie_id, person_id, character_name, role) VALUES (?, ?, ?, ?)",
            [movieId, personId, characterName, role]
          );
        }
      }
    } else if (casts && typeof casts === "object") {
      for (const index in casts) {
        const cast = casts[index];
        if (cast.person_id && cast.role) {
          await connection.query(
            "INSERT INTO movie_cast_crew (movie_id, person_id, character_name, role) VALUES (?, ?, ?, ?)",
            [movieId, cast.person_id, cast.character_name || null, cast.role]
          );
        }
      }
    }

    await connection.commit();
    res.redirect("/view-movies");
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).send("Error updating movie: " + error.message);
  } finally {
    connection.release();
  }
});

module.exports = router;
