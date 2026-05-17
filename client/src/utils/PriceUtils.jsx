// ===============================
// 💰 FINAL PRICE CALCULATION
// ===============================
export const getFinalPrice = (book, coupon = 0) => {
  let price = Number(book.price || 0);

  // 🆓 FREE BOOK
  if (price === 0) return 0;

  // 📉 BOOK DISCOUNT (%)
  if (book.discount && book.discount > 0) {
    price = price - (price * book.discount) / 100;
  }

  // 🎟️ COUPON DISCOUNT (%)
  if (coupon && coupon > 0) {
    price = price - (price * coupon) / 100;
  }

  return Math.max(price, 0); // prevent negative
};

// ===============================
// 🧾 SUBTOTAL
// ===============================
export const getSubtotal = (cart, coupon = 0) => {
  return cart.reduce((total, item) => {
    return total + getFinalPrice(item, coupon);
  }, 0);
};

// ===============================
// 🧾 TAX CALCULATION
// ===============================
export const getTax = (amount, taxRate = 0.05) => {
  return amount * taxRate;
};

// ===============================
// 💵 GRAND TOTAL
// ===============================
export const getTotal = (cart, coupon = 0, taxRate = 0.05) => {
  const subtotal = getSubtotal(cart, coupon);
  const tax = getTax(subtotal, taxRate);

  return subtotal + tax;
};