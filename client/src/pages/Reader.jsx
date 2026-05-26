import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const BASE_URL = "https://book-management-system-ks6w.onrender.com";
const W = 860;
const H = 12000;
const COLORS = ["#000000","#e53e3e","#2b6cb0","#276749","#744210","#553c9a"];

// ── IndexedDB ─────────────────────────────────────────────────────────────────
const idb = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("rdr", 1);
      r.onupgradeneeded = e => e.target.result.createObjectStore("d", { keyPath: "k" });
      r.onsuccess = e => { this.db = e.target.result; res(); };
      r.onerror   = () => rej();
    });
  },
  async save(k, v) {
    if (!this.db) await this.open();
    return new Promise((res, rej) => {
      const tx = this.db.transaction("d","readwrite");
      tx.objectStore("d").put({ k, v });
      tx.oncomplete = res; tx.onerror = rej;
    });
  },
  async load(k) {
    if (!this.db) await this.open();
    return new Promise((res, rej) => {
      const tx  = this.db.transaction("d","readonly");
      const req = tx.objectStore("d").get(k);
      req.onsuccess = () => res(req.result?.v ?? null);
      req.onerror   = rej;
    });
  },
  async del(k) {
    if (!this.db) await this.open();
    return new Promise((res, rej) => {
      const tx = this.db.transaction("d","readwrite");
      tx.objectStore("d").delete(k);
      tx.oncomplete = res; tx.onerror = rej;
    });
  },
};

export default function Reader() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const cvs  = useRef(null);
  const body = useRef(null);
  const draw = useRef(false);
  const lp   = useRef({ x:0, y:0 });
  const hist = useRef([]);
  const hi   = useRef(-1);

  const [url,    setUrl]    = useState(null);
  const [busy,   setBusy]   = useState(true);
  const [zoom,   setZoom]   = useState(1);
  const [tool,   setTool]   = useState("");
  const [color,  setColor]  = useState("#000000");
  const [sz,     setSz]     = useState(3);
  const [ok,     setOk]     = useState(false);   // save feedback
  const [saving, setSaving] = useState(false);   // save loading

  // ── PDF height: fills viewport minus topbar ────────────────
  const pdfH = typeof window !== "undefined" ? window.innerHeight - 50 : 800;

  // fetch book
  useEffect(() => {
    axios.get(`${BASE_URL}/api/books/${id}`)
      .then(r => {
        let u = r.data.pdfUrl;
        if (u && !u.startsWith("http")) u = BASE_URL + u;
        setUrl(u);
      })
      .catch(console.error)
      .finally(() => setBusy(false));
  }, [id]);

  // load saved drawing from IndexedDB
  useEffect(() => {
    idb.load(`d${id}`).then(v => {
      if (!v || !cvs.current) return;
      const img = new Image();
      img.src   = v;
      img.onload = () => {
        cvs.current.getContext("2d").drawImage(img, 0, 0);
        hist.current = [v]; hi.current = 0;
      };
    });
  }, [id]);

  // block download shortcuts
  useEffect(() => {
    const nc = e => e.preventDefault();
    const nk = e => {
      if (e.ctrlKey && "spua".includes(e.key.toLowerCase())) e.preventDefault();
    };
    document.addEventListener("contextmenu", nc, true);
    document.addEventListener("keydown",     nk, true);
    return () => {
      document.removeEventListener("contextmenu", nc, true);
      document.removeEventListener("keydown",     nk, true);
    };
  }, []);

  // ── helpers ───────────────────────────────────────────────────────────────
  const snap = () => {
    const c = cvs.current; if (!c) return;
    const d = c.toDataURL();
    hist.current = hist.current.slice(0, hi.current + 1);
    hist.current.push(d);
    hi.current = hist.current.length - 1;
    idb.save(`d${id}`, d); // auto-save to IndexedDB on every stroke
  };

  const pos = e => {
    const r  = cvs.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    // canvas pixel coords — divide by zoom because canvas CSS size is zoomed
    return {
      x: (cx - r.left) / zoom,
      y: (cy - r.top)  / zoom,
    };
  };

  const down = e => {
    if (!tool) return;
    e.preventDefault();
    draw.current = true;
    const p = pos(e);
    lp.current  = p;
    if (tool === "er") return;
    const ctx = cvs.current.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = tool === "hi" ? "rgba(255,220,0,0.4)" : color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, tool === "hi" ? 9 : sz/2, 0, Math.PI*2);
    ctx.fill();
  };

  const move = e => {
    if (!draw.current || !tool) return;
    e.preventDefault();
    const p   = pos(e);
    const ctx = cvs.current.getContext("2d");
    ctx.lineCap = ctx.lineJoin = "round";
    if (tool === "er") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 26; ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (tool === "hi") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255,220,0,0.4)"; ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color; ctx.lineWidth = sz;
    }
    ctx.beginPath();
    ctx.moveTo(lp.current.x, lp.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lp.current = p;
  };

  const up = () => { if (draw.current) { draw.current=false; snap(); } };

  const undo = () => {
    const c = cvs.current; if (!c) return;
    const ctx = c.getContext("2d");
    if (hi.current <= 0) {
      ctx.clearRect(0,0,W,H); hist.current=[]; hi.current=-1; idb.del(`d${id}`); return;
    }
    hi.current--;
    const img = new Image(); img.src = hist.current[hi.current];
    img.onload = () => { ctx.clearRect(0,0,W,H); ctx.drawImage(img,0,0); };
  };

  const clear = () => {
    const c = cvs.current; if (!c) return;
    c.getContext("2d").clearRect(0,0,W,H);
    hist.current=[]; hi.current=-1; idb.del(`d${id}`);
  };

  // ── PERMANENT SAVE — stores canvas dataURL to localStorage keyed by bookId
  // (backend e save korte hole /api/annotations route lagbe — ekhon localStorage e permanent)
  const save = async () => {
    const c = cvs.current; if (!c) return;
    setSaving(true);
    try {
      const dataUrl = c.toDataURL("image/png");
      // 1. IndexedDB e save (tab close holeo thake)
      await idb.save(`d${id}`, dataUrl);
      // 2. localStorage e backup (cross-session)
      try { localStorage.setItem(`reader_draw_${id}`, dataUrl); } catch(_) {}
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch(e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  // Load from localStorage as fallback
  useEffect(() => {
    const ls = localStorage.getItem(`reader_draw_${id}`);
    if (!ls || !cvs.current) return;
    idb.load(`d${id}`).then(idbVal => {
      if (idbVal) return; // IndexedDB has data, skip localStorage
      const img = new Image(); img.src = ls;
      img.onload = () => {
        cvs.current?.getContext("2d")?.drawImage(img, 0, 0);
        hist.current = [ls]; hi.current = 0;
      };
    });
  }, [id]);

  const tog  = t => setTool(p => p===t ? "" : t);
  const adjZ = d => setZoom(z => parseFloat(Math.min(3,Math.max(0.4,z+d)).toFixed(1)));
  const cur  = tool==="pen"?"crosshair":tool==="hi"?"text":tool==="er"?"cell":"default";

  if (busy) return <div style={S.c}><Spin/><p style={{color:"#999",marginTop:10}}>Loading…</p></div>;
  if (!url)  return <div style={S.c}><p style={{color:"#f87171"}}>❌ PDF not found</p><button style={S.gb} onClick={()=>navigate(-1)}>← Back</button></div>;

  return (
    <div style={S.root} onContextMenu={e=>e.preventDefault()}>

      {/* ═══════════ TOP BAR ═══════════ */}
      <div style={S.bar}>

    
        {/* ✅ Back button — blue, visible */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8,
            background: "#2563eb", color: "#fff",
            border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700,
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <span style={S.ttl}>📖 Reader</span>

        <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:"auto",flexWrap:"wrap"}}>

          {/* zoom */}
          <B onClick={()=>adjZ(-0.1)} title="Zoom out">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </B>
          <span style={{color:"#666",fontSize:11,minWidth:34,textAlign:"center",fontFamily:"monospace"}}>
            {Math.round(zoom*100)}%
          </span>
          <B onClick={()=>adjZ(+0.1)} title="Zoom in">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </B>
          <B onClick={()=>setZoom(1)} title="Reset">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          </B>

          <div style={S.sep}/>

          {/* pen */}
          <B active={tool==="pen"} ac="#00d084" onClick={()=>tog("pen")} title="Pen">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </B>

          {/* highlighter */}
          <B active={tool==="hi"} ac="#ffe600" onClick={()=>tog("hi")} title="Highlighter">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </B>

          {/* color dots */}
          {tool==="pen" && COLORS.map(c=>(
            <button key={c} onClick={()=>setColor(c)} style={{
              width:14,height:14,borderRadius:"50%",backgroundColor:c,
              border:"none",cursor:"pointer",flexShrink:0,
              outline:color===c?"2px solid #fff":"none",outlineOffset:1,
            }}/>
          ))}

          {/* size */}
          {tool==="pen" && [2,4,8].map(s=>(
            <button key={s} onClick={()=>setSz(s)} style={{
              width:22,height:22,borderRadius:4,
              background:sz===s?"rgba(255,255,255,0.12)":"none",
              border:sz===s?"1px solid rgba(255,255,255,0.25)":"1px solid transparent",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <div style={{width:Math.max(3,s*1.4),height:Math.max(3,s*1.4),borderRadius:"50%",backgroundColor:"#bbb"}}/>
            </button>
          ))}

          <div style={S.sep}/>

          {/* eraser */}
          <B active={tool==="er"} ac="#f87171" onClick={()=>tog("er")} title="Eraser">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 20H7L3 16l10-10 7 7-3.5 3.5"/><path d="M6 20L3 17"/></svg>
          </B>

          {/* undo */}
          <B onClick={undo} title="Undo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          </B>

          {/* clear */}
          <B onClick={clear} title="Clear all" style={{color:"#f87171"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </B>

          <div style={S.sep}/>

          {/* SAVE — permanently saves drawing */}
          <button onClick={save} disabled={saving} style={{
            display:"flex",alignItems:"center",gap:5,
            padding:"0 10px",height:28,borderRadius:6,
            fontSize:11,cursor:saving?"wait":"pointer",fontFamily:"inherit",flexShrink:0,
            background:ok?"rgba(0,208,132,0.15)":saving?"rgba(255,255,255,0.05)":"rgba(96,165,250,0.1)",
            color:ok?"#00d084":saving?"#555":"#60a5fa",
            border:`1px solid ${ok?"rgba(0,208,132,0.3)":saving?"rgba(255,255,255,0.08)":"rgba(96,165,250,0.25)"}`,
            transition:"all 0.2s",
          }}>
            {saving
              ? <><Dots/> Saving…</>
              : ok
              ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
              : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save</>
            }
          </button>

        </div>
      </div>

      {/* ═══════════ BODY ═══════════ */}
      <div ref={body} style={S.body}>
        <div style={{
          position:"relative",
          width: W * zoom,
          flexShrink:0,
        }}>

          {/* ── iframe: height fills full viewport so PDF is scrollable ── */}
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            style={{
              width: W,
              height: pdfH,           // full viewport height — scroll inside
              border:"none",
              display:"block",
              backgroundColor:"#fff",
              transform:`scale(${zoom})`,
              transformOrigin:"top left",
              pointerEvents: tool ? "none" : "auto", // allow scroll when no tool active
            }}
            title="PDF"
          />

          {/* ── canvas overlay ── */}
          <canvas
            ref={cvs}
            width={W}
            height={H}
            style={{
              position:"absolute",
              top:0, left:0,
              width: W * zoom,
              height: H * zoom,
              cursor: cur,
              pointerEvents: tool ? "all" : "none",
              touchAction:"none",
            }}
            onMouseDown={down}
            onMouseMove={move}
            onMouseUp={up}
            onMouseLeave={up}
            onTouchStart={down}
            onTouchMove={move}
            onTouchEnd={up}
          />
        </div>
      </div>

      {/* status bar */}
      {tool && (
        <div style={S.sb}>
          <div style={{
            width:8,height:8,borderRadius:"50%",
            backgroundColor:tool==="er"?"#f87171":tool==="hi"?"#ffe600":color,
          }}/>
          <span style={{color:"#888",fontSize:12}}>
            {tool==="er"?"Eraser active — drag to erase"
            :tool==="hi"?"Highlighter active — drag to highlight"
            :"Pen active — drag to draw"}
          </span>
          <button style={S.ex} onClick={()=>setTool("")}>Exit</button>
        </div>
      )}

      {/* scroll hint when no tool */}
      {!tool && (
        <div style={{...S.sb, gap:6}}>
          <span style={{color:"#555",fontSize:11}}>scroll ↕ to read • select a tool to annotate</span>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,80%,100%{opacity:0}40%{opacity:1}}`}</style>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
function B({ children, onClick, title, active, ac="#00d084", style={} }) {
  const rgb = ac==="#ffe600"?"255,230,0":ac==="#f87171"?"248,113,113":"0,208,132";
  return (
    <button title={title} onClick={onClick} style={{
      width:30,height:30,
      display:"flex",alignItems:"center",justifyContent:"center",
      background:active?`rgba(${rgb},0.12)`:"none",
      border:`1px solid ${active?`rgba(${rgb},0.4)`:"transparent"}`,
      borderRadius:6,cursor:"pointer",
      color:active?ac:"#666",
      transition:"all 0.15s",...style,
    }}>
      {children}
    </button>
  );
}

function Spin() {
  return <div style={{width:28,height:28,border:"2px solid rgba(255,255,255,0.08)",borderTop:"2px solid #60a5fa",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>;
}

function Dots() {
  return (
    <span style={{display:"inline-flex",gap:2,alignItems:"center"}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{width:3,height:3,borderRadius:"50%",backgroundColor:"currentColor",animation:`blink 1.2s ${i*0.2}s infinite`}}/>
      ))}
    </span>
  );
}

const S = {
  root:{height:"100vh",display:"flex",flexDirection:"column",backgroundColor:"#111827",userSelect:"none",WebkitUserSelect:"none"},
  c:{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#111827",gap:12},
  gb:{background:"none",border:"1px solid rgba(255,255,255,0.15)",color:"#999",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:13},
  bar:{height:50,flexShrink:0,backgroundColor:"#0d1117",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"0 12px",display:"flex",alignItems:"center",gap:4,position:"relative",zIndex:10},
  ttl:{color:"#60a5fa",fontSize:13,position:"absolute",left:"50%",transform:"translateX(-50%)",whiteSpace:"nowrap",pointerEvents:"none"},
  sep:{width:1,height:16,backgroundColor:"rgba(255,255,255,0.07)",margin:"0 2px"},
  body:{flex:1,overflowY:"auto",overflowX:"auto",backgroundColor:"#1c2333",display:"flex",justifyContent:"center",padding:0},
  sb:{position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",backgroundColor:"rgba(13,17,23,0.95)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 14px",display:"flex",alignItems:"center",gap:8,zIndex:300},
  ex:{background:"none",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"#888",fontSize:11,padding:"2px 8px",cursor:"pointer",marginLeft:4},
};