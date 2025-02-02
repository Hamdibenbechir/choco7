document.addEventListener("DOMContentLoaded", () => {
  // Product details selectors
  const variantSelect = document.getElementById("variant-select");
  const productPrice = document.getElementById("product-price");
  const addToCartButton = document.querySelector(".check-out");
  const quantityInput = document.getElementById("Quantity");
  const decreaseButton = document.getElementById("qbtn2");
  const increaseButton = document.getElementById("qbtn1");

  // Decrease quantity button functionality
  if (decreaseButton) {
    decreaseButton.addEventListener("click", (event) => {
      event.preventDefault();
      let currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
  }

  // Increase quantity button functionality
  if (increaseButton) {
    increaseButton.addEventListener("click", (event) => {
      event.preventDefault();
      let currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
    });
  }

  // Update price when variant selection changes
  function updatePrice() {
    if (variantSelect && productPrice) {
      const selectedOption = variantSelect.options[variantSelect.selectedIndex];
      const selectedPrice = selectedOption.getAttribute("data-price");
      productPrice.innerText = selectedPrice;
    }
  }

  // Update price on page load
  window.addEventListener("load", () => {
    updatePrice();
    setTimeout(updateCartCounter, 500); // Ensure cart counter updates on page load
  });

  // Update price when variant selection changes
  if (variantSelect) {
    variantSelect.addEventListener("change", updatePrice);
  }

  // Add to cart button functionality for individual product page
  if (addToCartButton) {
    addToCartButton.addEventListener("click", (event) => {
      event.preventDefault();
      const variantId = variantSelect?.value;
      const quantity = parseInt(quantityInput?.value) || 1;

      if (!variantId || quantity < 1 || isNaN(quantity)) {
        alert("Please select a valid quantity and variant.");
        return;
      }

      addToCart(variantId, quantity);
    });
  }

  // Function to add item to cart using Rebuy's Cart API
  function addToCart(variantId, quantity) {
    const data = {
      items: [
        {
          id: variantId,
          quantity: quantity,
        },
      ],
    };

    if (typeof Rebuy.Cart !== "undefined" && typeof Rebuy.Cart.addItem === "function") {
      Rebuy.Cart.addItem(data.items[0])
        .then(() => {
          updateCartCounter();
        })
        .catch((error) => {
          console.error("Error adding item to cart:", error);
          alert("There was an issue adding the item to the cart.");
        });
    } else {
      console.error("Rebuy.Cart.addItem method not available.");
      alert("Failed to add item to the cart. Please try again later.");
    }
  }

  // Function to update the cart counter
  function updateCartCounter() {
    if (typeof Rebuy !== "undefined" && typeof Rebuy.SmartCart !== "undefined") {
      const itemCount = Rebuy.SmartCart.itemCount();
      if (itemCount !== undefined) {
        document.querySelectorAll(".num-cart").forEach((el) => {
          el.textContent = itemCount;
        });
        console.log("Cart counter updated:", itemCount);
      } else {
        console.error("Rebuy.SmartCart.itemCount returned undefined.");
      }
    } else {
      console.error("Rebuy not initialized. Falling back to Shopify API.");
      fetchShopifyCart();
    }
  }

  // Fallback to Shopify API for cart count
  function fetchShopifyCart() {
    fetch("/cart.json")
      .then((response) => response.json())
      .then((data) => {
        const itemCount = data.item_count || 0;
        document.querySelectorAll(".num-cart").forEach((el) => {
          el.textContent = itemCount;
        });
        console.log("Fallback to Shopify API. Cart count:", itemCount);
      })
      .catch((error) => {
        console.error("Error fetching Shopify cart:", error);
      });
  }

  // Listen for Rebuy events
  document.addEventListener("rebuy:cart.ready", () => {
    console.log("Rebuy cart is ready");
    updateCartCounter();
  });

  document.addEventListener("rebuy:cart.change", () => {
    // Avoid updating twice by checking if the item count is different
    updateCartCounter();
  });
});

// Add event listener for "Add to Cart" buttons on homepage or product listings
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("hover-add-to-cart")) {
    // Get the button element
    const button = event.target;

    // Retrieve variant ID and quantity from the button's data attributes
    const variantId = button.getAttribute("data-id");
    const quantity = parseInt(button.getAttribute("data-quantity")) || 1;

    // Ensure valid variant ID and quantity
    if (!variantId || quantity < 1) {
      console.error("Invalid variant ID or quantity.");
      return;
    }

    // Add product to cart using Shopify AJAX API
    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity, // Use the correct quantity
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to add the product to the cart.");
      })
      .then(() => {
        // Reset data-quantity to 1 after successful addition
        button.setAttribute("data-quantity", "1");

        // Update cart counter only after the item is added
        updateCartCounter();
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  }
});
