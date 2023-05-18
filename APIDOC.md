# Final Project API Documentation
The Final Project API provides information about the various plants on our website and a user's purchasing of them.

## Endpoint 1 - Get Product Names
**Request Format:** /all

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Takes the parameter all and returns a plain text response with a line for every product we are looking to sell. The full name of the product is followed by its shortname separated by a single ":", as in:
Full Name:shortname
The shortname is included in the response to specify the base string for the images. This shortname can also be used for the "product" query parameter in Endpoint 2 to get an individual product's information.

**Example Request:** /all

**Example Response:** (abbreviated)
```
Aloe Vera:aloe-vera
Cactus:cactus
…
Jade Plant:jade-plant
…
Snake Plant:snake-plant
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 2 - Get Product Data
**Request Format:** /:shortname

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Takes in as a parameter any plant shortname and returns JSON containing various attributes about that plant. The returned data will be used to populate the product page for that plant as well as the products search page.

**Example Request:** /snake-plant

**Example Response:**
```json
{
    "name": "Snake Plant",
    "shortname": "snake-plant",
    "info": {
      "price": 5,
      "description": "The sansevieria trifasciata, more commonly known as snake or mother-in-law's tongue, is a very easy going plant that is perfect for people who are new to the world of houseplants. This plant can survive in low light places and long periods of no watering, making it an easy green addition to your home.",
      "pot-size": "5in",
      "start-size": "8in",
      "color": "green",
      "manageability": "very simple"
    },
    "image": "images/snake-plant.png"
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid shortname of a plant, returns an error with the message: `Given shortname {shortname} is not valid.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 3 - Start a Transaction
**Request Format:** /transaction endpoint with POST parameters of `starttransaction` (set to true) and `uid`.

**Request Type**: POST

**Returned Data Format**: JSON

**Description:** Given a valid `uid` and setting `starttransaction` to true, returns the information from the user’s transaction information

**Example Request:** /transaction with POST parameters of `starttransaction=true` and `uid=21566325`

**Example Response:**
```json
{
    "uid": 21566325,
    "tid": 5652198622,
    "items": [
      {
        "name": "Snake Plant",
        "shortname": "snake-plant",
        "quantity": 2,
        "price": 5,
        "total-price": 10,
        "image": "images/snake-plant.png"
      },
      {
        "name": "Cactus",
        "shortname": "cactus",
        "quantity": 3,
        "price": 6,
        "total-price": 18,
        "image": "images/cactus.png"
      }
    ],
    "transac-price": 28
}

```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed an invalid uid, returns an error with the message: `Invalid uid.`
  - If passed a starttransaction set to false, returns an error with the message `starttransaction cannot be set to false.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 4 - Transaction History
**Request Format:** /transaction-history endpoint with POST parameters of `username` and `user-password`

**Request Type**: POST

**Returned Data Format**: JSON

**Description:** Given a valid `username` and `user-password`, a JSON file of a list of products that that user has purchased in the past will be returned.

**Example Request:** /transaction-history with POST parameters `username=username` and `user-password=password`

**Example Response:**
```json
{
    "uid": 21566325,
    "transactions": [
      {
        "tid": 5652198622,
        "items": [
          {
            "name": "Snake Plant",
            "shortname": "snake-plant",
            "quantity": 2,
            "price": 5,
            "total-price": 10,
            "image": "images/snake-plant.png"
          },
          {
            "name": "Cactus",
            "shortname": "cactus",
            "quantity": 3,
            "price": 6,
            "total-price": 18,
            "image": "images/cactus.png"
          }
        ],
        "transac-price": 28
      },
      {
        "tid": 1234567890,
        "items": [
          {
            "name": "ZZ Plant",
            "shortname": "zz-plant",
            "quantity": 2,
            "price": 5,
            "total-price": 10,
            "image": "images/zz-plant.png"
          },
          {
            "name": "Snake Plant",
            "shortname": "snake-plant",
            "quantity": 3,
            "price": 5,
            "total-price": 15,
            "image": "images/snake-plant.png"
          }
        ],
        "transac-price": 25
      }
    ],
}

```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
	- If passed an invalid username, an error is returned with the message: `Invalid username.`
	- If passed an invalid password, an error is returned with the message: `Invalid password.`
	- If missing the username, an error is returned with the message: `Enter your username.`
	- If missing the password, an error is returned with the message: `Enter your password.`
- Possible 500 error (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`
