"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * add
   * function comment
   */
  function init() {
    id("login-back-button").addEventListener("click", switchLoginView);
    let productButton = qsa(".product");
    for (let i = 0; i < productButton.length; i++) {
      productButton[i].addEventListener("click", switchProductView);
    }
    id("product-back-button").addEventListener("click", switchProductView);
    id('view-all').addEventListener('click', requestAllProducts);
    id('main-view-back-button').addEventListener('click', goHome);
    id('layout-button').addEventListener('click', toggleLayout);
    id('login-button').addEventListener('click', promptLogin);
    id('signup-button').addEventListener('click', promptSignup);

    /**
     * make function for search
     * id("search-button").addEventListener("click", doSomething);
     * make function for cart
     * id("cart-button").addEventListener("click", doSomething);
     * make funtion for adding to cart
     * id("add-to-cart-button").addEventListener("click", doSomething);
     */
  }

  /**
   * Sends the user to the signup page and takes in user input to create the user
   * a new account.
   */
  function promptSignup() {
    hideAll();
    id('signup-page').classList.remove('hidden');
    qs('#signup-page form').addEventListener('submit', (event) => {
      event.preventDefault();
      signupUser();
    });
  }

  /**
   * comment
   */
  async function signupUser() {
    let data = new FormData();
    data.append('username', id('signup-username').value);
    data.append('password', id('signup-password').value);
    try {
      let signupStatus = await fetch('/user/signup', {method: 'POST', body: data});
      await statusCheck(signupStatus);
      signupStatus = await signupStatus.text();
      if (signupStatus === 'success') {
        window.localStorage.setItem('username', '' + id('login-username').value);
        hideAll();
        id('menu-page').classList.remove('hidden');
        id('login-button').classList.add('hidden');
        id('cart-button').classList.remove('hidden');
      }
    } catch (err) {
      let errorMessage = gen('p');
      errorMessage.classList.add('error-message');
      errorMessage.textContent = err;
      errorMessage.textContent = errorMessage.textContent.substring(7);
      id('login-page-elements').insertBefore(errorMessage, qs('#login-page-elements section'));
    }
  }

  /**
   * Sends the user to the login page and takes in user input to log them in.
   */
  function promptLogin() {
    hideAll();
    id("login-page").classList.remove("hidden");
    if (window.localStorage.getItem('username')) {
      id('login-username').value = window.localStorage.getItem('username');
    }
    qs('#login-page form').addEventListener('submit', (event) => {
      event.preventDefault();
      loginUser();
    });
  }

  /**
   * Using the data inputed by the user either logs them in and send them back to
   * the homepage, or asks them to input the correct information or create a new
   * account.
   */
  async function loginUser() {
    let data = new FormData();
    data.append('username', id('login-username').value);
    data.append('password', id('login-password').value);
    try {
      let loginStatus = await fetch('/user/login', {method: 'POST', body: data});
      await statusCheck(loginStatus);
      loginStatus = await loginStatus.text();
      if (loginStatus === 'success') {
        window.localStorage.setItem('username', '' + id('login-username').value);
        hideAll();
        id('menu-page').classList.remove('hidden');
        id('login-button').classList.add('hidden');
        id('cart-button').classList.remove('hidden');
      }
    } catch (err) {
      let errorMessage = gen('p');
      errorMessage.classList.add('error-message');
      errorMessage.textContent = err;
      errorMessage.textContent = errorMessage.textContent.substring(7);
      id('login-page-elements').insertBefore(errorMessage, qs('#login-page-elements section'));
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
    id('main-view').classList.add('hidden');
    id('menu-page').classList.remove('hidden');
    id('main-view-products').innerHTML = '';
    id('main-view-products').classList.remove('product-list');
    id('main-view-products').classList.add('product-grid');
  }

  /**
   * Gets all of the products names, shortnames, and prices from the API.
   */
  async function requestAllProducts() {
    try {
      let allProducts = await fetch('/all/products');
      await statusCheck(allProducts);
      allProducts = await allProducts.json();
      displayAllProducts(allProducts);
    } catch (err) {
      handleError();
    }
  }

  /**
   * Display all of the products' images, names, and prices from the API.
   * @param {JSON} allProducts - all of the products names, shortnames, and prices
   */
  function displayAllProducts(allProducts) {
    id('menu-page').classList.add('hidden');
    id('main-view').classList.remove('hidden');
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
    }
  }

  /**
   * send user to login page
   */
  function switchLoginView() {
    id("menu-page").classList.toggle("hidden");
    id("login-page").classList.toggle("hidden");
  }

  /**
   * send user to login page
   */
  function switchProductView() {
    id("menu-page").classList.toggle("hidden");
    id("product-page").classList.toggle("hidden");
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