import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { HiOutlineCreditCard, HiOutlineShoppingBag } from "react-icons/hi";
import { getFinalPrice, getSubtotal, getTax, getTotal } from "../utils/PriceUtils";

const BASE_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://book-management-system-ks6w.onrender.com";

const fmt = (n) => Math.round(Number(n || 0)).toLocaleString("en-BD");

const Cart = () => {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = getSubtotal(cart);
  const tax      = getTax(subtotal);
  const total    = getTotal(cart);

  return (
    // ✅ Issue 01: max-width container — content centred on wide screens
    // ✅ Issue 02: min-height — footer stays at bottom
    <div style={{
      minHeight: "calc(100vh - 64px - 80px)",
      background: "#f0f7fa",
      padding: "32px 16px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* ✅ Issue 01: max-width + margin auto */}
      <div style={{
        maxWidth: 860,
        margin: "0 auto",
      }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
          <FaShoppingCart style={{ fontSize:22, color:"#0e5a6f" }} />
          <h2 style={{ fontSize:22, fontWeight:700, color:"#0f172a" }}>
            Your Cart
            <span style={{ fontSize:14, fontWeight:400, color:"#94a3b8", marginLeft:8 }}>
              ({cart.length} {cart.length === 1 ? "item" : "items"})
            </span>
          </h2>
        </div>

        {/* Empty state */}
        {cart.length === 0 ? (
          <div style={{
            background:"#fff", borderRadius:16,
            border:"1px solid #e2e8f0",
            padding:"60px 20px", textAlign:"center",
          }}>
            <HiOutlineShoppingBag style={{ fontSize:48, color:"#cbd5e1", marginBottom:12 }} />
            <p style={{ fontSize:16, color:"#64748b", marginBottom:20 }}>Your cart is empty</p>
            <button
              onClick={() => navigate("/shop")}
              style={{
                background:"#0e5a6f", color:"#fff", border:"none",
                borderRadius:10, padding:"10px 24px",
                fontSize:14, fontWeight:600, cursor:"pointer",
                fontFamily:"inherit",
              }}
            >
              Browse Books →
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>

            {/* ── Cart Items ── */}
            <div style={{ flex:"1 1 500px" }}>
              {cart.map((item, i) => (
                <div key={item._id} style={{
                  background:"#fff", borderRadius:12,
                  border:"1px solid #e2e8f0",
                  padding:"16px", marginBottom:12,
                  display:"flex", alignItems:"center",
                  justifyContent:"space-between", gap:12,
                  boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
                }}>

                  {/* Left: image + info */}
                  <div style={{ display:"flex", gap:12, alignItems:"center", flex:1, minWidth:0 }}>
                    <img
                      src={
                        item.coverImage
                          ? item.coverImage.startsWith("http")
                            ? item.coverImage
                            : `${BASE_URL}${item.coverImage}`
                          : "https://via.placeholder.com/80"
                      }
                      alt={item.title}
                      style={{
                        width:52, height:70, objectFit:"cover",
                        borderRadius:6, flexShrink:0,
                        boxShadow:"0 2px 8px rgba(0,0,0,0.10)",
                      }}
                    />
                    <div style={{ minWidth:0 }}>
                      <p style={{
                        fontSize:14, fontWeight:600, color:"#0f172a",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>
                        {item.author}
                      </p>
                      {item.discount > 0 && (
                        <span style={{
                          fontSize:10, fontWeight:700, color:"#16a34a",
                          background:"#f0fdf4", border:"1px solid #86efac",
                          borderRadius:20, padding:"1px 8px", marginTop:4,
                          display:"inline-block",
                        }}>
                          -{item.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: price + remove */}
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                    <div style={{ textAlign:"right" }}>
                      {item.discount > 0 && (
                        <p style={{ fontSize:11, color:"#94a3b8", textDecoration:"line-through" }}>
                          ৳{fmt(item.price)}
                        </p>
                      )}
                      <p style={{ fontSize:15, fontWeight:700, color:"#0e5a6f" }}>
                        ৳{fmt(getFinalPrice(item))}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      style={{
                        display:"flex", alignItems:"center", gap:4,
                        background:"#fef2f2", color:"#dc2626",
                        border:"1px solid #fecaca", borderRadius:8,
                        padding:"6px 12px", fontSize:12, fontWeight:600,
                        cursor:"pointer", fontFamily:"inherit",
                        transition:"all 0.2s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background="#dc2626";
                        e.currentTarget.style.color="#fff";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background="#fef2f2";
                        e.currentTarget.style.color="#dc2626";
                      }}
                    >
                      <MdDeleteOutline style={{ fontSize:15 }}/> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order Summary ── */}
            <div style={{
              flex:"0 0 260px", background:"#fff",
              borderRadius:12, border:"1px solid #e2e8f0",
              padding:"20px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
              position:"sticky", top:80,
            }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", marginBottom:16 }}>
                Order Summary
              </h3>

              <div style={{ borderTop:"1px solid #f1f5f9" }}>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", fontSize:13, color:"#64748b" }}>
                  <span>Subtotal</span>
                  <span>৳{fmt(subtotal)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", fontSize:13, color:"#64748b", borderBottom:"1px solid #f1f5f9" }}>
                  <span>Tax (5%)</span>
                  <span>৳{fmt(tax)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", fontSize:16, fontWeight:700, color:"#0e5a6f" }}>
                  <span>Total</span>
                  <span>৳{fmt(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout", { state:{ cart, total } })}
                style={{
                  width:"100%",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  background:"#16a34a", color:"#fff", border:"none",
                  borderRadius:10, padding:"13px",
                  fontSize:14, fontWeight:700, cursor:"pointer",
                  fontFamily:"inherit", transition:"background 0.2s",
                  marginTop:4,
                }}
                onMouseEnter={e => e.currentTarget.style.background="#15803d"}
                onMouseLeave={e => e.currentTarget.style.background="#16a34a"}
              >
                <HiOutlineCreditCard style={{ fontSize:18 }} />
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/shop")}
                style={{
                  width:"100%", marginTop:10,
                  background:"none", border:"1px solid #e2e8f0",
                  borderRadius:10, padding:"10px",
                  fontSize:13, color:"#64748b", cursor:"pointer",
                  fontFamily:"inherit",
                }}
              >
                ← Continue Shopping
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;