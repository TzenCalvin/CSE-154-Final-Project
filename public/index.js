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
    let productButton = qsa(".product");
    let productBackButton = qs("#product-back-button");
    loginButton.addEventListener("click", switchLoginView);
    loginBackButton.addEventListener("click", switchLoginView);
    for (let i = 0; i < productButton.length; i++) {
      productButton[i].addEventListener("click", switchProductView);
    }
    productBackButton.addEventListener("click", switchProductView);

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
})();