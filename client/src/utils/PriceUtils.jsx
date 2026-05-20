// ============================================================
// 💰 PriceUtils.js — সব price calculation এখানে
// Book model এ discount: String তাই Number() দিয়ে convert করা হয়েছে
// "50" বা 50 দুটোই কাজ করবে
// ============================================================

// ── Final price of one book (after discount + coupon) ────────
export const getFinalPrice = (book, coupon = 0) => {
  let price = Number(book.price || 0);

  // FREE book
  if (price === 0) return 0;

  // Book discount — Number() দিয়ে "50" → 50 convert করা হচ্ছে
  const discount = Number(book.discount || 0);
  if (!isNaN(discount) && discount > 0) {
    price = price - (price * discount) / 100;
  }

  // Coupon discount (%)
  const coup = Number(coupon || 0);
  if (!isNaN(coup) && coup > 0) {
    price = price - (price * coup) / 100;
  }

  return Math.max(price, 0);
};

// ── Subtotal: sum of all item final prices ───────────────────
export const getSubtotal = (cart, coupon = 0) => {
  return cart.reduce((sum, item) => sum + getFinalPrice(item, coupon), 0);
};

// ── Tax calculation (default 5%) ─────────────────────────────
export const getTax = (amount, taxRate = 0.05) => {
  return amount * taxRate;
};

// ── Grand total: subtotal + tax ──────────────────────────────
export const getTotal = (cart, coupon = 0, taxRate = 0.05) => {
  const subtotal = getSubtotal(cart, coupon);
  return subtotal + getTax(subtotal, taxRate);
};