const express = require("express");
const router = express.Router();
const db = require("../config/db");

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // User is authenticated, proceed
  }
  res.redirect("/login"); // Redirect to login if not authenticated
};

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
      console.log(key + " is " + value);
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

// post request for adding movie
router.post("/add-movie", isAuthenticated, async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      title,
      release_year,
      runtime,
      synopsis,
      language,
      country,
      genres,
      casts,
    } = req.body;

    const created_by = req.session.user.id;

    // Insert movie into the movies table
    const [result] = await connection.query(
      "INSERT INTO movies (title, release_year, runtime, synopsis, language, country, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        release_year,
        runtime || null,
        synopsis || null,
        language || null,
        country || null,
        created_by,
      ]
    );

    const movieId = result.insertId;

    // Insert genres into the movie_genres table
    if (genres) {
      // Handle both single genre and multiple genres
      const genreValues = Array.isArray(genres) ? genres : [genres];

      for (const genreId of genreValues) {
        await connection.query(
          "INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)",
          [movieId, genreId]
        );
      }
    }

    // Insert casts into the movie_cast_crew table
    // Check if casts is an array or if it needs to be processed from the form data
    if (req.body["casts[0][person_id]"]) {
      // Form is submitting flat data structure
      const castCount = Object.keys(req.body).filter((key) =>
        key.match(/casts\[\d+\]\[person_id\]/)
      ).length;

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
      // Handle the possibility that casts is an object with numeric keys
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
    res.status(500).send("Error adding movie: " + error.message);
  } finally {
    connection.release();
  }
});

// delete movie route
router.delete("/delete-movie/:id", isAuthenticated, async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const movieId = req.params.id;

    // Check if movie exists
    const [movie] = await connection.query(
      "SELECT * FROM movies WHERE id = ?",
      [movieId]
    );

    if (movie.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Movie not found" });
    }

    // Delete the movie (cascade will handle related records)
    await connection.query("DELETE FROM movies WHERE id = ?", [movieId]);

    await connection.commit();
    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Error deleting movie: " + error.message });
  } finally {
    connection.release();
  }
});

// // Add this to ensure the router is properly registered to handle the delete route
// // This ensures Express can find the delete route even if it's called from the root path
// router.use((req, res, next) => {
//   // Check if the request is for the delete movie endpoint
//   if (req.method === "DELETE" && req.url.startsWith("/delete-movie/")) {
//     const movieId = req.url.split("/").pop();
//     req.params = { id: movieId };
//     return router.handle(req, res, next);
//   }
//   next();
// });

module.exports = router;
