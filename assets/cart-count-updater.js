document.addEventListener('DOMContentLoaded', function () {
  function updateCartCounts() {
    fetch('/cart.js')
      .then((response) => response.json())
      .then((cart) => {
        const itemCount = cart.item_count;
        const mobileCartCountElement = document.querySelector('.mobile-cart-count');

        if (mobileCartCountElement) {
          mobileCartCountElement.textContent = `(${itemCount})`;
        }

        // Optionally, update other cart count elements if needed
      })
      .catch((error) => console.error('Error fetching cart data:', error));
  }

  // Listen for cart updates
  document.addEventListener('cart:updated', updateCartCounts);

  // Optionally, trigger the update function on page load
  updateCartCounts();

  // Override fetch to detect cart updates
  (function () {
    const originalFetch = fetch;
    fetch = function () {
      return originalFetch.apply(this, arguments).then(function (response) {
        // Check if the request is to the cart endpoints
        if (response.url.includes('/cart/add') || response.url.includes('/cart/change')) {
          // Dispatch the cart:updated event
          document.dispatchEvent(new Event('cart:updated'));
        }
        return response;
      });
    };
  })();
});
