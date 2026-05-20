import { createContext, useContext, useState } from "react";

// ── Create context ────────────────────────────────────────────
const CartContext = createContext();

// ── Provider ──────────────────────────────────────────────────
export const CartProvider = ({ children }) => {

  // Load existing cart from localStorage on first render
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  // ── Add to cart ───────────────────────────────────────────
  const addToCart = (book) => {
    if (!book) return;

    // Prevent duplicate
    const exists = cart.some(item => item._id === book._id);
    if (exists) return;

    // ✅ Explicitly pick fields + force discount to Number
    // This ensures discount is always saved correctly
    const cartItem = {
      _id:        book._id,
      title:      book.title,
      author:     book.author,
      price:      Number(book.price || 0),
      discount:   Number(book.discount || 0), // ✅ "50" → 50
      coverImage: book.coverImage,
      pdfUrl:     book.pdfUrl,
      category:   book.category,
      subCategory: book.subCategory,
    };

    const updated = [...cart, cartItem];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ── Remove from cart ──────────────────────────────────────
  const removeFromCart = (id) => {
    const updated = cart.filter(item => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ── Clear entire cart ─────────────────────────────────────
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────
export const useCart = () => useContext(CartContext);