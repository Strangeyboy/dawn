document.addEventListener('DOMContentLoaded', function () {
  // Ensure that the script only runs on product pages
  if (!document.querySelector('product-form')) return;

  const productForms = document.querySelectorAll('product-form');

  productForms.forEach((productForm) => {
    const variantIdInput = productForm.querySelector('input[name="id"]');
    const addToCartButton = productForm.querySelector('button[type="submit"]');
    const errorMessageWrapper = productForm.querySelector('.product-form__error-message-wrapper');
    const errorMessage = errorMessageWrapper ? errorMessageWrapper.querySelector('.product-form__error-message') : null;

    // Function to update the button state
    function updateButtonState() {
      const selectedVariantId = variantIdInput.value;

      // Fetch variant data from the product JSON script tag
      const productDataElement = document.querySelector(`[type="application/json"][data-product-id]`);
      if (!productDataElement) return;

      const productData = JSON.parse(productDataElement.textContent);
      const selectedVariant = productData.variants.find((variant) => variant.id == selectedVariantId);

      if (selectedVariant) {
        if (selectedVariant.available) {
          addToCartButton.disabled = false;
          if (errorMessageWrapper) errorMessageWrapper.hidden = true;
        } else {
          addToCartButton.disabled = true;
          if (errorMessageWrapper) {
            errorMessageWrapper.hidden = false;
            errorMessage.textContent = window.variantStrings.soldOut || 'Sold out';
          }
        }
      } else {
        addToCartButton.disabled = true;
        if (errorMessageWrapper) {
          errorMessageWrapper.hidden = false;
          errorMessage.textContent = window.variantStrings.unavailable || 'Unavailable';
        }
      }
    }

    // Listen for changes to the variant ID input
    variantIdInput.addEventListener('change', updateButtonState);

    // Initial check
    updateButtonState();
  });
});
