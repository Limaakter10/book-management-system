// ============================================================
// 📄 Reader.jsx
// iframe দিয়ে PDF (scroll করে naturally)
// canvas overlay দিয়ে pen / highlighter / eraser
// IndexedDB তে auto-save — refresh দিলেও থাকে
// ============================================================

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const BASE_URL     = "https://book-management-system-ks6w.onrender.com";
const CANVAS_W     = 900;
const CANVAS_H     = 99999;
const PEN_COLORS   = ["#e53e3e","#dd6b20","#d69e2e","#38a169","#3182ce","#805ad5","#000000"];

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
const openDB = () => new Promise((res, rej) => {
  const req = indexedDB.open("ReaderDB", 1);
  req.onupgradeneeded = e => e.target.result.createObjectStore("draws", { keyPath: "key" });
  req.onsuccess = e => res(e.target.result);
  req.onerror   = ()  => rej(req.error);
});
const dbSave = async (key, val) => {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("draws","readwrite");
    tx.objectStore("draws").put({ key, val });
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
};
const dbLoad = async (key) => {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx  = db.transaction("draws","readonly");
    const req = tx.objectStore("draws").get(key);
    req.onsuccess = () => res(req.result?.val ?? null);
    req.onerror   = () => rej(req.error);
  });
};
const dbDel = async (key) => {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("draws","readwrite");
    tx.objectStore("draws").delete(key);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
};

export default function Reader() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const canvasRef  = useRef(null);
  const bodyRef    = useRef(null);
  const drawing    = useRef(false);
  const lastPos    = useRef({ x:0, y:0 });
  const history    = useRef([]);
  const histIdx    = useRef(-1);

  const [pdfUrl,    setPdfUrl]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [zoom,      setZoom]      = useState(1);
  const [tool,      setTool]      = useState("none"); // none | pen | highlight | eraser
  const [penColor,  setPenColor]  = useState("#000000");
  const [penSize,   setPenSize]   = useState(3);
  const [saved,     setSaved]     = useState(false);

  // ── Fetch PDF
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/books/${id}`);
        let url = res.data.pdfUrl;
        if (!url) return;
        if (!url.startsWith("http")) url = BASE_URL + url;
        setPdfUrl(url);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  // ── Load saved drawing
  useEffect(() => {
    dbLoad(`draw-${id}`).then(dataUrl => {
      if (!dataUrl || !canvasRef.current) return;
      const img = new Image();
      img.src   = dataUrl;
      img.onload = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
        history.current = [dataUrl];
        histIdx.current = 0;
      };
    });
  }, [id]);

  // ── Block save/print shortcuts
  useEffect(() => {
    const noCtx  = e => e.preventDefault();
    const noKeys = e => {
      if (e.ctrlKey && ["s","p","u","a"].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key === "F12") e.preventDefault();
    };
    window.addEventListener("contextmenu", noCtx);
    window.addEventListener("keydown", noKeys);
    return () => {
      window.removeEventListener("contextmenu", noCtx);
      window.removeEventListener("keydown", noKeys);
    };
  }, []);

  // ── Snapshot (for undo + auto-save)
  const snapshot = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const data = c.toDataURL();
    history.current = history.current.slice(0, histIdx.current + 1);
    history.current.push(data);
    histIdx.current = history.current.length - 1;
    dbSave(`draw-${id}`, data);
  }, [id]);

  // ── Get position on canvas (corrected for scroll + scale)
  const getPos = e => {
    const c    = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const cx   = e.touches ? e.touches[0].clientX : e.clientX;
    const cy   = e.touches ? e.touches[0].clientY : e.clientY;
    // divide by zoom because parent is CSS-scaled
    return {
      x: (cx - rect.left) / zoom,
      y: (cy - rect.top)  / zoom,
    };
  };

  // ── Draw handlers
  const startDraw = e => {
    if (tool === "none") return;
    e.preventDefault();
    drawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;

    const ctx = canvasRef.current.getContext("2d");
    ctx.lineCap = ctx.lineJoin = "round";

    if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = penColor;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, penSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === "highlight") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255,230,0,0.35)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawMove = e => {
    if (!drawing.current || tool === "none") return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineCap = ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth   = 28;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (tool === "highlight") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255,230,0,0.35)";
      ctx.lineWidth   = 20;
    } else {
      // pen
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth   = penSize;
    }

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    snapshot();
  };

  // ── Wheel — scroll body when not drawing
  const onWheel = e => {
    if (bodyRef.current) bodyRef.current.scrollTop += e.deltaY;
  };

  // ── Undo
  const undo = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (histIdx.current <= 0) {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      history.current = []; histIdx.current = -1;
      dbDel(`draw-${id}`);
      return;
    }
    histIdx.current--;
    const img = new Image();
    img.src   = history.current[histIdx.current];
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(img, 0, 0);
      dbSave(`draw-${id}`, img.src);
    };
  };

  const clearAll = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d").clearRect(0, 0, CANVAS_W, CANVAS_H);
    history.current = []; histIdx.current = -1;
    dbDel(`draw-${id}`);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const adjustZoom = d =>
    setZoom(z => parseFloat(Math.min(3, Math.max(0.5, z + d)).toFixed(1)));

  const setToolToggle = t => setTool(prev => prev === t ? "none" : t);

  const cursor =
    tool === "pen"       ? "crosshair"
    : tool === "highlight" ? "text"
    : tool === "eraser"    ? "cell"
    : "default";

  if (loading) return (
    <div style={S.center}><Spinner /><p style={{ color:"#aaa", marginTop:12 }}>Opening book…</p></div>
  );

  if (!pdfUrl) return (
    <div style={S.center}>
      <p style={{ color:"#f87171" }}>❌ PDF পাওয়া যায়নি।</p>
      <button style={S.ghostBtn} onClick={() => navigate(-1)}>← Back</button>
    </div>
  );

  return (
    <div style={S.root} onContextMenu={e => e.preventDefault()}>

      {/* ── TOPBAR ──────────────────────────────────────────── */}
      <header style={S.topbar}>

        {/* Back */}
        <Btn onClick={() => navigate(-1)} title="Back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </Btn>

        {/* Title */}
        <span style={S.title}>📖 Kindle Reader</span>

        <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto" }}>

          {/* ZOOM */}
          <Btn onClick={() => adjustZoom(-0.1)} title="Zoom out">－</Btn>
          <span style={{ color:"#888", fontSize:11, minWidth:34, textAlign:"center", fontFamily:"monospace" }}>
            {Math.round(zoom * 100)}%
          </span>
          <Btn onClick={() => adjustZoom(+0.1)} title="Zoom in">＋</Btn>
          <Btn onClick={() => setZoom(1)} title="Reset">↺</Btn>

          <div style={S.sep}/>

          {/* PEN */}
          <Btn
            active={tool === "pen"}
            onClick={() => setToolToggle("pen")}
            title="Pen"
            activeColor="#00ff88"
          >
            ✏️
          </Btn>

          {/* HIGHLIGHTER */}
          <Btn
            active={tool === "highlight"}
            onClick={() => setToolToggle("highlight")}
            title="Highlighter"
            activeColor="#ffe600"
          >
            🖊️
          </Btn>

          {/* PEN COLOR */}
          {(tool === "pen") && (
            <div style={{ display:"flex", gap:3 }}>
              {PEN_COLORS.map(c => (
                <button key={c}
                  onClick={() => setPenColor(c)}
                  style={{
                    width:16, height:16, borderRadius:"50%",
                    backgroundColor:c, border:"none", cursor:"pointer",
                    outline: penColor === c ? "2px solid #fff" : "none",
                    outlineOffset:1,
                  }}
                />
              ))}
            </div>
          )}

          {/* PEN SIZE */}
          {tool === "pen" && (
            <select
              value={penSize}
              onChange={e => setPenSize(Number(e.target.value))}
              style={{ background:"#222", color:"#fff", border:"1px solid #444", borderRadius:4, padding:"2px 4px", fontSize:11 }}
            >
              <option value={2}>Fine</option>
              <option value={4}>Medium</option>
              <option value={8}>Thick</option>
            </select>
          )}

          <div style={S.sep}/>

          {/* ERASER */}
          <Btn
            active={tool === "eraser"}
            onClick={() => setToolToggle("eraser")}
            title="Eraser"
            activeColor="#f87171"
          >
            🧽
          </Btn>

          {/* UNDO */}
          <Btn onClick={undo} title="Undo">↩</Btn>

          {/* CLEAR */}
          <Btn onClick={clearAll} title="Clear all" style={{ color:"#f87171" }}>🗑️</Btn>

          <div style={S.sep}/>

          {/* SAVE */}
          <button
            onClick={handleSave}
            style={{
              ...S.saveBtn,
              background: saved ? "rgba(0,255,136,0.15)" : "rgba(30,144,255,0.12)",
              color:       saved ? "#00ff88" : "#60a5fa",
              border:      `1px solid ${saved ? "rgba(0,255,136,0.3)" : "rgba(60,144,255,0.3)"}`,
            }}
          >
            {saved ? "✓ Saved" : "💾 Save"}
          </button>

        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────── */}
      <div ref={bodyRef} style={S.body} onClick={() => {}}>
        <div style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          position: "relative",
          width: CANVAS_W,
          flexShrink: 0,
        }}>

          {/* iframe — PDF scrolls naturally inside */}
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            style={{
              width: CANVAS_W,
              height: "85vh",
              border: "none",
              display: "block",
              backgroundColor: "#fff",
              pointerEvents: "none", // canvas intercepts all events
            }}
            title="PDF"
          />

          {/* Drawing canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              position: "absolute",
              top:0, left:0,
              width: CANVAS_W,
              cursor,
              pointerEvents: "all",
              touchAction: "none",
            }}
            onMouseDown={startDraw}
            onMouseMove={drawMove}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onWheel={onWheel}
            onTouchStart={startDraw}
            onTouchMove={drawMove}
            onTouchEnd={endDraw}
          />
        </div>
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────── */}
      {tool !== "none" && (
        <div style={S.statusBar}>
          <div style={{
            width:8, height:8, borderRadius:"50%", flexShrink:0,
            backgroundColor:
              tool === "eraser"    ? "#f87171"
              : tool === "highlight" ? "#ffe600"
              : penColor,
          }}/>
          <span style={{ fontSize:12, color:"#aaa" }}>
            {tool === "eraser" ? "Eraser" : tool === "highlight" ? "Highlighter" : "Pen"} active
          </span>
          <button style={S.exitBtn} onClick={() => setTool("none")}>Exit</button>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{
    width:32, height:32,
    border:"2px solid rgba(255,255,255,0.1)",
    borderTop:"2px solid #60a5fa",
    borderRadius:"50%", animation:"spin 1s linear infinite",
  }}/>
);

const Btn = ({ children, onClick, title, active, activeColor="#00ff88", style={} }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width:32, height:32,
      display:"flex", alignItems:"center", justifyContent:"center",
      background: active ? `rgba(${activeColor === "#ffe600" ? "255,230,0" : activeColor === "#f87171" ? "248,113,113" : "0,255,136"},0.12)` : "none",
      border: `1px solid ${active ? (activeColor === "#ffe600" ? "rgba(255,230,0,0.4)" : activeColor === "#f87171" ? "rgba(248,113,113,0.4)" : "rgba(0,255,136,0.4)") : "transparent"}`,
      borderRadius:6, cursor:"pointer",
      color: active ? activeColor : "#888",
      fontSize:14, transition:"all 0.15s",
      ...style,
    }}
  >
    {children}
  </button>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    height:"100vh", display:"flex", flexDirection:"column",
    backgroundColor:"#0f172a", userSelect:"none", WebkitUserSelect:"none",
  },
  center: {
    height:"100vh", display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    backgroundColor:"#0f172a", gap:12,
  },
  ghostBtn: {
    background:"none", border:"1px solid rgba(255,255,255,0.2)",
    color:"#aaa", padding:"6px 14px", borderRadius:6,
    cursor:"pointer", fontSize:13,
  },
  topbar: {
    height:50, flexShrink:0,
    backgroundColor:"#0a0f1e",
    borderBottom:"1px solid rgba(255,255,255,0.06)",
    padding:"0 14px",
    display:"flex", alignItems:"center",
    gap:6, position:"relative", zIndex:10,
  },
  title: {
    color:"#60a5fa", fontSize:13, letterSpacing:"0.04em",
    position:"absolute", left:"50%", transform:"translateX(-50%)",
    whiteSpace:"nowrap", pointerEvents:"none",
  },
  sep: { width:1, height:18, backgroundColor:"rgba(255,255,255,0.08)", margin:"0 2px" },
  saveBtn: {
    display:"flex", alignItems:"center", gap:5,
    padding:"0 10px", height:28, borderRadius:6,
    fontSize:12, cursor:"pointer", transition:"all 0.2s", flexShrink:0,
    fontFamily:"inherit",
  },
  body: {
    flex:1, overflowY:"auto", overflowX:"auto",
    backgroundColor:"#111827",
    display:"flex", justifyContent:"center", padding:0,
  },
  statusBar: {
    position:"fixed", bottom:16, left:"50%", transform:"translateX(-50%)",
    backgroundColor:"rgba(10,15,30,0.96)",
    border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:20, padding:"5px 14px",
    display:"flex", alignItems:"center", gap:8, zIndex:300,
  },
  exitBtn: {
    background:"none", border:"1px solid rgba(255,255,255,0.15)",
    borderRadius:10, color:"#aaa", fontSize:11,
    padding:"2px 8px", cursor:"pointer", marginLeft:4,
  },
};