"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * add
   * function comment
   */
  function init() {
    let loginButton = qs("#login-button");
    let loginBackButton = qs("#login-back-button");
    let mainViewBackButton = qs("#main-view-back-button");
    let productGridButton = qsa(".product-grid-item");
    let productBackButton = qs("#product-back-button");
    loginButton.addEventListener("click", switchLoginView);
    mainViewBackButton.addEventListener("click", mainViewGoBack);
    loginBackButton.addEventListener("click", switchLoginView);
    for (let i = 0; i < productGridButton.length; i++) {
      productGridButton[i].addEventListener("click", switchToProduct);
    }
    productBackButton.addEventListener("click", switchToMain);
    id('view-all').addEventListener('click', requestAllProducts);
    id('main-view-back-button').addEventListener('click', goHome);
    id('layout-button').addEventListener('click', toggleLayout);

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
    id('main-view').classList.add('hidden');
    id('menu-page').classList.remove('hidden');
    id('main-view-products').innerHTML = '';
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
  function switchToProduct() {
    id("menu-page").classList.add("hidden");
    id("main-view").classList.add("hidden");
    id("login-page").classList.add("hidden");
    id("product-page").classList.remove("hidden");

    fetch("/all/products/" + this.id)
    .then(statusCheck)
    .then(res => res.json())
    .then(populateProduct)
    .catch(handleError);
  }

  function switchToMain() {
    id("product-page").classList.add("hidden");
    id("main-view").classList.remove("hidden");
  }

  function mainViewGoBack() {
    id("main-page").classList.add("hidden");
    id("main-view").classList.remove("hidden");
    id("main-view-products").innerHTML = "";
    id("main-view-products").classList.remove("product-list");
    id("main-view-products").classList.add("product-grid");
  }

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

  function differentDetails(info) {
    let height = id("product-height");
    let flowers = id("product-flowers");
    let manageability = id("product-manageability");
    let stock = id("product-stock");

    if (info["item-type"] === "plant") {
      height.classList.remove("hidden");
      flowers.classList.remove("hidden");
      manageability.classList.remove("hidden");
    } else {
      height.classList.add("hidden");
      flowers.classList.add("hidden");
      manageability.classList.add("hidden");
    }

    height.textContent = "Starting height: " + info["plant-height"] + "in";
    flowers.textContent = "Ability to flower: " + info.flowers;
    manageability.textContent = "Manageability: " + info.manageability;

    if (info.capacity) {
      stock.textContent = "Limited supply: " + info.capacity + " plants remaining."
    } else {
      stock.textContent = "No limit."
    }
  }


  /**
   * Switches the current webpage view to the error page if an error occurs.
   */
  function handleError() {
    let pages = qsa('body section');
    for (let i = 0; i < pages.length; i++) {
      if (!pages[i].classList.contains('hidden')) {
        pages[i].classList.add('hidden');
      }
    }
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