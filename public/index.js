/*
 * Names: Calvin Tzen and Hannah King
 * Date: 06.05.2023
 * Section and TAs: CSE 154 AF with Donovan Kong and Sonia Saitawdekar, CSE 154 AG with Tara Weuger
 * and Allison Ho
 *
 * This is the JS to implement the UI for the our e-commerce website and allows the user to browse
 * our website's wares, log in to already existing accounts and sign up for new ones, add items
 * to carts and mass buy items, search and refine the search for specific items, and view all past
 * transactions for a the user that is currently logged in.
 */
"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * Sets up the necessary buttons and displays the welcome page when the webpage loads.
   */
  function init() {
    let productGridButton = qsa(".product-grid-item");
    let inputBar = id("search-term");
    qs("#login-back-button").addEventListener("click", goHome);
    for (let i = 0; i < productGridButton.length; i++) {
      productGridButton[i].addEventListener("click", switchToProduct);
    }
    id('view-all').addEventListener('click', requestAllProducts);
    id('main-view-back-button').addEventListener('click', goHome);
    id('layout-button').addEventListener('click', toggleLayout);
    id('login-button').addEventListener('click', promptLogin);
    id('logout-button').addEventListener('click', logoutUser);
    id('signup-button').addEventListener('click', promptSignup);
    id('cart-button').addEventListener('click', switchToCart);
    id('transactions-button').addEventListener('click', switchToTransactions);
    id('logo').addEventListener("click", goHome);
    qs("#search-button").disabled = true;
    id("search-button").addEventListener("click", searchProducts);
    id("toggle-filter").checked = false;
    id("toggle-filter").addEventListener('change', showAdvanced);
    inputBar.value = "";
    inputBar.addEventListener("input", checkInput);
    id("add-cart").addEventListener('submit', (event) => {
      event.preventDefault();
      addToCart();
    });
    document.cookie = 'logged-in=false';
    checkIfLoggedIn();
  }

  /**
   * Checks to see if the user is logged in upon a page load
   */
  function checkIfLoggedIn() {
    if (sessionStorage.getItem('logged-in') === 'true') {
      document.cookie = 'logged-in=true';
      id('login-button').classList.add('hidden');
      id('logout-button').classList.remove('hidden');
      id('transactions-button').classList.remove('hidden');
      id('cart-button').classList.remove('hidden');
      qs('h1').textContent = 'Welcome ' + localStorage.getItem('username') + '!';
    }
  }

  /**
   * Sends the user to the signup page and takes in user input to create the user
   * a new account.
   */
  function promptSignup() {
    hideAll();
    id('signup-page').classList.remove('hidden');
    id("email").value = "";
    id("signup-username").value = "";
    id("signup-password").value = "";
    id('signup-back-button').addEventListener('click', goToLoginPage);
    qs('#signup-page form').addEventListener('submit', (event) => {
      event.preventDefault();
      id('signup-error').textContent = '';
      signupUser();
    });
  }

  /**
   * Takes the user from the signup page back to the login page.
   */
  function goToLoginPage() {
    hideAll();
    promptLogin();
  }

  /**
   * Switches the user view to the cart page.
   */
  function switchToCart() {
    hideAll();
    id('cart-page').classList.remove('hidden');
    id('payment-button').disabled = false;
    updateCartList();
    id('cart-back-button').addEventListener('click', goHome);
    if (window.sessionStorage.getItem("cart")) {
      id('payment-button').disabled = false;
      id('payment-button').addEventListener('click', switchToPayment);
    } else {
      id('payment-button').disabled = true;
    }
    id('clear-cart-button').addEventListener('click', function() {
      window.sessionStorage.removeItem("cart");
      updateCartList();
      id('payment-button').disabled = true;
    });
  }

  /**
   * Switches the user view to the payment page.
   */
  function switchToPayment() {
    hideAll();
    id('payment-page').classList.remove('hidden');
    id('payment-back-button').addEventListener('click', switchToCart);
    id("pay-button").addEventListener("click", processPayment);
    id("card-number").value = "";
    id("expiration-date").value = "";
    id("cvv").value = "";
  }

  /**
   * Switches the user view to the transactions page.
   */
  function switchToTransactions() {
    hideAll();
    id('transactions-page').classList.remove('hidden');
    id('transactions-back-button').addEventListener('click', goHome);
    if (sessionStorage.getItem('logged-in') === 'true') {
      requestTransactionHistory();
    }
  }

  /**
   * Gets the transaction history for a certain user from the API.
   */
  async function requestTransactionHistory() {
    id('transactions-page-elements').innerHTML = "";
    try {
      let history = await fetch('/transaction/history/' + localStorage.getItem('username'));
      await statusCheck(history);
      history = await history.json();
      id('transactions-error').textContent = "";
      displayTransactionHistory(history);
    } catch (err) {
      let errorMessage = err + '';
      errorMessage = errorMessage.substring(7);
      id('transactions-error').textContent = errorMessage;
    }
  }

  /**
   * Displays the transaction history of a certain user.
   * @param {JSON} history - transaction history of a certain user
   */
  function displayTransactionHistory(history) {
    for (let i = 0; i < history.length; i++) {
      let card = gen('article');
      card.classList.add('center');

      let confimation = gen('h2');
      confimation.textContent = 'Confirmation number: ' + history[i].confirmation;
      card.appendChild(confimation);

      let list = gen('ul');
      for (let j = 0; j < history[i].products.items.length; j++) {
        let li = gen('li');
        if (history[i].products.items[j].name.slice(-1) === 's' ||
          history[i].products.items[j].quantity === '1') {
          li.textContent = history[i].products.items[j].quantity + ' ' +
          history[i].products.items[j].name;
        } else {
          li.textContent = history[i].products.items[j].quantity + ' ' +
          history[i].products.items[j].name + 's';
        }
        list.appendChild(li);
      }

      card.appendChild(list);

      id('transactions-page-elements').appendChild(card);
    }
  }

  /**
   * Processes payment and makes sure that the credit card information is valid.
   */
  function processPayment() {
    let data = new FormData();
    data.append('number', id("card-number").value);
    data.append('date', id("expiration-date").value);
    data.append('cvv', id("cvv").value);
    id('payment-msg').textContent = "";

    fetch("/transaction/status", {method: "POST", body: data})
      .then(statusCheck)
      .then(res => res.text())
      .then(addTransaction)
      .catch(function(err) {
        let errorMessage = err + '';
        errorMessage = errorMessage.substring(7);
        id('payment-msg').textContent = errorMessage;
      });
  }

  /**
   * Given that the credit card information is valid, creates a new transaction and lets the user
   * know the confirmation number. Also updates the database with this new transaction.
   * @param {Object} res - text response signalling whether the credit card information is valid.
   */
  function addTransaction(res) {
    let data = new FormData();
    data.append('cart', sessionStorage.getItem('cart'));

    if (res === "success") {
      fetch("/transaction/successful", {method: "POST", body: data})
        .then(statusCheck)
        .then(resp => resp.text())
        .then(successfulTransaction)
        .catch(handleError);
    } else {
      handleError();
    }
  }

  /**
   * Creates a new transaction and lets the user know the confirmation number and sends the user
   * back to the main menu while clearing the cart. Also updates the database with this new
   * transaction.
   * @param {Object} res - text response of the confirmation number of the newly made transaction.
   */
  function successfulTransaction(res) {
    id('payment-msg').textContent = "Transaction complete! Your confirmation number: " + res;
    id("back-to-main").classList.remove("hidden");
    setTimeout(() => {
      id("back-to-main").classList.add("hidden");
      window.sessionStorage.removeItem("cart");
      goHome();
    }, 3000);
  }

  /**
   * Logs out the user and brings them back to the front page.
   */
  function logoutUser() {
    window.sessionStorage.setItem('logged-in', false);
    window.sessionStorage.removeItem("cart");
    hideAll();
    id('menu-page').classList.remove('hidden');
    id('login-button').classList.remove('hidden');
    id('logout-button').classList.add('hidden');
    id('transactions-button').classList.add('hidden');
    id('cart-button').classList.add('hidden');
    qs('h1').textContent = 'Welcome!';
    document.cookie = 'logged-in=false';
  }

  /**
   * Using the data inputed by the user either signs them up and sends them back to
   * the homepage, or asks them to input the correct information or create a new
   * account.
   */
  function signupUser() {
    let data = new FormData();
    data.append('email', id('email').value);
    data.append('username', id('signup-username').value);
    data.append('password', id('signup-password').value);
    getLoggedIn(data, "signup");
  }

  /**
   * Sends the user to the login page and takes in user input to log them in.
   */
  function promptLogin() {
    hideAll();
    id("login-page").classList.remove("hidden");
    id('login-button').classList.add('hidden');
    if (window.localStorage.getItem('username')) {
      id('login-username').value = window.localStorage.getItem('username');
      id('login-password').value = "";
    }
    qs('#login-page form').addEventListener('submit', (event) => {
      event.preventDefault();
      id('login-error').textContent = '';
      loginUser();
    });
  }

  /**
   * Using the data inputed by the user either logs them in and sends them back to
   * the homepage, or asks them to input the correct information or create a new
   * account.
   */
  function loginUser() {
    let data = new FormData();
    data.append('username', id('login-username').value);
    data.append('password', id('login-password').value);
    getLoggedIn(data, "login");
  }

  /**
   * Logs in the user if given the right information based on whether their trying to
   * log into an existing account of signing up with a new account. If invalid parameters
   * are given, tells the user to put in correct parameters.
   * @param {FormData} data - all the data needed to login/signup.
   * @param {String} type - string stating whether the user is trying to login or signup.
   */
  async function getLoggedIn(data, type) {
    try {
      let status = await fetch('/user/' + type, {method: 'POST', body: data});
      await statusCheck(status);
      status = await status.text();
      if (status === 'success') {
        window.localStorage.setItem('username', '' + id(type + '-username').value);
        window.sessionStorage.setItem('logged-in', true);
        document.cookie = 'logged-in=true';
        hideAll();
        id('menu-page').classList.remove('hidden');
        id('login-button').classList.add('hidden');
        id('logout-button').classList.remove('hidden');
        id('transactions-button').classList.remove('hidden');
        id('cart-button').classList.remove('hidden');
        qs('h1').textContent = 'Welcome ' + id(type + '-username').value + '!';
      }
    } catch (err) {
      let errorMessage = err + '';
      errorMessage = errorMessage.substring(7);
      id(type + '-error').textContent = errorMessage;
    }
  }

  /**
   * Switches the layout of all of the products between a grid and a list layout.
   */
  function toggleLayout() {
    let currentView = '';
    let newView = '';
    if (id('main-view-products').classList.contains('product-grid')) {
      currentView = 'product-grid';
      newView = 'product-list';
    } else {
      currentView = 'product-list';
      newView = 'product-grid';
    }
    id('main-view-products').classList.remove(currentView);
    id('main-view-products').classList.add(newView);
    let products = qsa('#main-view-products article');
    for (let i = 0; i < products.length; i++) {
      products[i].classList.remove(currentView + '-item');
      products[i].classList.add(newView + '-item');
      products[i].addEventListener("click", switchToProduct);
    }
    let productsInfo = qsa('#main-view-products section');
    for (let i = 0; i < productsInfo.length; i++) {
      productsInfo[i].classList.remove(currentView + '-info');
      productsInfo[i].classList.add(newView + '-info');
    }
  }

  /**
   * Takes the user back to the home page from the main view of all products page.
   */
  function goHome() {
    hideAll();
    id('menu-page').classList.remove('hidden');
    id('main-view-products').innerHTML = '';
    id('main-view-products').classList.remove('product-list');
    id('main-view-products').classList.add('product-grid');
    id('payment-msg').textContent = "";
    id('search-term').value = '';
    if (sessionStorage.getItem('logged-in') !== 'true') {
      id('login-button').classList.remove('hidden');
    }
  }

  /**
   * Gets all of the products names, shortnames, and prices from the API.
   */
  async function requestAllProducts() {
    try {
      let allProducts = await fetch('/products');
      await statusCheck(allProducts);
      allProducts = await allProducts.json();
      displayProducts(allProducts);
    } catch (err) {
      handleError();
    }
  }

  /**
   * Display all of the products' images, names, and prices from the API.
   * @param {JSON} allProducts - all of the products names, shortnames, and prices
   */
  function displayProducts(allProducts) {
    hideAll();
    id('main-view').classList.remove('hidden');
    id('main-view-products').innerHTML = "";
    if (JSON.stringify(allProducts) === '[]') {
      noItemsNotification();
    } else {
      for (let i = 0; i < allProducts.length; i++) {
        let product = gen('article');
        product.id = allProducts[i].shortname;
        product.classList.add('product-grid-item');
        let image = gen('img');
        image.src = 'images/' + allProducts[i].shortname + '.png';
        image.alt = allProducts[i].name;
        product.appendChild(image);
        let info = gen('section');
        info.classList.add('product-grid-info');
        let name = gen('p');
        name.textContent = allProducts[i].name;
        info.appendChild(name);
        let price = gen('p');
        price.textContent = '$' + allProducts[i].price;
        info.appendChild(price);
        product.appendChild(info);
        id('main-view-products').appendChild(product);
        product.addEventListener("click", switchToProduct);
      }
    }
  }

  /**
   * Creates a message on the webpage to inform the user that there are no items
   * available.
   */
  function noItemsNotification() {
    let noItems = gen('p');
    noItems.textContent = "We got nothing for ya :(";
    id('main-view-products').appendChild(noItems);
  }

  /**
   * send user to login page
   */
  function switchToProduct() {
    hideAll();
    id("product-page").classList.remove("hidden");
    qs("#product-back-button").addEventListener("click", switchToMain);
    let product = this.id;
    if (!product) {
      product = this.getElementsByTagName('img')[0].alt;
    }
    id("item-quantity").value = 1;

    if (product === "prank-pic") {
      getPranked();
    } else {
      fetch("/products/" + product)
        .then(statusCheck)
        .then(res => res.json())
        .then(populateProduct)
        .catch(handleError);
    }
  }

  /**
   * Adds the item and the quantity of a specific product to the user's cart.
   */
  function addToCart() {
    let cart;
    let item = id("product-name").textContent;
    let quantity = id("item-quantity").value;
    if (!sessionStorage.getItem("cart") && sessionStorage.getItem('logged-in') === 'true') {
      cart = {};
      cart["username"] = localStorage.getItem("username");
      cart["items"] = [];
      cart["items"].push({"name": item, "quantity": parseInt(quantity)});
      window.sessionStorage.setItem("cart", JSON.stringify(cart));
      generateMessage('Product successfully added to cart.');
    } else if (sessionStorage.getItem("cart") && sessionStorage.getItem('logged-in') === 'true') {
      cart = JSON.parse(sessionStorage.getItem('cart'));
      let alreadyIn = false;
      for (let i = 0; i < cart["items"].length; i++) {
        if (item === cart["items"][i].name) {
          cart["items"][i].quantity = parseInt(cart["items"][i].quantity) + parseInt(quantity);
          alreadyIn = true;
        }
      }
      if (!alreadyIn) {
        cart["items"].push({"name": item, "quantity": parseInt(quantity)});
      }
      window.sessionStorage.setItem("cart", JSON.stringify(cart));
      generateMessage('Product successfully added to cart.');
    } else {
      generateMessage('You must log in before adding to your cart.');
    }
  }

  /**
   * Generates a message to the user about whether or not the product was successfully
   * added to the cart or an error came up.
   * @param {String} text - message that will be displayed to user.
   */
  function generateMessage(text) {
    id('product-page-message').textContent = text;
    setTimeout(() => {
      id('product-page-message').textContent = '';
    }, 5000);
  }

  /**
   * Updates and displays the current list of items in the user's cart.
   */
  function updateCartList() {
    id('cart-list').innerHTML = '';
    if (sessionStorage.getItem('cart')) {
      id("empty-cart-msg").classList.add("hidden");
      id('cart-list').classList.remove("hidden");
      let cart = JSON.parse(sessionStorage.getItem('cart'));
      for (let i = 0; i < cart["items"].length; i++) {
        let li = gen('li');
        if (cart["items"][i].name.slice(-1) === 's' || cart["items"][i].quantity === '1') {
          li.textContent = cart["items"][i].quantity + ' ' + cart["items"][i].name;
        } else {
          li.textContent = cart["items"][i].quantity + ' ' + cart["items"][i].name + 's';
        }
        id('cart-list').appendChild(li);
      }
    } else {
      id("empty-cart-msg").classList.remove("hidden");
      id('cart-list').classList.add("hidden");
    }
  }

  /**
   * sends user back to main page
   */
  function switchToMain() {
    hideAll();
    id("main-view").classList.remove("hidden");
    if (id("main-view-products").innerHTML === "") {
      requestAllProducts();
    }
  }

  /**
   * populates the product info page with info about the product
   * @param {JSON} info - response from the API
   */
  function populateProduct(info) {
    let img = id("product-img");
    let name = id("product-name");
    let desc = id("product-description");
    let price = id("product-price");
    let size = id("product-size");
    let color = id("product-color");

    img.src = "images/" + info.shortname + ".png";
    img.alt = info.shortname;
    name.textContent = info.name;
    desc.textContent = info.description;
    price.textContent = "Price: $" + info.price;
    size.textContent = "Pot size: " + info["pot-size"] + "in";
    color.textContent = "Color: " + info.color;

    differentDetails(info);
  }

  /**
   * GET PRANKEDDDDDD
   */
  function getPranked() {
    let img = id("product-img");
    let name = id("product-name");
    let desc = id("product-description");
    let price = id("product-price");
    let size = id("product-size");
    let color = id("product-color");
    let height = id("product-height");
    let flowers = id("product-flowers");
    let manageability = id("product-manageability");
    let stock = id("product-stock");
    id("product-height").classList.remove("hidden");
    id("product-flowers").classList.remove("hidden");
    id("product-manageability").classList.remove("hidden");
    id("add-button").disabled = true;
    id("item-quantity").disabled = true;
    img.src = "images/lhs2.png";
    img.alt = "lol-pranked";
    name.textContent = "#pranks4dayz";
    desc.textContent = "YEAHHHHHHH GET PRANKED (what's happening) (i think it's a cardinal) (what)";
    price.textContent = "Price: $200 in oregon dollars";
    size.textContent = "Pot size: too big";
    color.textContent = "Color: looks like a red bird";
    height.textContent = "Starting height: pretty tall for a bird";
    flowers.textContent = "Ability to flower: idk man ask the bird";
    manageability.textContent = "Manageability: feed it sunflower seeds probably";
    stock.textContent = "Limited supply: however many Oregonians remain. You can't save them.";
    stock.style.color = 'red';
  }

  /**
   * populates the details relating to plants if the given product is a plant and omits
   * it if the product is a pot.
   * @param {JSON} info - response from the API
   */
  function differentDetails(info) {
    let height = id("product-height");
    let flowers = id("product-flowers");
    let manageability = id("product-manageability");
    let stock = id("product-stock");
    id("add-button").disabled = false;
    id("item-quantity").disabled = false;

    checkItemType(info["item-type"]);

    height.textContent = "Starting height: " + info["plant-height"] + "in";
    flowers.textContent = "Ability to flower: " + info.flowers;
    manageability.textContent = "Manageability: " + info.manageability;

    if (info.capacity > 0) {
      stock.textContent = "Limited supply: " + info.capacity + " plants remaining.";
      stock.style.color = 'green';
      id("item-quantity").setAttribute("max", info.capacity);
    } else if (info.capacity === 0) {
      stock.textContent = "Out of stock! Sorry :(";
      stock.style.color = 'red';
      id("add-button").disabled = true;
      id("item-quantity").disabled = true;
    } else {
      stock.textContent = "No limit.";
      stock.style.color = 'blue';
    }
  }

  /**
   * Checks to see if the item type is a plant or a pot and either shows or omits product details
   * accordingly.
   * @param {String} type - the type of the product.
   */
  function checkItemType(type) {
    if (type === "plant") {
      id("product-height").classList.remove("hidden");
      id("product-flowers").classList.remove("hidden");
      id("product-manageability").classList.remove("hidden");
    } else {
      id("product-height").classList.add("hidden");
      id("product-flowers").classList.add("hidden");
      id("product-manageability").classList.add("hidden");
    }
  }

  /**
   * displays the advanced filters for the user to use to refine their search.
   */
  function showAdvanced() {
    id("adv-filters").classList.toggle("hidden");
    id("max-price").value = 5;
    id("max-pot-size").value = 3;
    id("max-price").addEventListener("mouseup", function() {
      id("price-output").textContent = "$" + id("max-price").value;
    });
    id("max-pot-size").addEventListener("mouseup", function() {
      id("pot-output").textContent = id("max-pot-size").value + "in";
    });
    id('adv-filters').addEventListener('submit', (event) => {
      event.preventDefault();
      searchAdv();
    });
  }

  /**
   * Finds all the products where all conditions of the advanced filter that the user submitted are
   * met.
   */
  function searchAdv() {
    let url;
    if (!id("search-term").value) {
      url = "/products/?search= &type=" + id('item-type').value + "&price=" +
      id('max-price').value + "&size=" + id('max-pot-size').value;
    } else {
      url = "/products/?search=" + id("search-term").value + "&type=" + id('item-type').value +
      "&price=" + id('max-price').value + "&size=" + id('max-pot-size').value;
    }

    fetch(url)
      .then(statusCheck)
      .then(res => res.json())
      .then(displayProducts)
      .catch(handleError);
  }

  /**
   * Adds the class 'hidden' to all of the pages on the website.
   */
  function hideAll() {
    let pages = qsa('body > section');
    for (let i = 0; i < pages.length; i++) {
      if (!pages[i].classList.contains('hidden')) {
        pages[i].classList.add('hidden');
      }
    }
  }

  /**
   * Checks to see if there's anything tangible in the search box. If so, activate the
   * submit button, and disable if not.
   */
  function checkInput() {
    if (id("search-term").value.trim() !== "") {
      qs("#search-button").disabled = false;
    } else {
      qs("#search-button").disabled = true;
    }
  }

  /**
   * Finds all the products where the name contains the query that the user submitted.
   */
  function searchProducts() {
    fetch("/products/?search=" + id("search-term").value)
      .then(statusCheck)
      .then(res => res.json())
      .then(displayProducts)
      .catch(handleError);
  }

  /**
   * Switches the current webpage view to the error page if an error occurs.
   */
  function handleError() {
    hideAll();
    qs('header').classList.add('hidden');
    id('error-page').classList.remove('hidden');
  }

  /**
   * Checks to make sure that the response from the API is OK
   * @param {Promise<object>} res - response from the API
   * @returns {Promise<object>} - OK response from the API
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  // HELPER FUNCTIONS

  /**
   * Shortcut that returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID.
   * @return {object} - DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Shortcut that returns the first element matching the specified selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - First DOM object associated with selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Shortcut that returns an array of elements matching the given query.
   * @param {string} selector - CSS query selector.
   * @returns {array} - Array of DOM objects matching the given query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();