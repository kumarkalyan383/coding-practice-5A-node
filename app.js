const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// GET all the movies
app.get("/movies/", async (require, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };

  const allMoviesQuery = `
        SELECT * FROM movie
        ORDER BY movie_id
    `;
  const allMovies = await db.all(allMoviesQuery);
  const result = allMovies.map((eachMovie) =>
    convertDbObjectToResponseObject(eachMovie)
  );
  response.send(result);
});

// Post a new movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const postMovieQuery = `
        INSERT INTO movie (director_id,movie_name,lead_actor)
        VALUES (6,"Jurassic Park","Jeff Goldblum")`;
  const result = await db.run(postMovieQuery);
  const movieId = result.lastID;
  response.send("Movie Successfully Added");
});

// GET a movie
app.get("/movies/:movieId/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };

  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * FROM movie 
        WHERE movie_id = ${movieId}
    `;
  const movie = await db.get(getMovieQuery);
  const result = convertDbObjectToResponseObject(movie);
  response.send(result);
});

// UPDATE a movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const updateQuery = `
        UPDATE movie 
        SET 
        director_id = 24,
        movie_name = "Thor",
        lead_actor = "Christopher Hemsworth"
        WHERE movie_id = ${movieId}
    `;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});
// DELETE a movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE FROM 
        movie 
        WHERE
        movie_id = ${movieId}
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

// GET all directors
app.get("/directors/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };

  const allDirectorsQuery = `
        SELECT * FROM director 
        ORDER BY director_id
    `;
  const allDirectors = await db.all(allDirectorsQuery);
  const result = allDirectors.map((eachDirector) =>
    convertDbObjectToResponseObject(eachDirector)
  );
  response.send(result);
});

// GET movies of a director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };

  const { directorId } = request.params;
  const movieDirector = `
        SELECT * FROM 
        movie 
        WHERE 
        director_id = ${directorId}
    `;
  const directorMovies = await db.all(movieDirector);
  const result = directorMovies.map((each) =>
    convertDbObjectToResponseObject(each)
  );
  response.send(result);
});
module.exports = app;
