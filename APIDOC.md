# Final Project API Documentation
The Final Project API provides information about the various plants on our website and handling user logins and transactions.

## Endpoint 1 - Get Basic Product Information.
**Request Format:** `/products`

**Query Parameters:** `search`, `type`, `price`, `size` (optional)

**Request Type:** `GET`

**Returned Data Format**: JSON

**Description 1:** If no `search`, `type`, `price`, or `size` parameter is passed in, returns a JSON of the names, shortnames, and prices of every product in our item catalog in order of item id.

**Example Request 1:** `/products`

**Example Response 1:** (abbreviated)
```json
[
  {
    "name": "Pothos",
    "shortname": "pothos",
    "price": 5
  },
  {
    "name": "Snake Plant",
    "shortname": "snake-plant",
    "price": 5
  },
  {
    "name": "Jade Plant",
    "shortname": "jade-plant",
    "price": 8
  },
  ...
]
```
**Description 2:** If a `search` parameter is passed in, but no `type`, `price`, or `size` parameter, returns a JSON of the names, shortnames, and prices of every product in our item catalog that has the search query anywhere in its name, item description, or color. Results are in order of item id.

**Example Request 2:** `/products?search=house plant`

**Example Response 2:**
```json
[
  {
    "name": "Money Tree",
    "shortname": "money-tree",
    "price": 7
  },
  {
    "name": "Peace Lily",
    "shortname": "peace-lily",
    "price": 5
  },
  {
    "name": "Heartleaf Philodendron",
    "shortname": "heartleaf-philodendron",
    "price": 8
  }
]
```
**Description 3:** If a `search`, `type`, `price`, or `size` parameter is passed in, returns a JSON of the names, shortnames, and prices of every product in our item catalog that has the search query anywhere in its name, item description, or color, as well as having matching item types and the price and pot size be at maximum the given values for each field. Results are in order of item id.

**Example Request 3:** `/products?search=house plant&type=plant&price=7&size=4`

**Example Response 3:**
```json
[
  {
    "name": "Money Tree",
    "shortname": "money-tree",
    "price": 7
  }
]
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Oh no! An error occurred on the server. Try again later.`

## Endpoint 2 - Get All Information of a Product.
**Request Format:** `/products/:product`

**Query Parameters:** none.

**Request Type:** `GET`

**Returned Data Format**: JSON

**Description:** Given a valid shortname of a product, returns a JSON with every detail possible about the given product.

**Example Request:** `/products/pothos`

**Example Response:**
```json
{
  "id": 1,
  "name": "Pothos",
  "shortname": "pothos",
  "price": 5,
  "description": "The epipremmum aureum, more commonly known as the pothos plant is an easy going plant that is great for people who are first time plant owners. This plant can tolerate low light environments and requires minimal watering. Pothos are also a trailing plant, making it a perfect addition to the top of your bookshelves or cabinets.",
  "pot-size": 5,
  "plant-height": 5,
  "color": "green",
  "flowers": "F",
  "manageability": "some maintenance",
  "item-type": "plant",
  "capacity": 40
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid shortname of a plant, returns an error with the message: `Yikes. Product does not exist.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Oh no! An error occurred on the server. Try again later.`

## Endpoint 3 - Adds New User Information to Database.
**Request Format:** `/user/signup` endpoint with POST parameters of `email`, `username`, and `password`.

**Request Type**: `POST`

**Returned Data Format**: Plain Text

**Description:** Given a valid `email`, `username` and `password`, returns a plain text message response "success" to indicate that the user has been created in the database went through and create said user in the database.

**Example Request:** `/user/signup` with POST parameters of `email=cooltest2@gmail.com`, `username=cooltest2`, and `password=word`.

**Example Response:**
```
success
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If missing any of the parameters, returns an error with the message: `Missing one or more of the required params.`
  - If passed a username that already exists in the database, an error is returned with the message: `Username already exists. Please choose a different username.`
  - If missing an email that is already in use, an error is returned with the message: `The given email is already associated with an account. Enter a new email or enter the correct username and password for the previous email.`
- Possible 500 error (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Oh no! An error occurred on the server. Try again later.`

## Endpoint 4 - Login as a User.
**Request Format:** `/user/login` endpoint with POST parameters of `username` and `password`.

**Request Type**: `POST`

**Returned Data Format**: Plain Text

**Description:** Given a valid `username` and `password`, returns a plain text message response "success" to indicate that the user has been logged in and logs the user into the website.

**Example Request:** `/user/login` with POST parameters of `username=cooltest2`, and `password=word`.

**Example Response:**
```
success
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If missing any of the parameters, returns an error with the message: `Missing one or more of the required params.`
  - If passed a username and password that does not exist in the database, an error is returned with the message: `Uh oh! The given username and password do not exist. Please make sure you've entered your information in correctly, otherwise please click the sign up button to create a new account.`
- Possible 500 error (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Oh no! An error occurred on the server. Try again later.`

## Endpoint 5 - Check if Transaction Is Successful.
**Request Format:** `/transaction/status` endpoint with POST parameters of `number`, `date`, and `cvv`.

**Request Type**: `POST`

**Returned Data Format**: Plain Text

**Description:** Given a valid `number`, `date` (in the format of month/year), and `cvv`, returns a plain text message response "success" to indicate transaction went through.

**Example Request:** `/transaction/status` with POST parameters of `number=1234567890123456`, `date=06/23`, and `cvv=123`.

**Example Response:**
```
success
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If missing any of the parameters, returns an error with the message: `Missing one or more of the required params.`
  - If passed an expired expiration date, returns an error with the message: `Invalid expiration date. Be sure to put in a valid month and year in the form of MM/YY including the / in your input.`
  - If passed a CVV code that's not 3 digits, returns an error with the message `Invalid CVV. Please input a valid 3 digit CVV number.`
  - If passed a credit card number that's not 16 digits, returns an error with the message: `Invalid credit card number.`
  - If the user is not logged in, returns an error with the message: `You must be logged in before purchasing something.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Oh no! An error occurred on the server. Try again later.`

## Endpoint 6 - Adds New Transaction to Database.
**Request Format:** `/transaction/successful` endpoint with POST parameter of `cart`.

**Request Type**: `POST`

**Returned Data Format**: Plain Text

**Description:** Given a valid `cart`, adds the transaction to the transactions table in the database and returns the transaction ID.

**Example Request:** `/transaction/successful` with POST parameter of `cart={"username":"coolperson2","items":[{"name":"Snake Plant","quantity":"7"},{"name":"Pothos","quantity":"7"}]}`.

**Example Response:**
```
1
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If missing the `cart` parameter, returns an error with the message: `Missing cart body param.`
  - If the user is not logged in, returns an error with the message: `You must be logged in before purchasing something.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Oh no! An error occurred on the server. Try again later.`