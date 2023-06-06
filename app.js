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

const cookieParser = require('cookie-parser');

app.use(multer().none());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

const SERVER_SIDE_ERROR_MSG = 'Oh no! An error occurred on the server. Try again later.';
const SERVER_SIDE_ERROR_STATUS_CODE = 500;
const CLIENT_SIDE_ERROR_STATUS_CODE = 400;

// gets all of the products' names, shortnames, and prices based on the given parameters
app.get('/products', async (req, res) => {
  try {
    let db = await getDBConnection();
    let search = req.query.search;
    let itemType = req.query.type;
    let maxPrice = req.query.price;
    let maxSize = req.query.size;
    let qry = 'SELECT DISTINCT name, shortname, price FROM products';
    let result;

    if (search && itemType && maxPrice && maxSize) {
      qry = qry + ' WHERE (name LIKE ? OR description LIKE ? OR color LIKE ?) AND `item-type` = ?' +
      ' AND price <= ? AND `pot-size` <= ? ORDER BY id';
      result = await db.all(qry, advSearch(search, itemType, maxPrice, maxSize));
    } else if (search) {
      qry = qry + ' WHERE (name LIKE ? OR description LIKE ? OR color LIKE ?) ORDER BY id';
      result = await db.all(qry, ['%' + search + '%', '%' + search + '%', '%' + search + '%']);
    } else {
      result = await db.all(qry);
    }

    res.type('json').send(result);
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

// Returns a JSON file of all the information about the given project
app.get("/products/:product", async (req, res) => {
  try {
    let db = await getDBConnection();
    let product = req.params.product;
    let checkProduct = await db.get("SELECT COUNT(*) AS count FROM Products WHERE shortname = " +
    "?", product);
    if (checkProduct.count === 0) {
      res.type("text")
        .status(CLIENT_SIDE_ERROR_STATUS_CODE)
        .send("Yikes. Product does not exist.");
    }
    const query = "SELECT * FROM Products WHERE shortname = ?";
    let productInfo = await db.get(query, product);
    await db.close();
    res.json(productInfo);
  } catch (err) {
    res.type("text")
      .status(SERVER_SIDE_ERROR_STATUS_CODE)
      .send(SERVER_SIDE_ERROR_MSG);
  }
});

// updates the database for the successful transaction and returns the transaction confirmation code
app.post('/transaction/successful', async (req, res) => {
  try {
    if (loggedIn(req)) {
      if (req.body.cart) {
        let cart = JSON.parse(req.body.cart);
        let items = cart.items;
        let itemsObject = {'items': items};
        let db = await getDBConnection();
        for (let i = 0; i < items.length; i++) {
          let capacityQry = 'SELECT capacity FROM products WHERE name = ?';
          let capacityResult = await db.get(capacityQry, items[i].name);
          await updateCapacity(capacityResult, db, items[i].name, items[i].quantity);
        }
        let confirmationNumber = await getConfirmationNumber(cart, itemsObject, db);
        await db.close();
        res.type('text').send(confirmationNumber.confirmation + '');
      } else {
        res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
        res.type('text').send('Missing cart body param.');
      }
    } else {
      res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
      res.type('text').send('You must be logged in before purchasing something.');
    }
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

/**
 * Returns the confirmation code of the given successful transaction.
 * @param {JSON} cart - the username and the items of the transaction.
 * @param {JSON} itemsObject - items of the transaction.
 * @param {sqlite.Database} db - connection to the database table.
 * @returns {JSON} - object containing the confimation code for the transaction.
 */
async function getConfirmationNumber(cart, itemsObject, db) {
  let usernameQry = 'SELECT id FROM users WHERE username = ?';
  let usernameResult = await db.get(usernameQry, cart.username);
  let transactionQry = 'INSERT INTO transactions (products, userid) VALUES (?, ?)';
  await db.get(transactionQry, [JSON.stringify(itemsObject), usernameResult.id]);
  let confirmationQry = 'SELECT confirmation FROM transactions ORDER BY confirmation DESC';
  let confirmationNumber = await db.get(confirmationQry);
  return confirmationNumber;
}

/**
 * Checks to see if the capacity is null. If not, updates the databse accordingly.
 * @param {JSON} capacityResult - capacity from the database for a certain product.
 * @param {sqlite.Database} db - connection to the database table.
 * @param {int} item - product id.
 * @param {int} quantity - number of product purchased.
 */
async function updateCapacity(capacityResult, db, item, quantity) {
  if (capacityResult.capacity !== null) {
    let capacityUpdate = 'UPDATE products SET capacity = (capacity - ?) WHERE name = ?';
    await db.get(capacityUpdate, [quantity, item]);
  }
}

/**
 * Checks to see if the user is logged in or not.
 * @param {object} req - request from user.
 * @returns {boolean} - true if the user is logged in, false otherwise.
 */
function loggedIn(req) {
  if (req.cookies['logged-in'] === 'true') {
    return true;
  }
  return false;
}

// checks if the transaction is successful or not
app.post('/transaction/status', (req, res) => {
  try {
    if (loggedIn(req)) {
      if (validateTransactionStatusRequest(req, res)) {
        res.type('text').send('success');
      }
    } else {
      res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
      res.type('text').send('You must be logged in before purchasing something.');
    }
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

/**
 * Validates the request for /transaction/status.
 * @param {object} req - request from user.
 * @param {object} res - response from API.
 * @returns {boolean} - returns true if the request is valid, otherwise false.
 */
function validateTransactionStatusRequest(req, res) {
  if (!(req.body.number && req.body.date && req.body.cvv)) {
    res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
    res.type('text').send('Missing one or more of the required params.');
    return false;
  }
  if (!(req.body.number.length === 16 && !isNaN(req.body.number))) {
    res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
    res.type('text').send('Invalid credit card number.');
    return false;
  }
  if (!(req.body.date.length === 5)) {
    res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
    res.type('text').send('Invalid expiration date. Be sure to put in a valid month and year in ' +
    'the form of MM/YY including the \'/\' in your input.');
    return false;
  }
  if (!validateDate(req, res)) {
    return false;
  }
  if (!(req.body.cvv.length === 3 && !isNaN(req.body.cvv))) {
    res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
    res.type('text').send('Invalid credit card number.');
    return false;
  }
  return true;
}

/**
 * Checks to see if the given expiration date is valid.
 * @param {object} req - request from user.
 * @param {object} res - response from API.
 * @returns {boolean} - returns true if the date is valid, otherwise false.
 */
function validateDate(req, res) {
  let date = req.body.date.split('/');
  let month = date[0];
  let year = date[1];
  if (!(!isNaN(month) && !isNaN(year) && parseInt(month) <= 12 && parseInt(month) > 0 &&
  parseInt(year) < 100 && parseInt(year) > 22)) {
    res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
    res.type('text').send('Invalid expiration date. Be sure to put in a valid month and year in ' +
    'the form of MM/YY including the \'/\' in your input.');
    return false;
  }
  return true;
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
        res.type('text').send('success');
      }
    } else {
      res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
      res.type('text').send('Missing one or more of the required params.');
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
      if (await uniqueUsername(req.body.username, db)) {
        await db.close();
        res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
        res.type('text').send('Username already exists. Please choose a different username.');
      } else if (await uniqueEmail(req.body.email, db)) {
        await db.close();
        res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
        res.type('text').send('The given email is already associated with an account. ' +
          'Enter a new email or enter the correct username and password for the previous email.');
      } else {
        let qry = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
        await db.run(qry, [req.body.email, req.body.username, req.body.password]);
        await db.close();
        res.type('text').send('success');
      }
    } else {
      res.status(CLIENT_SIDE_ERROR_STATUS_CODE);
      res.type('text').send('Missing one or more of the required params.');
    }
  } catch (err) {
    res.status(SERVER_SIDE_ERROR_STATUS_CODE);
    res.type('text').send(SERVER_SIDE_ERROR_MSG);
  }
});

/**
 * Creates an array with all the conditions that is usable in a search query.
 * @param {string} search - search query submitted by the user
 * @param {string} itemType - desired item type submitted by the user
 * @param {int} maxPrice - desired max price submitted by the user
 * @param {int} maxSize - desired max pot size submitted by the user
 * @returns {array} - returns an array with all the conditions in a format that is usable in a
 * search query.
 */
function advSearch(search, itemType, maxPrice, maxSize) {
  return ['%' + search + '%', '%' + search + '%', '%' + search + '%', itemType, maxPrice, maxSize];
}

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