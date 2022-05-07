const connection = require("./db-config")
const express = require("express");
const Joi = require('joi');
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
  if (req.query.color && req.query.max_duration) {
    sql += " WHERE color = ?";
    sqlValues.push(req.query.color);
    sql += " AND duration <= ?";
  }
  sqlValues.push(req.query.max_duration);
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

    const { error } = Joi.object({
      title: Joi.string().max(255).required(),
      director: Joi.string().max(255).required(),
      year: Joi.number().min(1888).required(),
      color: Joi.boolean().required(),
      duration: Joi.number().min(0),
    }).validate({ title, director, year, color, duration }, { abortEarly: false });
    
    if (error) {
      res.status(422).json({ validationErrors: error.details });
    } else {
      connection.query("INSERT INTO movies (title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)", [title, director, year, color, duration],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error saving the movie')
        } else {
          const id = result.insertId;
          const createdMovie = { id, title, director, year, color, duration};
          res.status(201).json(createdMovie);
        }
      }
    );
  }
});

app.put("/api/movies/:movieId", (req, res) => {
  const { movieId } = req.params;
  
  const { title, director, year, color, duration } = req.body;

  const moviePropsToUpdate = req.body;

  const { error } = Joi.object({
  title: Joi.string().max(255),
  director: Joi.string().max(255),
  year: Joi.number().min(1888),
  color: Joi.boolean(),
  duration: Joi.number().min(0),
}).validate({ title, director, year, color, duration }, { abortEarly: false });
  
  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
  connection.query(
    "UPDATE movies SET ? WHERE id = ?", [moviePropsToUpdate, movieId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error udating a movie')
      } else if (result.affectedRows === 0 ){
        res.status(404).send(`Movie with id ${movieId} not found`)
      } else {
        res.sendStatus(204);
      }
    }
  );
}
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
  const { firstname, lastname, email, city, language } = req.body;

  connection.query("SELECT * FROM users WHERE email = ?", [email],

  (err, result) => {
    if (result[0]) {
      res.status(409).json({ message: 'This email is already used' });
    } else {
      const { error } = Joi.object({
        email: Joi.string().email().max(255).required(),
        firstname: Joi.string().max(255).required(),
        lastname: Joi.string().max(255).required(),
        city: Joi.string().max(255),
        language: Joi.string().max(255),
      }).validate({ firstname, lastname, email, city, language }, { abortEarly: false });
      
      if (error) {
        res.status(422).json({ validationErrors: error.details });
      } else {
        connection.query("INSERT INTO users (firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)", [firstname, lastname, email, city, language],
        (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error saving the movie')
          } else {
            const id = result.insertId;
            const createdUser = { id, firstname, lastname, email, city, language};
            res.status(201).json(createdUser);
          }
        }
      );
    }
  }
})
});


app.put("/api/users/:userId", (req, res) => {
  const { userId } = req.params;
  const { firstname, lastname, email, city, language } = req.body;
  const userPropsToUpdate = req.body;

  connection.query("SELECT * FROM users WHERE email = ?", [email],

  (err, result) => {
    if (result[0]) {
      res.status(409).json({ message: 'This email is already used' });
    } else {
      const { error } = Joi.object({
        email: Joi.string().email().max(255),
        firstname: Joi.string().max(255),
        lastname: Joi.string().max(255),
        city: Joi.string().max(255),
        language: Joi.string().max(255),
      }).validate({ firstname, lastname, email, city, language }, { abortEarly: false });
      
      if (error) {
        res.status(422).json({ validationErrors: error.details });
      } else {
  connection.query(
    "UPDATE users SET ? WHERE id = ?", [userPropsToUpdate, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error udating a user')
      } else if (result.affectedRows === 0 ){
        res.status(404).send(`User with id ${userId} not found`)
      } else {
        res.sendStatus(204);
      }
    }
  );
}
}
})
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
