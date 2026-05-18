import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineHome, HiOutlineBookOpen, HiOutlineShoppingBag,
  HiOutlineUser, HiOutlineSearch, HiOutlineLogout,
  HiOutlineChevronRight, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineTruck, HiOutlineCurrencyBangladeshi, HiOutlineLibrary,
  HiOutlineExclamationCircle, HiOutlinePencil, HiOutlineDownload,
  HiOutlineX, HiOutlineCheck, HiOutlineLockClosed,
} from "react-icons/hi";

// ─── constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://book-management-system-ks6w.onrender.com";

const STATUS_CFG = {
  pending:   { label: "Pending",   bg: "#FFF7ED", color: "#C2410C", icon: <HiOutlineClock />           },
  paid:      { label: "Paid",      bg: "#F0FDF4", color: "#15803D", icon: <HiOutlineCheckCircle />      },
  approved:  { label: "Approved",  bg: "#F0FDF4", color: "#15803D", icon: <HiOutlineCheckCircle />      },
  confirmed: { label: "Confirmed", bg: "#F0FDF4", color: "#15803D", icon: <HiOutlineCheckCircle />      },
  shipped:   { label: "Shipped",   bg: "#EFF6FF", color: "#1D4ED8", icon: <HiOutlineTruck />            },
  delivered: { label: "Delivered", bg: "#F5F3FF", color: "#6D28D9", icon: <HiOutlineCheckCircle />      },
  failed:    { label: "Failed",    bg: "#FFF1F2", color: "#BE123C", icon: <HiOutlineExclamationCircle />},
  cancelled: { label: "Cancelled", bg: "#FFF1F2", color: "#BE123C", icon: <HiOutlineExclamationCircle />},
};

const NAV_ITEMS = [
  { id: "overview", label: "Overview",   Icon: HiOutlineHome        },
  { id: "library",  label: "My Library", Icon: HiOutlineBookOpen    },
  { id: "orders",   label: "Orders",     Icon: HiOutlineShoppingBag },
  { id: "profile",  label: "Profile",    Icon: HiOutlineUser        },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const currency = (n) =>
  new Intl.NumberFormat("en-BD", { style:"currency", currency:"BDT", maximumFractionDigits:0 }).format(n ?? 0);

const dateStr = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════
const UserDashboard = () => {
  const { user, login } = useAuth();
  const navigate        = useNavigate();
  const location        = useLocation();

  const [tab,      setTab]      = useState("overview");
  const [orders,   setOrders]   = useState([]);
  const [library,  setLibrary]  = useState([]);
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);

  // profile edit state
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({ name:"", phone:"", address:"" });
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState("");

  // password change state
  const [pwForm,   setPwForm]   = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [pwMsg,    setPwMsg]    = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // invoice state
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // ─── fetch ─────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem("token");
    if (!userId) { navigate("/login"); return; }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const [libRes, ordRes, profRes] = await Promise.allSettled([
      axios.get(`${BASE_URL}/api/users/library/${userId}`),
      axios.get(`${BASE_URL}/api/orders/my/${userId}`, { headers }),
      axios.get(`${BASE_URL}/api/users/profile/${userId}`, { headers }),
    ]);

    if (libRes.status  === "fulfilled") setLibrary(libRes.value.data || []);
    if (ordRes.status  === "fulfilled") {
      const d = ordRes.value.data;
      setOrders(Array.isArray(d) ? d : []);
    }
    if (profRes.status === "fulfilled") {
      const p = profRes.value.data;
      setProfile(p);
      setForm({ name: p.name || "", phone: p.phone || "", address: p.address || "" });
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [location]);

  // ─── stats ──────────────────────────────────────────────────────────────
  const totalSpent = orders
    .filter(o => ["paid","approved","delivered"].includes(o.status))
    .reduce((s, o) => s + (o.amount ?? 0), 0);
  const delivered  = orders.filter(o => ["paid","approved","delivered"].includes(o.status)).length;
  const active     = orders.filter(o => o.status === "pending").length;

  const filteredLib = library.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── profile save ───────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    const userId = localStorage.getItem("userId");
    setSaving(true);
    try {
      const res = await axios.put(`${BASE_URL}/api/users/profile/${userId}`, form);
      setProfile(res.data.user);
      // update localStorage so navbar name updates
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: form.name }));
      setSaveMsg("✅ Profile updated!");
      setEditing(false);
    } catch {
      setSaveMsg("❌ Failed to update");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  // ─── password change ────────────────────────────────────────────────────
  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg("❌ New passwords don't match"); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg("❌ Password must be at least 6 characters"); return;
    }
    const userId = localStorage.getItem("userId");
    setPwSaving(true);
    try {
      await axios.put(`${BASE_URL}/api/users/change-password/${userId}`, {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      setPwMsg("✅ Password changed successfully!");
      setPwForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (e) {
      setPwMsg("❌ " + (e.response?.data?.message || "Failed"));
    } finally {
      setPwSaving(false);
      setTimeout(() => setPwMsg(""), 4000);
    }
  };

  // ─── invoice download (browser print) ──────────────────────────────────
  const downloadInvoice = (order) => {
    setInvoiceOrder(order);
    setTimeout(() => {
      const el = document.getElementById("invoice-print");
      if (!el) return;
      const win = window.open("", "_blank");
      win.document.write(`
        <html><head><title>Invoice #${order._id?.slice(-8).toUpperCase()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0e5a6f; padding-bottom: 20px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: 700; color: #0e5a6f; }
          .brand p { font-size: 12px; color: #666; font-weight: 400; margin-top: 4px; }
          .invoice-title { font-size: 14px; color: #666; text-align: right; }
          .invoice-title strong { font-size: 20px; color: #1a1a1a; display: block; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 8px; }
          .info-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 12px; color: #555; }
          td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .total-row td { font-weight: 700; font-size: 15px; border-top: 2px solid #0e5a6f; color: #0e5a6f; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; background: #F0FDF4; color: #15803D; font-size: 12px; font-weight: 600; }
          .footer { text-align: center; font-size: 12px; color: #888; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        </style>
        </head><body>
        <div class="header">
          <div class="brand">📚 ReadNOVA <p>Digital Book Store</p></div>
          <div class="invoice-title">
            <strong>INVOICE</strong>
            #${order._id?.slice(-8).toUpperCase()}<br/>
            ${dateStr(order.createdAt)}
          </div>
        </div>

        <div style="display:flex; gap:40px; margin-bottom:24px;">
          <div class="section" style="flex:1">
            <div class="section-title">Billed To</div>
            <strong>${profile?.name || user?.name || "—"}</strong><br/>
            ${profile?.email || user?.email || ""}<br/>
            ${profile?.phone ? "📞 " + profile.phone : ""}<br/>
            ${profile?.address ? "📍 " + profile.address : ""}
          </div>
          <div class="section" style="flex:1">
            <div class="section-title">Payment Info</div>
            <div class="info-row"><span>Method</span><span>${order.method?.toUpperCase() || "—"}</span></div>
            <div class="info-row"><span>Transaction ID</span><span>${order.tranId || "—"}</span></div>
            <div class="info-row"><span>Status</span><span class="status-badge">${order.status?.toUpperCase()}</span></div>
            <div class="info-row"><span>Date</span><span>${dateStr(order.paidAt || order.createdAt)}</span></div>
          </div>
        </div>

        <table>
          <thead><tr><th>#</th><th>Book Title</th><th style="text-align:right">Price</th></tr></thead>
          <tbody>
            ${(order.books || []).map((b, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${b.title || b.bookId?.title || "Book"}</td>
                <td style="text-align:right">${currency(b.price || 0)}</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="2">Total Amount</td>
              <td style="text-align:right">${currency(order.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Thank you for your purchase! All books are available in your library.<br/>
          ReadNOVA — support@readnova.com
        </div>
        </body></html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 400);
    }, 100);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  if (loading) return <PageLoader />;

  const avatarLetter = (profile?.name || user?.name || user?.email || "U")[0].toUpperCase();

  return (
    <div style={css.root}>

      {/* mobile overlay */}
      {sideOpen && <div style={css.overlay} onClick={() => setSideOpen(false)} />}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside style={{ ...css.sidebar, ...(sideOpen ? css.sidebarOpen : {}) }}>

        <div style={css.brand}>
          <span style={{ fontSize: 22 }}>📚</span>
          <span style={css.brandText}>ReadNOVA</span>
        </div>

        <div style={css.userCard}>
          <div style={css.avatarCircle}>{avatarLetter}</div>
          <div style={css.userInfo}>
            <p style={css.userName}>{profile?.name || user?.name || "Reader"}</p>
            <p style={css.userEmail}>{user?.email}</p>
          </div>
        </div>

        <nav style={css.nav}>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              style={{ ...css.navBtn, ...(tab === id ? css.navActive : {}) }}
              onClick={() => { setTab(id); setSideOpen(false); }}
            >
              <Icon style={{ fontSize: 17, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {tab === id && <HiOutlineChevronRight style={{ fontSize: 15 }} />}
            </button>
          ))}
        </nav>

        <div style={css.counters}>
          <Counter label="Books"   value={library.length} />
          <Counter label="Orders"  value={orders.length}  />
          <Counter label="Paid"    value={delivered}      />
        </div>

        <button style={css.logoutBtn} onClick={handleLogout}>
          <HiOutlineLogout /> Sign out
        </button>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <main style={css.main}>

        {/* topbar */}
        <header style={css.topbar}>
          <div style={css.topLeft}>
            <button style={css.hamburger} onClick={() => setSideOpen(v => !v)}>☰</button>
            <div>
              <h1 style={css.pageTitle}>{NAV_ITEMS.find(n => n.id === tab)?.label}</h1>
              <p style={css.pageDate}>
                {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
              </p>
            </div>
          </div>
          <button style={css.shopBtn} onClick={() => navigate("/shop")}>Browse Books →</button>
        </header>

        {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <section style={css.section}>
            <div style={css.statGrid}>
              <StatCard label="Total Spent"   value={currency(totalSpent)} icon={<HiOutlineCurrencyBangladeshi />} color="#0e5a6f" bg="#e6f2f6" />
              <StatCard label="Books Owned"   value={library.length}       icon={<HiOutlineBookOpen />}            color="#15803D" bg="#F0FDF4" />
              <StatCard label="Pending"       value={active}               icon={<HiOutlineClock />}               color="#C2410C" bg="#FFF7ED" />
              <StatCard label="Paid Orders"   value={delivered}            icon={<HiOutlineCheckCircle />}         color="#6D28D9" bg="#F5F3FF" />
            </div>

            <div style={css.twoCol}>
              <div style={css.card}>
                <div style={css.cardHead}>
                  <span style={css.cardTitle}>Recent Orders</span>
                  <button style={css.viewAll} onClick={() => setTab("orders")}>View all →</button>
                </div>
                {orders.length === 0
                  ? <EmptyState text="No orders yet" />
                  : orders.slice(0, 5).map(o => (
                      <OrderRow key={o._id} order={o} onInvoice={() => downloadInvoice(o)} />
                    ))
                }
              </div>

              <div style={css.card}>
                <div style={css.cardHead}>
                  <span style={css.cardTitle}>My Library</span>
                  <button style={css.viewAll} onClick={() => setTab("library")}>View all →</button>
                </div>
                {library.length === 0
                  ? <EmptyState text="No books yet" />
                  : (
                    <div style={css.bookPreviewGrid}>
                      {library.slice(0, 4).map(b => (
                        <BookThumb key={b._id} book={b} onClick={() => navigate(`/reader/${b._id}`)} />
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          </section>
        )}

        {/* ── LIBRARY ──────────────────────────────────────────────────── */}
        {tab === "library" && (
          <section style={css.section}>
            <div style={css.searchWrap}>
              <HiOutlineSearch style={{ color:"#94a3b8", fontSize:18, flexShrink:0 }} />
              <input
                style={css.searchInput}
                placeholder="Search by title or author…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {filteredLib.length === 0
              ? <div style={css.card}><EmptyState text={search ? "No matching books" : "Your library is empty"} /></div>
              : (
                <div style={css.bookGrid}>
                  {filteredLib.map(b => (
                    <BookCard key={b._id} book={b} onClick={() => navigate(`/reader/${b._id}`)} />
                  ))}
                </div>
              )
            }
          </section>
        )}

        {/* ── ORDERS ───────────────────────────────────────────────────── */}
        {tab === "orders" && (
          <section style={css.section}>
            <div style={css.card}>
              {orders.length === 0
                ? <EmptyState text="No orders found" />
                : orders.map(o => (
                    <OrderRow
                      key={o._id}
                      order={o}
                      expandable
                      expanded={expanded === o._id}
                      onToggle={() => setExpanded(expanded === o._id ? null : o._id)}
                      onInvoice={() => downloadInvoice(o)}
                    />
                  ))
              }
            </div>
          </section>
        )}

        {/* ── PROFILE ──────────────────────────────────────────────────── */}
        {tab === "profile" && (
          <section style={css.section}>
            <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:580 }}>

              {/* profile card */}
              <div style={css.card}>
                <div style={css.cardHead}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={css.profileAvatar}>{avatarLetter}</div>
                    <div>
                      <p style={{ fontSize:18, fontWeight:700, color:"#0f172a" }}>
                        {profile?.name || user?.name || "—"}
                      </p>
                      <p style={{ fontSize:12, color:"#0e5a6f", fontWeight:600 }}>✦ Member</p>
                    </div>
                  </div>
                  <button
                    style={css.editBtn}
                    onClick={() => { setEditing(e => !e); setSaveMsg(""); }}
                  >
                    {editing ? <><HiOutlineX /> Cancel</> : <><HiOutlinePencil /> Edit</>}
                  </button>
                </div>

                <div style={css.divider} />

                {/* fields */}
                {[
                  { label: "Full Name",  key: "name",    type: "text",  placeholder: "Your full name"   },
                  { label: "Phone",      key: "phone",   type: "tel",   placeholder: "01XXXXXXXXX"      },
                  { label: "Address",    key: "address", type: "text",  placeholder: "Your address"     },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <div style={css.profileRow}>
                      <span style={css.profileLabel}>{label}</span>
                      {editing
                        ? (
                          <input
                            type={type}
                            value={form[key]}
                            placeholder={placeholder}
                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                            style={css.profileInput}
                          />
                        )
                        : <span style={css.profileValue}>{profile?.[key] || "—"}</span>
                      }
                    </div>
                    <div style={css.divider} />
                  </div>
                ))}

                {/* email (read only) */}
                <div style={css.profileRow}>
                  <span style={css.profileLabel}>Email</span>
                  <span style={css.profileValue}>{user?.email || "—"}</span>
                </div>
                <div style={css.divider} />

                <div style={css.profileRow}>
                  <span style={css.profileLabel}>Member Since</span>
                  <span style={css.profileValue}>{dateStr(profile?.createdAt)}</span>
                </div>

                {/* save button */}
                {editing && (
                  <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:12 }}>
                    <button style={css.saveBtn} onClick={handleProfileSave} disabled={saving}>
                      {saving ? "Saving…" : <><HiOutlineCheck /> Save Changes</>}
                    </button>
                    {saveMsg && <span style={{ fontSize:13, color: saveMsg.startsWith("✅") ? "#15803D" : "#BE123C" }}>{saveMsg}</span>}
                  </div>
                )}
              </div>

              {/* change password card */}
              <div style={css.card}>
                <div style={css.cardHead}>
                  <span style={css.cardTitle}><HiOutlineLockClosed style={{ marginRight:6 }} />Change Password</span>
                </div>
                <div style={css.divider} />

                {[
                  { key:"currentPassword", label:"Current Password", placeholder:"Enter current password" },
                  { key:"newPassword",     label:"New Password",     placeholder:"Min 6 characters"       },
                  { key:"confirmPassword", label:"Confirm Password", placeholder:"Repeat new password"    },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom:12 }}>
                    <p style={{ ...css.profileLabel, marginBottom:6 }}>{label}</p>
                    <input
                      type="password"
                      value={pwForm[key]}
                      placeholder={placeholder}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ ...css.profileInput, width:"100%" }}
                    />
                  </div>
                ))}

                <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:4 }}>
                  <button style={css.saveBtn} onClick={handlePasswordChange} disabled={pwSaving}>
                    {pwSaving ? "Changing…" : "Change Password"}
                  </button>
                  {pwMsg && (
                    <span style={{ fontSize:13, color: pwMsg.startsWith("✅") ? "#15803D" : "#BE123C" }}>
                      {pwMsg}
                    </span>
                  )}
                </div>
              </div>

            </div>
          </section>
        )}

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        @keyframes spin   { to { transform: rotate(360deg) } }
        .book-hov:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.10) !important; }
        .book-hov:hover .bk-overlay { opacity:1 !important; }
        .nav-btn-hover:hover:not(.active) { background:#f1f5f9 !important; color:#0e5a6f !important; }
      `}</style>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

const StatCard = ({ label, value, icon, color, bg }) => (
  <div style={{ ...css.statCard, background: bg }}>
    <div style={{ ...css.statIcon, color, background:`${color}18` }}>{icon}</div>
    <div>
      <p style={{ ...css.statValue, color }}>{value}</p>
      <p style={css.statLabel}>{label}</p>
    </div>
  </div>
);

const OrderRow = ({ order, expandable, expanded, onToggle, onInvoice }) => {
  const st    = STATUS_CFG[order.status] ?? STATUS_CFG.pending;
  const items = order.books ?? [];
  const isPaid = ["paid","approved","delivered"].includes(order.status);
  return (
    <div style={css.orderRow}>
      <div style={css.orderMain} onClick={expandable ? onToggle : undefined}>
        <div style={{ ...css.statusBadge, background:st.bg, color:st.color }}>
          {st.icon} {st.label}
        </div>
        <div style={css.orderMeta}>
          <span style={css.orderId}>#{(order._id ?? "").slice(-8).toUpperCase()}</span>
          <span style={css.orderDate}>{dateStr(order.createdAt)}</span>
        </div>
        <span style={css.orderAmt}>{currency(order.amount ?? 0)}</span>
        {/* invoice download — only for paid */}
        {isPaid && (
          <button
            style={css.invoiceBtn}
            onClick={e => { e.stopPropagation(); onInvoice && onInvoice(); }}
            title="Download Invoice"
          >
            <HiOutlineDownload /> Invoice
          </button>
        )}
        {expandable && <span style={{ color:"#94a3b8", fontSize:12 }}>{expanded ? "▲" : "▼"}</span>}
      </div>

      {expanded && (
        <div style={css.orderExpand}>
          {items.length > 0
            ? items.map((b, i) => (
                <div key={i} style={css.orderItem}>
                  <span>{b.title || b.bookId?.title || "Book"}</span>
                  <span style={{ color:"#64748b" }}>{currency(b.price || 0)}</span>
                </div>
              ))
            : <p style={{ color:"#94a3b8", fontSize:13 }}>No item details</p>
          }
          <div style={{ ...css.orderItem, borderTop:"1px solid #e2e8f0", marginTop:8, paddingTop:8 }}>
            <span style={{ fontWeight:600 }}>Total</span>
            <span style={{ fontWeight:700, color:"#0e5a6f" }}>{currency(order.amount)}</span>
          </div>
          {order.tranId && (
            <p style={{ fontSize:11, color:"#94a3b8", marginTop:6 }}>TXN: {order.tranId}</p>
          )}
        </div>
      )}
    </div>
  );
};

const BookThumb = ({ book, onClick }) => {
  const src = book.coverImage
    ? (book.coverImage.startsWith("http") ? book.coverImage : `${BASE_URL}${book.coverImage}`)
    : null;
  return (
    <div style={css.bookThumb} onClick={onClick} className="book-hov">
      <div style={css.bookThumbCover}>
        {src
          ? <img src={src} alt={book.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <div style={css.bookThumbPlaceholder}>{(book.title||"B")[0]}</div>
        }
      </div>
      <p style={css.bookThumbTitle}>{book.title}</p>
    </div>
  );
};

const BookCard = ({ book, onClick }) => {
  const src = book.coverImage
    ? (book.coverImage.startsWith("http") ? book.coverImage : `${BASE_URL}${book.coverImage}`)
    : null;
  return (
    <div style={css.bookCard} onClick={onClick} className="book-hov">
      <div style={css.bookCover}>
        {src
          ? <img src={src} alt={book.title} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:8 }} />
          : <div style={css.bookPlaceholder}>{(book.title||"B")[0]}</div>
        }
        <div style={css.bookReadOverlay} className="bk-overlay">
          <span style={{ color:"#fff", fontSize:13, fontWeight:600 }}>📖 Read</span>
        </div>
      </div>
      <p style={css.bookTitle}>{book.title}</p>
      <p style={css.bookAuthor}>{book.author || ""}</p>
    </div>
  );
};

const Counter = ({ label, value }) => (
  <div style={css.counter}>
    <span style={css.counterVal}>{value}</span>
    <span style={css.counterLabel}>{label}</span>
  </div>
);

const EmptyState = ({ text }) => (
  <div style={css.empty}>
    <HiOutlineLibrary style={{ fontSize:40, color:"#cbd5e1" }} />
    <p style={{ color:"#94a3b8", fontSize:14, marginTop:8 }}>{text}</p>
  </div>
);

const PageLoader = () => (
  <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc" }}>
    <div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTop:"3px solid #0e5a6f",
      borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════
const css = {
  root:    { display:"flex", minHeight:"100vh", background:"#f8fafc", fontFamily:"'Plus Jakarta Sans', sans-serif", position:"relative" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:40 },

  sidebar: {
    width:248, flexShrink:0, background:"#fff",
    borderRight:"1px solid #e2e8f0",
    display:"flex", flexDirection:"column", padding:"24px 0",
    position:"sticky", top:0, height:"100vh", overflowY:"auto",
    zIndex:50, transition:"transform 0.25s",
  },
  sidebarOpen: { position:"fixed", left:0, top:0, height:"100vh", boxShadow:"4px 0 24px rgba(0,0,0,0.12)" },

  brand:    { display:"flex", alignItems:"center", gap:10, padding:"0 20px 20px", borderBottom:"1px solid #f1f5f9" },
  brandText:{ fontSize:16, fontWeight:700, color:"#0e5a6f", letterSpacing:"-0.02em" },

  userCard:    { display:"flex", alignItems:"center", gap:10, padding:"16px 20px", borderBottom:"1px solid #f1f5f9" },
  avatarCircle:{ width:40, height:40, borderRadius:"50%", background:"#0e5a6f", color:"#fff",
                 display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, flexShrink:0 },
  userInfo:    { overflow:"hidden" },
  userName:    { fontSize:14, fontWeight:600, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  userEmail:   { fontSize:11, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },

  nav:       { padding:"12px", flex:1 },
  navBtn:    {
    width:"100%", display:"flex", alignItems:"center", gap:10,
    padding:"10px 12px", borderRadius:8, border:"none", background:"transparent",
    color:"#64748b", fontSize:13, fontWeight:500, cursor:"pointer",
    marginBottom:2, transition:"all 0.15s", textAlign:"left",
    fontFamily:"'Plus Jakarta Sans', sans-serif",
  },
  navActive: { background:"#e6f2f6", color:"#0e5a6f", fontWeight:600 },

  counters:     { display:"flex", justifyContent:"space-around", padding:"14px 12px", borderTop:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9" },
  counter:      { textAlign:"center" },
  counterVal:   { display:"block", fontSize:18, fontWeight:700, color:"#0e5a6f" },
  counterLabel: { display:"block", fontSize:10, color:"#94a3b8", marginTop:2 },

  logoutBtn: {
    display:"flex", alignItems:"center", gap:8,
    margin:"14px 12px 0", padding:"10px 12px", borderRadius:8,
    border:"1px solid #fee2e2", background:"#fff5f5",
    color:"#ef4444", fontSize:13, fontWeight:500, cursor:"pointer",
    fontFamily:"'Plus Jakarta Sans', sans-serif",
  },

  main:      { flex:1, minWidth:0, display:"flex", flexDirection:"column" },
  topbar:    { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 28px", background:"#fff", borderBottom:"1px solid #e2e8f0", flexShrink:0 },
  topLeft:   { display:"flex", alignItems:"center", gap:12 },
  hamburger: { background:"none", border:"none", fontSize:20, color:"#64748b", cursor:"pointer" },
  pageTitle: { fontSize:20, fontWeight:700, color:"#0f172a" },
  pageDate:  { fontSize:12, color:"#94a3b8", marginTop:2 },
  shopBtn:   { padding:"8px 18px", borderRadius:8, background:"#e6f2f6", border:"1px solid #b3d9e6", color:"#0e5a6f", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" },

  section:  { padding:"24px 28px", animation:"fadeUp 0.25s ease both" },

  statGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px,1fr))", gap:16, marginBottom:24 },
  statCard: { borderRadius:12, padding:"18px 16px", display:"flex", alignItems:"center", gap:14, border:"1px solid #e2e8f0" },
  statIcon: { width:44, height:44, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 },
  statValue:{ fontSize:22, fontWeight:700 },
  statLabel:{ fontSize:12, color:"#64748b", marginTop:2 },

  twoCol: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:20 },

  card:     { background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", padding:"20px" },
  cardHead: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  cardTitle:{ fontSize:15, fontWeight:600, color:"#0f172a" },
  viewAll:  { background:"none", border:"none", color:"#0e5a6f", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" },

  orderRow:   { borderBottom:"1px solid #f1f5f9", padding:"12px 0" },
  orderMain:  { display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", cursor:"pointer" },
  statusBadge:{ display:"flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, flexShrink:0 },
  orderMeta:  { flex:1, display:"flex", flexDirection:"column", gap:1 },
  orderId:    { fontSize:13, fontWeight:600, color:"#0f172a" },
  orderDate:  { fontSize:11, color:"#94a3b8" },
  orderAmt:   { fontSize:14, fontWeight:700, color:"#0e5a6f" },
  invoiceBtn: {
    display:"flex", alignItems:"center", gap:4,
    padding:"4px 10px", borderRadius:6,
    background:"#e6f2f6", border:"1px solid #b3d9e6",
    color:"#0e5a6f", fontSize:11, fontWeight:600, cursor:"pointer",
    fontFamily:"'Plus Jakarta Sans', sans-serif",
  },
  orderExpand:{ marginTop:10, padding:"10px 12px", background:"#f8fafc", borderRadius:8 },
  orderItem:  { display:"flex", justifyContent:"space-between", fontSize:13, color:"#374151", marginBottom:4 },

  searchWrap: { display:"flex", alignItems:"center", gap:10, background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:"10px 14px", marginBottom:20 },
  searchInput:{ flex:1, border:"none", background:"transparent", fontSize:14, color:"#0f172a", outline:"none", fontFamily:"'Plus Jakarta Sans', sans-serif" },

  bookGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(148px,1fr))", gap:18 },
  bookCard: { background:"#fff", borderRadius:10, border:"1px solid #e2e8f0", padding:12, cursor:"pointer", transition:"transform 0.2s, box-shadow 0.2s" },
  bookCover:{ width:"100%", aspectRatio:"3/4", borderRadius:8, overflow:"hidden", background:"#f1f5f9", position:"relative", marginBottom:10 },
  bookPlaceholder:  { width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:700, color:"#0e5a6f", background:"linear-gradient(135deg,#e6f2f6,#b3d9e6)" },
  bookReadOverlay:  { position:"absolute", inset:0, background:"rgba(14,90,111,0.72)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s", borderRadius:8 },
  bookTitle:  { fontSize:13, fontWeight:600, color:"#0f172a", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" },
  bookAuthor: { fontSize:11, color:"#94a3b8", marginTop:3 },

  bookPreviewGrid:    { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 },
  bookThumb:          { cursor:"pointer", transition:"transform 0.2s" },
  bookThumbCover:     { width:"100%", aspectRatio:"3/4", borderRadius:6, overflow:"hidden", background:"#f1f5f9", marginBottom:6 },
  bookThumbPlaceholder:{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:700, color:"#0e5a6f", background:"linear-gradient(135deg,#e6f2f6,#b3d9e6)" },
  bookThumbTitle:     { fontSize:11, color:"#374151", fontWeight:500, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" },

  profileAvatar:{ width:60, height:60, borderRadius:"50%", background:"#0e5a6f", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:700, flexShrink:0 },
  profileRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", flexWrap:"wrap", gap:8 },
  profileLabel: { fontSize:11, color:"#94a3b8", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em" },
  profileValue: { fontSize:14, color:"#0f172a", fontWeight:500 },
  profileInput: { border:"1px solid #e2e8f0", borderRadius:8, padding:"7px 12px", fontSize:14, color:"#0f172a", outline:"none", fontFamily:"'Plus Jakarta Sans', sans-serif", minWidth:200 },
  divider:      { borderTop:"1px solid #f1f5f9" },

  editBtn: { display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" },
  saveBtn: { display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, background:"#0e5a6f", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" },

  empty: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 0" },
};

export default UserDashboard;