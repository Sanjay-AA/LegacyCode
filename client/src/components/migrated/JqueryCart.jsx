import React, { useState, useEffect } from 'react';

/**
 * Modernized React Component: JqueryCart
 * Source: jquery-cart.js
 * Migrated by Legacy Rescue Agent (BuildSprint 2026)
 */
export default function JqueryCart() {
  // --- React State Hooks ---
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [activeDiscount, setActiveDiscount] = useState(0);
  const [STORAGE_KEY, setSTORAGE_KEY] = useState('');
  const [savedCart, setSavedCart] = useState(null);
  const [cartData, setCartData] = useState([]);
  const [$input, set$input] = useState(null);
  const [currentVal, setCurrentVal] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [price, setPrice] = useState(0);
  const [qty, setQty] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageType, setCouponMessageType] = useState('');

  // --- Initial Mount & LocalStorage Restoration ---
  useEffect(() => {
    const savedCart = localStorage.getItem('legacy_cart_state_v2');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        if (cartData.total) setCartTotal(cartData.total);
        if (cartData.count) setItemCount(cartData.count);
      } catch (e) {
        console.warn('Failed to parse cached cart session:', e);
      }
    }
  }, []);

  // Synchronize cart total and count to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('legacy_cart_state_v2', JSON.stringify({
        total: cartTotal,
        count: itemCount,
        updatedAt: Date.now()
      }));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }, [cartTotal, itemCount]);

  // --- Synthetic Event Handlers ---
  const handleQuantityIncrease = (e) => {
    if (e) e.preventDefault();
    setItemCount(prev => prev + 1);
  };

  const handleQuantityDecrease = (e) => {
    if (e) e.preventDefault();
    setItemCount(prev => Math.max(1, prev - 1));
  };

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCode || !couponCode.trim()) {
      setCouponMessage('Please enter a valid promo code.');
      setCouponMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setCouponMessage('');

    try {
      const response = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code: couponCode.trim() })
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.valid) {
        setActiveDiscount(data.discountPercentage || 0);
        setCouponMessage(`Discount applied: ${data.discountPercentage}%`);
        setCouponMessageType('success');
      } else {
        setCouponMessage(data.message || 'Invalid coupon code');
        setCouponMessageType('error');
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      setIsSubmitting(false);
      setCouponMessage('Server error validating coupon. Please try again.');
      setCouponMessageType('error');
    }
  };

  // --- Derived Calculations ---
  const discountAmount = (cartTotal * (activeDiscount / 100)) || 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <div className="jquerycart-container p-6 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 max-w-xl mx-auto shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">JqueryCart</h2>
          <p className="text-xs text-slate-400">Migrated React Component • jQuery Preserved Behavior</p>
        </div>
        <span className="text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-full">
          React 18
        </span>
      </div>

      {/* Cart Quantity Controls */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-5 space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">Item Quantity</label>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleQuantityDecrease}
            className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center justify-center transition-colors"
          >
            -
          </button>
          <input
            type="number"
            value={itemCount}
            readOnly
            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono text-sm text-sky-400 font-bold"
          />
          <button
            type="button"
            onClick={handleQuantityIncrease}
            className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center justify-center transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Coupon Code Section */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-5 space-y-3">
        <label htmlFor="coupon-input" className="text-xs font-semibold text-slate-300 block">
          Promo / Coupon Code
        </label>
        <div className="flex items-center space-x-2">
          <input
            id="coupon-input"
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={isSubmitting}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow"
          >
            {isSubmitting ? 'Validating...' : 'Apply'}
          </button>
        </div>

        {couponMessage && (
          <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
            couponMessageType === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            <span>{couponMessage}</span>
          </div>
        )}
      </div>

      {/* Total Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">Total Amount:</span>
        <span className="text-xl font-bold font-mono text-emerald-400">
          ${finalTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
