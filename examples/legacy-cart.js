/**
 * Legacy E-Commerce Shopping Cart Widget (jQuery)
 * Features:
 * - Dynamic quantity adjustments
 * - Coupon code validation via AJAX
 * - LocalStorage cart caching
 * - Checkout form validation & submission
 */
$(document).ready(function() {
  var cartTotal = 0;
  var itemCount = 0;
  var activeDiscount = 0;
  var STORAGE_KEY = 'legacy_cart_state_v2';

  // Restore cart state from localStorage
  var savedCart = localStorage.getItem(STORAGE_KEY);
  if (savedCart) {
    try {
      var cartData = JSON.parse(savedCart);
      cartTotal = cartData.total || 0;
      itemCount = cartData.count || 0;
      updateCartDisplay();
    } catch(e) {
      console.warn('Failed to parse cached cart');
    }
  }

  // Update quantity controls
  $('.qty-plus').on('click', function(e) {
    e.preventDefault();
    var $input = $(this).siblings('.qty-input');
    var currentVal = parseInt($input.val()) || 1;
    $input.val(currentVal + 1);
    recalculateSubtotal();
  });

  $('.qty-minus').on('click', function(e) {
    e.preventDefault();
    var $input = $(this).siblings('.qty-input');
    var currentVal = parseInt($input.val()) || 1;
    if (currentVal > 1) {
      $input.val(currentVal - 1);
      recalculateSubtotal();
    }
  });

  // Apply Coupon AJAX
  $('#apply-coupon-btn').click(function(e) {
    e.preventDefault();
    var couponCode = $('#coupon-code-input').val().trim();
    if (!couponCode) {
      $('#coupon-message').text('Please enter a valid promo code.').addClass('error').show();
      return;
    }

    $('#apply-coupon-btn').prop('disabled', true).text('Validating...');

    $.ajax({
      url: '/api/v1/coupons/validate',
      type: 'POST',
      dataType: 'json',
      data: { code: couponCode },
      success: function(res) {
        $('#apply-coupon-btn').prop('disabled', false).text('Apply');
        if (res.valid) {
          activeDiscount = res.discountPercentage;
          $('#coupon-message').text('Discount applied: ' + activeDiscount + '%').removeClass('error').addClass('success').show();
          recalculateSubtotal();
        } else {
          $('#coupon-message').text(res.message || 'Invalid coupon code').addClass('error').show();
        }
      },
      error: function() {
        $('#apply-coupon-btn').prop('disabled', false).text('Apply');
        $('#coupon-message').text('Server error validating coupon.').addClass('error').show();
      }
    });
  });

  // Helper recalculate function
  function recalculateSubtotal() {
    var subtotal = 0;
    $('.cart-item-row').each(function() {
      var price = parseFloat($(this).find('.item-price').data('price')) || 0;
      var qty = parseInt($(this).find('.qty-input').val()) || 1;
      subtotal += price * qty;
    });

    if (activeDiscount > 0) {
      subtotal = subtotal * (1 - (activeDiscount / 100));
    }

    cartTotal = subtotal;
    updateCartDisplay();
  }

  function updateCartDisplay() {
    $('#cart-total-amount').text('$' + cartTotal.toFixed(2));
    $('.cart-badge-count').text(itemCount);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      total: cartTotal,
      count: itemCount,
      updatedAt: new Date().getTime()
    }));
  }
});
