const connection = require("./db-config")
const express = require("express");
const app = express();

const port = process.env.PORT ?? 3000;

require("dotenv").config();

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
  } else {
    console.log('connected to database with threadId :  ' + connection.threadId);
  }
});

app.use(express.json());

app.get("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  connection.query("SELECT * FROM movies WHERE id = ?",[movieId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving data from database')
    } else {
      result.length === 0 ? res.status(404).send('Movie not found') : res.status(200).json(result[0]);
    }
  })
});

app.get("/api/movies", (req, res) => {
  let sql = "SELECT * FROM movies";
  const sqlValues = [];
  if (req.query.color) {
    sql += " WHERE color = ?";
    sqlValues.push(req.query.color);
  }
  if (req.query.max_duration) {
    sql += " WHERE duration <= ?";
    sqlValues.push(req.query.max_duration);
  }
  if (req.query.color && req.query.max_duration){
    sql += " WHERE color = ? AND duration <= ?"
    sqlValues.push(req.query.color, req.query.max_duration)
  }
  connection.query(sql, sqlValues, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving data from database')
    } else {
      res.status(200).json(result);
    }
  })
});


app.post("/api/movies", (req, res) => {
  const { title, director, year, color, duration } = req.body;
connection.query("INSERT INTO movies (title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)", [title, director, year, color, duration],
(err, result) => {
  if (err) {
    console.error(err);
    res.status(500).send('Error saving the movie')
  } else {
    res.status(200).send('Movie successfully saved');
  }
}
);
});

app.put("/api/movies/:movieId", (req, res) => {
  const { movieId } = req.params;
  const moviePropsToUpdate = req.body;
  connection.query(
    "UPDATE movies SET ? WHERE id = ?", [moviePropsToUpdate, movieId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error udating a movie')
      } else {
        res.status(200).send('Movie successfully udpated');
      }
    }
  )
 });

 app.delete("/api/movies/:id", (req,res) => {
  const movieId = req.params.id;
  connection.query("DELETE FROM movies WHERE id = ?", [movieId],
  (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("😱 Error deleting a movie");
    } else {
      res.sendStatus(204);
    }
  }
  );
 })

app.get("/api/users", (req, res) => {
  let sql = "SELECT * FROM users";
  const sqlValues = [];
  if (req.query.language) {
    sql += " WHERE language = ?";
    sqlValues.push(req.query.language);
  } 
  connection.query(sql, sqlValues, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving data from database')
    } else {
      res.status(200).json(result);
    }
  })
});

app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  connection.query("SELECT * FROM users WHERE id = ?",[userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving data from database')
    } else {
      result.length === 0 ? res.status(404).send('User not found') : res.status(200).json(result[0]);
    }
  })
});

app.post("/api/users", (req, res) => {
  const { firstname, lastname, email } = req.body;
  connection.query("INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)", [firstname, lastname, email],
  (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving the movie')
    } else {
      res.status(200).send('Users successfully saved');
    }
  });
});

app.put("/api/users/:userId", (req, res) => {
  const { userId } = req.params;
  const userPropsToUpdate = req.body;
  connection.query(
    "UPDATE users SET ? WHERE id = ?", [userPropsToUpdate, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error udating a user')
      } else {
        res.status(200).send('Users updated successfully')
      }
    }
  )
 });

 app.delete("/api/users/:id", (req,res) => {
  const userId = req.params.id;
  connection.query("DELETE FROM users WHERE id = ?", [userId],
  (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("😱 Error deleting an user");
    } else {
      res.sendStatus(204);
    }
  }
  );
 })


// We listen to incoming request on the port defined above
app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
