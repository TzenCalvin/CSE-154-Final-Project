/**
 * Name:
 * Date:
 * Section:
 *
 * Description
 */
'use strict';

const express = require('express');
const app = express();

const multer = require('multer');

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

app.use(multer().none());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const SERVER_SIDE_ERROR_MSG = 'Oh no! An error occurred on the server. Try again later.';
const SERVER_SIDE_ERROR_STATUS_CODE = 500;
const CLIENT_SIDE_ERROR_STATUS_CODE = 400;

// gets all of the products' names, shortnames, and prices
app.get('/all/products', async (req, res) => {
  try {
    let db = await getDBConnection();
    let qry = 'SELECT name, shortname, price FROM products';
    let result = await db.all(qry);
    res.type('json').send(result);
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

// Returns a JSON file of all the information about the given project
app.get("/all/products/:product", async (req, res) => {
  try {
    let db = await getDBConnection();
    let product = req.params.product;
    const query = "SELECT * FROM Products WHERE shortname = ?";
    let productInfo = await db.get(query, product);
    await db.close();

    if (productInfo.length === 0) {
      res.type("text")
        .status(400)
        .send("Yikes. Product does not exist.");
    } else {
      res.json(productInfo);
    }
  } catch (err) {
    res.type("text")
      .status(500)
      .send("An error occurred on the server. Try again later.");
  }
});

// checks to see if the username and password are in the database
app.post('/user/login', async (req, res) => {
  try {
    if (req.body.username && req.body.password) {
      let qry = 'SELECT username FROM users WHERE username = ? AND password = ?';
      let db = await getDBConnection();
      let result = await db.all(qry, [req.body.username, req.body.password]);
      await db.close();
      if (result.length === 0) {
        res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
        res.type('text').send('Uh oh! The given username and password do not exist. ' +
          'Please make sure you\'ve entered your information in correctly, otherwise ' +
          'please click the sign up button to create a new account.');
      } else {
        res.type('text').send('success');
      }
    } else {
      res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
      res.type('text').send('Missing username and/or password.');
    }
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

app.post('/user/signup', async (req, res) => {
  try {
    if (req.body.email && req.body.username && req.body.password) {
      let qry = 'SELECT username FROM users WHERE email = ? AND username = ? AND password = ?';
      let db = await getDBConnection();
      let result = await db.all(qry, [req.body.username, req.body.password]);
      await db.close();
      if (result.length === 0) {
        res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
        res.type('text').send('Uh oh! The given username and password do not exist. ' +
          'Please make sure you\'ve entered your information in correctly, otherwise ' +
          'please click the sign up button to create a new account.');
      } else {
        res.type('text').send('success');
      }
    } else {
      res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
      res.type('text').send('Missing username and/or password.');
    }
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'fp.db',
    driver: sqlite3.Database
  });

  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);