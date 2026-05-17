import { createContext, useContext, useState } from "react";

// ================= CREATE CONTEXT =================
const CartContext = createContext();

// ================= PROVIDER =================
export const CartProvider = ({ children }) => {

  // 🔥 Load from localStorage first
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  // ================= ADD TO CART =================
  const addToCart = (book) => {
    if (!book) return;

    // ❌ prevent duplicate
    const exists = cart.some(item => item._id === book._id);
    if (exists) return;

    const updated = [...cart, book];

    setCart(updated); // ✅ IMPORTANT (updates UI instantly)
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ================= REMOVE =================
  const removeFromCart = (id) => {
    const updated = cart.filter(item => item._id !== id);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ================= CLEAR =================
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // ================= RETURN =================
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// ================= HOOK =================
// ⚠️ ONLY ONE useCart (DO NOT DUPLICATE)
export const useCart = () => useContext(CartContext);