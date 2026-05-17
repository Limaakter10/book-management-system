import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

// ✅ Professional icons (better UI)
import { FaShoppingCart } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { HiOutlineCreditCard } from "react-icons/hi";

// ✅ IMPORT PRICE UTILS
import {
  getFinalPrice,
  getSubtotal,
  getTax,
  getTotal
} from "../utils/PriceUtils";

// 🔥 Backend base URL (image fix er jonno)
const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const Cart = () => {

  // ================= CONTEXT =================
  const { cart, removeFromCart } = useCart(); // cart data + remove function
  const navigate = useNavigate(); // page navigation

  // ================= CALCULATIONS =================
  const subtotal = getSubtotal(cart); // discount applied subtotal
  const tax = getTax(subtotal);       // 5% tax calculation
  const total = getTotal(cart);       // final total (subtotal + tax)

  return (
    <div className="p-6">

      {/* ================= TITLE ================= */}
      <h2 className="text-2xl mb-4 flex items-center gap-2">
        <FaShoppingCart /> Your Cart
      </h2>

      {/* ================= EMPTY CART ================= */}
      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <>
          {/* ================= CART ITEMS ================= */}
          {cart.map(item => (
            <div
              key={item._id}
              className="flex justify-between items-center mb-4 border p-3 rounded"
            >

              {/* 🔥 LEFT SIDE (IMAGE + INFO) */}
              <div className="flex gap-3 items-center">

                {/* ✅ BOOK IMAGE */}
                <img
                  src={
                    item.coverImage
                      ? `${BASE_URL}${item.coverImage}` // backend image
                      : "https://via.placeholder.com/80"
                  }
                  className="w-12 h-16 object-cover rounded"
                />

                {/* 📘 BOOK INFO */}
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.author}</p>
                </div>

              </div>

              {/* 🔥 RIGHT SIDE (PRICE + REMOVE) */}
              <div className="flex gap-4 items-center">

                {/* 💰 FINAL PRICE (after discount) */}
                <span className="font-bold">
                  ৳ {getFinalPrice(item).toFixed(2)}
                </span>

                {/* ❌ REMOVE BUTTON */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                >
                  <MdDeleteOutline /> Remove
                </button>
              </div>
            </div>
          ))}

          {/* ================= PRICE SUMMARY ================= */}
          <div className="mt-4 space-y-1">

            {/* subtotal */}
            <h3>Subtotal: ৳ {subtotal.toFixed(2)}</h3>

            {/* tax */}
            <h4>Tax (5%): ৳ {tax.toFixed(2)}</h4>

            {/* total */}
            <h2 className="text-xl font-bold">
              Total: ৳ {total.toFixed(2)}
            </h2>

          </div>

          {/* ================= CHECKOUT BUTTON ================= */}
          <button
            onClick={() =>
              navigate("/checkout", {
                state: { cart, total }, // pass cart + total
              })
            }
            className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 flex items-center gap-2"
          >
            <HiOutlineCreditCard /> Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;