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
let loggedIn = false;

// gets all of the products' names, shortnames, and prices
app.get('/all/products', async (req, res) => {
  try {
    let db = await getDBConnection();
    let search = req.query.search;
    let qry;
    let result;

    if (search) {
      qry = 'SELECT DISTINCT name, shortname, price FROM products WHERE (name LIKE ? OR' +
      ' description LIKE ? OR color LIKE ?) ORDER BY id';
      result = await db.all(qry, ['%' + search + '%', '%' + search + '%', '%' + search + '%']);
    } else {
      qry = 'SELECT name, shortname, price FROM products';
      result = await db.all(qry);
    }

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
        .status(CLIENT_SIDE_ERROR_STATUS_CODE)
        .send("Yikes. Product does not exist.");
    } else {
      res.json(productInfo);
    }
  } catch (err) {
    res.type("text")
      .status(SERVER_SIDE_ERROR_STATUS_CODE)
      .send(SERVER_SIDE_ERROR_MSG);
  }
});

// app.get('/transaction/successful', async (req, res) => {

// });

// checks if the transaction is successful or not
app.post('/transaction/status', async (req, res) => {
  try {
    if (req.body.number && req.body.date && req.body.cvv) {
      if (req.body.number.length === 16 && !isNaN(req.body.number)) {
        if (req.body.date.length === 5) {
          let date = req.body.date.split('/');
          let month = date[0];
          let year = date[1];
          if (!isNaN(month) && !isNaN(year) && parseInt(month) <= 12 && parseInt(month) > 0 &&
          parseInt(year) < 100 && parseInt(year) > 22) {
            if (req.body.cvv.length === 3 && !isNaN(req.body.cvv)) {
              res.type('text').send('success');
            } else {
              sendInvalidCvvMsg(res);
            }
          } else {
            sendInvalidExpirationDateLength(res);
          }
        } else {
          sendInvalidExpirationDateLength(res);
        }
      } else {
        sendInvalidCreditCardMsg(res);
      }
    } else {sendMissingParamsMsg(res);}
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

/**
 * Sends an error message saying that one of the required params is missing.
 * @param {Promise<object>} res - response from API.
 */
function sendMissingParamsMsg(res) {
  res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
  res.type('text').send('Missing credit card number and/or expiration date and/or CVV.');
}

/**
 * Sends an error message saying that the given expiration date invalid.
 * @param {Promise<object>} res - response from API.
 */
function sendInvalidExpirationDateLength(res) {
  res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
  res.type('text').send('Invalid expiration date. Be sure to put in a valid month and year in ' +
  'the form of MM/YY including the \'/\' in your input.');
}

/**
 * Sends an error message saying that the given CVV number is invalid.
 * @param {Promise<object>} res - response from API.
 */
function sendInvalidCvvMsg(res) {
  res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
  res.type('text').send('Invalid CVV. Please input a valid 3 digit CVV number.');
}

/**
 * Sends an error message saying that the given credit card number is invalid.
 * @param {Promise<object>} res - response from API.
 */
function sendInvalidCreditCardMsg(res) {
  res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
  res.type('text').send('Invalid credit card number.');
}

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
        loggedIn = true;
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

// adds the given new user's information to the database
app.post('/user/signup', async (req, res) => {
  try {
    if (req.body.email && req.body.username && req.body.password) {
      let db = await getDBConnection();
      if (await uniqueUsername(req.body.username, db) !== undefined) {
        await db.close();
        res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
        res.type('text').send('Username already exists. Please choose a different username.');
      } else if (await uniqueEmail(req.body.email, db) !== undefined) {
        await db.close();
        res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
        res.type('text').send('The given email is already associated with an account. ' +
          'Enter a new email or enter the correct username and password for the previous email.');
      } else {
        let qry = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
        await db.run(qry, [req.body.email, req.body.username, req.body.password]);
        await db.close();
        loggedIn = true;
        res.type('text').send('success');
      }
    } else {
      res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
      res.type('text').send('Missing required email and/or username and/or password.');
    }
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

/**
 * Checks that the given username is not already in the database table
 * @param {string} username - inputed by the user
 * @param {sqlite.Database} db - connection to the database table
 * @returns {JSON} - returns a JSON object indicating the username is already in
 * the database table, otherwise returns undefined indicating the username is unique
 */
async function uniqueUsername(username, db) {
  let qryUsername = 'SELECT username FROM users WHERE username = ?';
  let usernameResult = await db.get(qryUsername, [username]);
  return usernameResult;
}

/**
 * Checks that the given email is not already in the database table
 * @param {string} email - inputed by the user
 * @param {sqlite.Database} db - connection to the database table
 * @returns {JSON} - returns a JSON object indicating the email is already in
 * the database table, otherwise returns undefined indicating the email is unique
 */
async function uniqueEmail(email, db) {
  let qryEmail = 'SELECT email FROM users WHERE email = ?';
  let emailResult = await db.get(qryEmail, [email]);
  return emailResult;
}

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