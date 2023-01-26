const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertBDObject1 = (dbObj) => {
  return {
    movieName: dbObj.movie_name,
  };
};
const convertBDObject = (dbObj) => {
  return {
    movieName: dbObj.movie_name,
  };
};
const convertSingleObject = (obMovie) => {
  return {
    movieId: obMovie.movie_id,
    directorId: obMovie.director_id,
    movieName: obMovie.movie_name,
    leadActor: obMovie.lead_actor,
  };
};

const convertDirectorObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `select * from movie `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => convertBDObject1(eachMovie)));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `insert into movie(director_id,movie_name,lead_actor) values('${directorId}','${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `select * from movie where movie_id=${movieId};`;
  const movieQuery = await db.get(getMovieQuery);
  response.send(convertSingleObject(movieQuery));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `update movie set 
   director_id=${directorId},
   movie_name='${movieName}',
   lead_actor='${leadActor}' 
   where movie_id=${movieId};
   `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `delete from movie where movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorsQuery = `select * from director order by director_id;`;
  const directorArray = await db.all(directorsQuery);
  response.send(
    directorArray.map((eachDirector) => convertDirectorObject(eachDirector))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const finalQuery = `select * from movie where director_id=${directorId}; `;
  const finalArray = await db.all(finalQuery);
  response.send(finalArray.map((eachMovie) => convertBDObject(eachMovie)));
});

module.exports = app;
