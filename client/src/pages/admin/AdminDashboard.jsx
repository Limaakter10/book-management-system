import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCurrencyBangladeshi,
  HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineTrendingUp,
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineChat,
  HiOutlinePlus, HiOutlineDownload, HiOutlineRefresh,
  HiOutlineDocumentReport, HiOutlineExclamationCircle,
} from "react-icons/hi";

const fmt = (n) => {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(num));
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                height:"100vh", background:"#f0f8ff" }}>
    <div style={{ width:44, height:44, border:"4px solid #dde8f0",
                  borderTopColor:"#1a6b7c", borderRadius:"50%",
                  animation:"spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, Icon, sub, color, bg }) => (
  <div
    style={{ background:"#fff", borderRadius:14, padding:"20px 22px",
             border:"1px solid #e2e8f0",
             boxShadow:"0 2px 10px rgba(26,107,124,0.06)",
             transition:"transform 0.2s, box-shadow 0.2s", cursor:"default" }}
    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)";
                         e.currentTarget.style.boxShadow="0 8px 24px rgba(26,107,124,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform="none";
                         e.currentTarget.style.boxShadow="0 2px 10px rgba(26,107,124,0.06)"; }}
  >
    <div style={{ width:46, height:46, borderRadius:12, background:bg,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginBottom:14 }}>
      <Icon style={{ fontSize:22, color }} />
    </div>
    <p style={{ fontSize:11, color:"#9ca3af", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>
      {title}
    </p>
    <p style={{ fontSize:26, fontWeight:800, color:"#1a1a1a",
                fontFamily:"Georgia,serif", lineHeight:1 }}>
      {value}
    </p>
    {sub && <p style={{ fontSize:12, color:"#6b7280", marginTop:6 }}>{sub}</p>}
  </div>
);

// ── Bar Chart ─────────────────────────────────────────────────────────────────
const BarChart = ({ data }) => {
  const [hovered, setHovered] = useState(null);
  const ALL_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dataMap    = Object.fromEntries((data||[]).map(d => [d.label, d.value]));
  const fullData   = ALL_MONTHS.map(m => ({ label:m, value: dataMap[m]||0 }));
  const max        = Math.max(...fullData.map(d => d.value), 1);
  const W=580, H=180, PAD_L=52, PAD_R=16;
  const slots=fullData.length, slotW=(W-PAD_L-PAD_R)/slots;
  const barW=Math.max(16, slotW*0.52);
  const curMon=new Date().toLocaleString("en",{month:"short"});

  return (
    <div style={{ position:"relative" }}>
      <div style={{ position:"absolute", top:0, right:0, background:"#e6f7f9",
                    border:"1px solid #b3dde6", borderRadius:8, padding:"4px 12px",
                    fontSize:11, color:"#1a6b7c", fontWeight:700 }}>
        Total: BDT {fmt(fullData.reduce((s,d)=>s+d.value,0))}
      </div>
      <svg viewBox={`0 0 ${W} ${H+32}`} width="100%" style={{ overflow:"visible", display:"block" }}>
        <defs>
          <linearGradient id="bActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a6b7c"/>
            <stop offset="100%" stopColor="#0d4a57" stopOpacity="0.85"/>
          </linearGradient>
          <linearGradient id="bHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5a623"/>
            <stop offset="100%" stopColor="#d4891a" stopOpacity="0.9"/>
          </linearGradient>
          <filter id="bShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1a6b7c" floodOpacity="0.2"/>
          </filter>
        </defs>
        {[0,0.25,0.5,0.75,1].map(f => {
          const gy = H - H*f;
          return (
            <g key={f}>
              <line x1={PAD_L} y1={gy} x2={W-PAD_R} y2={gy}
                    stroke={f===0?"#cbd5e1":"#f1f5f9"} strokeWidth={f===0?1.5:1}
                    strokeDasharray={f>0?"4 3":"none"}/>
              <text x={PAD_L-8} y={gy+4} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="monospace">
                {max*f>=1000?`${((max*f)/1000).toFixed(0)}k`:fmt(max*f)}
              </text>
            </g>
          );
        })}
        {fullData.map((d,i) => {
          const cx=PAD_L+i*slotW+slotW/2, x=cx-barW/2;
          const bh=d.value>0?Math.max(6,(d.value/max)*H):3, y=H-bh;
          const isH=hovered===i, isCur=d.label===curMon;
          return (
            <g key={i} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}
               style={{ cursor:d.value>0?"pointer":"default" }}>
              {isH&&<rect x={cx-slotW/2+2} y={4} width={slotW-4} height={H-4}
                           fill="#f0f8ff" rx={6} opacity="0.9"/>}
              <rect x={x} y={y} width={barW} height={bh}
                    fill={d.value===0?"#e2e8f0":isH?"url(#bHover)":"url(#bActive)"}
                    rx={d.value>0?5:2}
                    filter={d.value>0&&isH?"url(#bShadow)":"none"}/>
              {isH&&d.value>0&&(
                <g>
                  <rect x={cx-32} y={y-26} width={64} height={18} fill="#1a1a1a" rx={4} opacity="0.88"/>
                  <text x={cx} y={y-13} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
                    BDT {fmt(d.value)}
                  </text>
                </g>
              )}
              {!isH&&d.value>0&&(
                <text x={cx} y={y-5} textAnchor="middle" fontSize="7.5" fontWeight="700"
                      fill="#1a6b7c" opacity="0.75">
                  {d.value>=1000?`${(d.value/1000).toFixed(1)}k`:d.value}
                </text>
              )}
              <text x={cx} y={H+17} textAnchor="middle" fontSize="9"
                    fill={isH?"#1a6b7c":isCur?"#1a6b7c":"#94a3b8"}
                    fontWeight={isH||isCur?"700":"400"}>
                {d.label}
              </text>
              {isCur&&<circle cx={cx} cy={H+26} r={2.5} fill="#1a6b7c"/>}
            </g>
          );
        })}
        <line x1={PAD_L} y1={H} x2={W-PAD_R} y2={H} stroke="#cbd5e1" strokeWidth="1.5"/>
      </svg>
    </div>
  );
};

// ── Action Card ───────────────────────────────────────────────────────────────
const ActionCard = ({ Icon, label, to, onClick, color }) => {
  const inner = (
    <div
      style={{ background:"#fff", borderRadius:14, padding:"18px 14px",
               border:`1.5px solid ${color}22`, cursor:"pointer",
               boxShadow:"0 1px 6px rgba(26,107,124,0.05)",
               display:"flex", flexDirection:"column", alignItems:"center",
               gap:10, transition:"all 0.2s", textAlign:"center" }}
      onMouseEnter={e => { e.currentTarget.style.background=`${color}0f`;
                           e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background="#fff";
                           e.currentTarget.style.transform="none"; }}
    >
      <div style={{ width:44, height:44, borderRadius:12, background:`${color}14`,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon style={{ fontSize:22, color }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, color }}>{label}</span>
    </div>
  );
  return to
    ? <Link to={to} style={{ textDecoration:"none" }}>{inner}</Link>
    : <div onClick={onClick}>{inner}</div>;
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [time,    setTime]    = useState(new Date());
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => setStats({
        totalUsers:0, totalOrders:0, totalRevenue:0, totalBooks:0,
        paidOrders:0, failedOrders:0, weeklySales:0, monthlySales:0,
        monthlyUsers:0, monthlyRevenue:{}, recentOrders:[],
        topBooks:[], categoryStats:[], unreadMessages:0,
      }))
      .finally(() => setLoading(false));
  }, [refresh]);

  if (loading) return <Spinner />;

  // ── ✅ backend field names এর সাথে মিলিয়ে নেওয়া ──────────────────────────
  const totalRevenue   = stats?.totalRevenue   || 0;
  const totalOrders    = stats?.totalOrders    || 0;
  const totalUsers     = stats?.totalUsers     || 0;
  const totalBooks     = stats?.totalBooks     || 0;
  const paidOrders     = stats?.paidOrders     || 0;
  const failedOrders   = stats?.failedOrders   || 0;
  const weeklySales    = stats?.weeklySales    || 0;
  const monthlySales   = stats?.monthlySales   || 0;
  const monthlyUsers   = stats?.monthlyUsers   || 0;
  const unreadMessages = stats?.unreadMessages || 0;

  const avgOrder = paidOrders > 0
    ? Math.round(totalRevenue / paidOrders) : 0;

  const convRate = totalOrders > 0
    ? ((paidOrders / totalOrders) * 100).toFixed(1) : "0.0";

  // ── chart data ─────────────────────────────────────────────────────────────
  const chartData = Object.entries(stats?.monthlyRevenue || {})
    .map(([label, value]) => ({ label, value: Math.round(value) }));

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const finalChart = chartData.length > 0
    ? chartData
    : monthNames.slice(0,7).map(m => ({ label:m, value:0 }));

  const recentOrders = stats?.recentOrders  || [];
  const topBooks     = stats?.topBooks      || [];
  const categories   = stats?.categoryStats || [];

  // ── CSV download ───────────────────────────────────────────────────────────
  const downloadReport = () => {
    const rows = [
      ["ReadNOVA Admin Report", new Date().toLocaleString("en-BD")], [],
      ["Metric","Value"],
      ["Total Users",      totalUsers],
      ["Total Orders",     totalOrders],
      ["Paid Orders",      paidOrders],
      ["Failed Orders",    failedOrders],
      ["Total Revenue",    `BDT ${fmt(totalRevenue)}`],
      ["Total Books",      totalBooks],
      ["Weekly Sales",     `BDT ${fmt(weeklySales)}`],
      ["Monthly Sales",    `BDT ${fmt(monthlySales)}`],
      ["Avg Order Value",  `BDT ${fmt(avgOrder)}`],
      ["Conversion Rate",  `${convRate}%`],
      ["Unread Messages",  unreadMessages],
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download=`ReadNOVA-Report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const dateStr = time.toLocaleDateString("en-BD",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const timeStr = time.toLocaleTimeString("en-BD",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif",
                  background:"#f0f8ff", minHeight:"100vh", paddingBottom:48 }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ background:"linear-gradient(135deg,#1a6b7c 0%,#0f3d47 100%)",
                    padding:"28px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-40,right:-40,width:180,height:180,
                      borderRadius:"50%",background:"rgba(245,166,35,0.12)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",bottom:-50,left:"40%",width:140,height:140,
                      borderRadius:"50%",background:"rgba(255,255,255,0.06)",pointerEvents:"none" }}/>

        <div style={{ position:"relative",zIndex:1,display:"flex",
                      alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16 }}>
          <div>
            <p style={{ fontSize:11,color:"rgba(255,255,255,0.6)",letterSpacing:"0.06em",
                        textTransform:"uppercase",marginBottom:4 }}>
              {greeting()} 👋
            </p>
            <h1 style={{ fontFamily:"Georgia,serif",
                          fontSize:"clamp(1.4rem,3vw,1.9rem)",
                          fontWeight:800,color:"#fff",marginBottom:6 }}>
              Admin Dashboard
            </h1>
            <div style={{ display:"flex",gap:16,fontSize:12,color:"rgba(255,255,255,0.65)" }}>
              <span>📅 {dateStr}</span>
              <span>🕐 {timeStr}</span>
            </div>
          </div>

          <div style={{ display:"flex",gap:10 }}>
            <button onClick={()=>setRefresh(r=>r+1)}
              style={{ display:"flex",alignItems:"center",gap:7,padding:"10px 18px",
                       background:"rgba(255,255,255,0.12)",color:"#fff",
                       border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,
                       fontWeight:600,cursor:"pointer",fontFamily:"inherit",fontSize:13 }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}>
              <HiOutlineRefresh style={{fontSize:16}}/> Refresh
            </button>
            <button onClick={downloadReport}
              style={{ display:"flex",alignItems:"center",gap:7,padding:"10px 18px",
                       background:"#f5a623",color:"#1a1a1a",border:"none",borderRadius:10,
                       fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:13 }}
              onMouseEnter={e=>e.currentTarget.style.background="#e09b1a"}
              onMouseLeave={e=>e.currentTarget.style.background="#f5a623"}>
              <HiOutlineDownload style={{fontSize:16}}/> Download Report
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:"28px 32px" }}>

        {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
        <div style={{ display:"grid",
                      gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",
                      gap:16, marginBottom:24 }}>
          <StatCard
            title="Total Users" value={fmt(totalUsers)}
            Icon={HiOutlineUsers} color="#1a6b7c" bg="#e6f7f9"
            sub={`+${monthlyUsers} this month`}
          />
          <StatCard
            title="Total Orders" value={fmt(totalOrders)}
            Icon={HiOutlineShoppingBag} color="#7c3aed" bg="#f3f0ff"
            sub={`${paidOrders} paid · ${failedOrders} failed`}
          />
          <StatCard
            title="Total Revenue" value={`BDT ${fmt(totalRevenue)}`}
            Icon={HiOutlineCurrencyBangladeshi} color="#059669" bg="#ecfdf5"
            sub={`BDT ${fmt(weeklySales)} this week`}
          />
          <StatCard
            title="Total Books" value={fmt(totalBooks)}
            Icon={HiOutlineBookOpen} color="#f5a623" bg="#fffbeb"
            sub="In catalogue"
          />
          <StatCard
            title="Paid Orders" value={fmt(paidOrders)}
            Icon={HiOutlineCheckCircle} color="#16a34a" bg="#f0fdf4"
            sub={`${convRate}% conversion rate`}
          />
          <StatCard
            title="Failed Orders" value={fmt(failedOrders)}
            Icon={HiOutlineExclamationCircle} color="#dc2626" bg="#fef2f2"
            sub="Payment failed"
          />
          <StatCard
            title="Avg Order Value" value={`BDT ${fmt(avgOrder)}`}
            Icon={HiOutlineTrendingUp} color="#0891b2" bg="#ecfeff"
            sub="Per paid transaction"
          />
          <StatCard
            title="Monthly Sales" value={`BDT ${fmt(monthlySales)}`}
            Icon={HiOutlineClock} color="#7c3aed" bg="#f3f0ff"
            sub="This month (paid)"
          />
          <StatCard
            title="Unread Messages" value={fmt(unreadMessages)}
            Icon={HiOutlineChat} color="#dc2626" bg="#fef2f2"
            sub="Needs attention"
          />
        </div>

        {/* ── CHART + CATEGORIES ──────────────────────────────────────────── */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",
                      gap:20, marginBottom:24 }}>

          <div style={{ background:"#fff",borderRadius:14,padding:"22px 24px",
                        border:"1px solid #e2e8f0",
                        boxShadow:"0 2px 10px rgba(26,107,124,0.06)" }}>
            <h3 style={{ fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,
                          color:"#1a1a1a",marginBottom:16,
                          display:"flex",alignItems:"center",gap:8 }}>
              <HiOutlineDocumentReport style={{color:"#1a6b7c",fontSize:18}}/>
              Monthly Revenue (BDT)
            </h3>
            <BarChart data={finalChart}/>
          </div>

          <div style={{ background:"#fff",borderRadius:14,padding:"22px 24px",
                        border:"1px solid #e2e8f0",
                        boxShadow:"0 2px 10px rgba(26,107,124,0.06)" }}>
            <h3 style={{ fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,
                          color:"#1a1a1a",marginBottom:16,
                          display:"flex",alignItems:"center",gap:8 }}>
              <HiOutlineBookOpen style={{color:"#f5a623",fontSize:18}}/>
              Books by Category
            </h3>
            {categories.length === 0
              ? <p style={{color:"#9ca3af",fontSize:13,textAlign:"center",padding:"20px 0"}}>
                  No category data yet
                </p>
              : categories.map((cat,i) => {
                  const maxC = Math.max(...categories.map(c=>c.count), 1);
                  const pct  = Math.round((cat.count/maxC)*100);
                  const cols = ["#1a6b7c","#f5a623","#10b981","#7c3aed","#e94560","#3b82f6"];
                  const col  = cols[i%cols.length];
                  return (
                    <div key={cat._id} style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",
                                   marginBottom:5,fontSize:12}}>
                        <span style={{fontWeight:600,color:"#374151"}}>
                          {cat._id||"General"}
                        </span>
                        <span style={{color:col,fontWeight:700}}>{cat.count}</span>
                      </div>
                      <div style={{height:6,background:"#f1f5f9",
                                   borderRadius:10,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:col,
                                     borderRadius:10,transition:"width 0.6s ease"}}/>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* ── RECENT ORDERS + TOP BOOKS ───────────────────────────────────── */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",
                      gap:20, marginBottom:24 }}>

          <div style={{ background:"#fff",borderRadius:14,padding:"22px 24px",
                        border:"1px solid #e2e8f0",
                        boxShadow:"0 2px 10px rgba(26,107,124,0.06)" }}>
            <div style={{display:"flex",justifyContent:"space-between",
                         alignItems:"center",marginBottom:16}}>
              <h3 style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,
                           color:"#1a1a1a",display:"flex",alignItems:"center",gap:8}}>
                <HiOutlineClipboardList style={{color:"#7c3aed",fontSize:18}}/>
                Recent Orders
              </h3>
              <Link to="/admin/orders"
                style={{fontSize:12,color:"#1a6b7c",fontWeight:600,textDecoration:"none"}}>
                View all →
              </Link>
            </div>
            {recentOrders.length === 0
              ? <p style={{color:"#9ca3af",fontSize:13,textAlign:"center",
                           padding:"20px 0"}}>No orders yet</p>
              : recentOrders.slice(0,6).map(o => {
                  const sc = o.status === "paid" ? "#16a34a" : "#dc2626";
                  return (
                    <div key={o._id}
                      style={{display:"flex",alignItems:"center",
                               justifyContent:"space-between",
                               padding:"10px 0",borderBottom:"1px solid #f1f5f9",gap:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:13,fontWeight:600,color:"#0f172a",
                                   overflow:"hidden",textOverflow:"ellipsis",
                                   whiteSpace:"nowrap"}}>
                          {o.userId?.email || o.userId?.name || "—"}
                        </p>
                        <p style={{fontSize:11,color:"#94a3b8",marginTop:1}}>
                          #{(o._id||"").slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <p style={{fontSize:13,fontWeight:700,color:"#1a6b7c"}}>
                          BDT {fmt(o.amount)}
                        </p>
                        <span style={{fontSize:10,fontWeight:600,color:sc,
                                       background:`${sc}14`,padding:"2px 8px",
                                       borderRadius:20}}>
                          {(o.status||"").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })
            }
          </div>

          <div style={{ background:"#fff",borderRadius:14,padding:"22px 24px",
                        border:"1px solid #e2e8f0",
                        boxShadow:"0 2px 10px rgba(26,107,124,0.06)" }}>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,
                         color:"#1a1a1a",marginBottom:16,
                         display:"flex",alignItems:"center",gap:8}}>
              <HiOutlineTrendingUp style={{color:"#059669",fontSize:18}}/>
              Top Books
            </h3>
            {topBooks.length === 0
              ? <p style={{color:"#9ca3af",fontSize:13,textAlign:"center",
                           padding:"20px 0"}}>No data yet</p>
              : topBooks.slice(0,6).map((b,i) => (
                  <div key={b._id||i}
                    style={{display:"flex",alignItems:"center",gap:12,
                             padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#e6f7f9",
                                  display:"flex",alignItems:"center",justifyContent:"center",
                                  fontSize:12,fontWeight:800,color:"#1a6b7c",flexShrink:0}}>
                      {i+1}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:600,color:"#0f172a",
                                  overflow:"hidden",textOverflow:"ellipsis",
                                  whiteSpace:"nowrap"}}>
                        {b.title||"—"}
                      </p>
                      <p style={{fontSize:11,color:"#94a3b8"}}>{b.sales||0} sales</p>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:"#1a6b7c",flexShrink:0}}>
                      BDT {fmt(b.revenue||0)}
                    </span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* ── QUICK ACTIONS ───────────────────────────────────────────────── */}
        <div style={{ background:"#fff",borderRadius:14,padding:"22px 24px",
                      border:"1px solid #e2e8f0",
                      boxShadow:"0 2px 10px rgba(26,107,124,0.06)" }}>
          <h3 style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,
                       color:"#1a1a1a",marginBottom:16,
                       display:"flex",alignItems:"center",gap:8}}>
            ⚡ Quick Actions
          </h3>
          <div style={{display:"grid",
                       gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",
                       gap:14}}>
            <ActionCard Icon={HiOutlinePlus}        label="Add New Book"    to="/admin/books"    color="#1a6b7c"/>
            <ActionCard Icon={HiOutlineUsers}       label="Manage Users"    to="/admin/users"    color="#7c3aed"/>
            <ActionCard Icon={HiOutlineShoppingBag} label="View Orders"     to="/admin/orders"   color="#059669"/>
            <ActionCard Icon={HiOutlineChat}        label="Messages"        to="/admin/messages" color="#dc2626"/>
            <ActionCard Icon={HiOutlineBookOpen}    label="Manage Books"    to="/admin/books"    color="#f5a623"/>
            <ActionCard Icon={HiOutlineTrendingUp}  label="Featured Books"  to="/admin/featured" color="#7c3aed"/>
            <ActionCard Icon={HiOutlineDownload}    label="Download CSV"    onClick={downloadReport} color="#0891b2"/>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}