import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FaArrowLeft,
  FaPen,
  FaEraser,
  FaHighlighter,
  FaSave,
  FaSearchPlus,
  FaSearchMinus
} from "react-icons/fa";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const BASE_URL = "https://book-management-system-ks6w.onrender.com";

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const drawing = useRef(false);
  const lastPos = useRef(null);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  const [penMode, setPenMode] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  // 📄 FETCH PDF
  useEffect(() => {
    (async () => {
      const res = await axios.get(`${BASE_URL}/api/books/${id}`);
      let url = res.data.pdfUrl;
      if (!url) return;
      if (!url.startsWith("http")) url = BASE_URL + url;
      setPdfUrl(url);
    })();
  }, [id]);

  // 📏 CANVAS RESIZE + RESTORE DRAWING (🔥 KEY FIX)
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");

    const prev = localStorage.getItem("drawing-" + id);

    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.scrollHeight;

    if (prev) {
      const img = new Image();
      img.src = prev;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [numPages, zoom]);

  // 🎯 POSITION FIX (ZOOM SAFE)
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top),
    };
  };

  // ✍️ START
  const startDraw = (e) => {
    if (!penMode) return;

    drawing.current = true;
    lastPos.current = getPos(e);

    const ctx = canvasRef.current.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (!isErasing) {
      if (isHighlight) {
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "rgba(255,255,0,0.35)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#000";
      }

      ctx.beginPath();
      ctx.arc(lastPos.current.x, lastPos.current.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ✏️ DRAW
  const draw = (e) => {
    if (!drawing.current || !penMode) return;

    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineCap = "round";

    if (isErasing) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 30;
    } else if (isHighlight) {
      ctx.globalCompositeOperation = "multiply";
      ctx.strokeStyle = "rgba(255,255,0,0.35)";
      ctx.lineWidth = 18;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
    }

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
  };

  const stopDraw = () => {
    drawing.current = false;
  };

  // 💾 SAVE (🔥 WORKING)
  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL("image/png");

    localStorage.setItem("drawing-" + id, data);

    alert("Saved permanently ✅");
  };

  return (
    <div style={{ height: "100vh", background: "#111", color: "#fff" }}>

      {/* TOPBAR */}
      <div style={{
        height: 50,
        background: "#000",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 15px"
      }}>
        <button onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>

        {/* ZOOM */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setZoom(z => z + 0.1)}>
            <FaSearchPlus />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
            <FaSearchMinus />
          </button>
        </div>

        {/* TOOLS */}
        <div style={{ display: "flex", gap: 10 }}>

          {/* PEN ON/OFF */}
          <button
            onClick={() => {
              setPenMode(p => !p);
              setIsHighlight(false);
              setIsErasing(false);
            }}
            style={{ color: penMode ? "#00ff88" : "#fff" }}
          >
            <FaPen />
          </button>

          {/* HIGHLIGHT ON/OFF */}
          <button
            onClick={() => {
              setPenMode(true);
              setIsHighlight(h => !h);
              setIsErasing(false);
            }}
            style={{ color: isHighlight ? "#ffff00" : "#fff" }}
          >
            <FaHighlighter />
          </button>

          {/* ERASER */}
          <button
            onClick={() => {
              setPenMode(true);
              setIsErasing(e => !e);
              setIsHighlight(false);
            }}
          >
            <FaEraser />
          </button>

          {/* SAVE BUTTON (VISIBLE BLUE) */}
          <button
            onClick={saveDrawing}
            style={{
              background: "#1e90ff",
              color: "#fff",
              border: "none",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            <FaSave />
          </button>

        </div>
      </div>

      {/* BODY */}
      <div style={{
        overflowY: "auto",
        height: "calc(100vh - 50px)",
        display: "flex",
        justifyContent: "center"
      }}>
        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            width: `${800 * zoom}px`
          }}
        >

          {/* PDF */}
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                width={800 * zoom}
              />
            ))}
          </Document>

          {/* CANVAS */}
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: 10,
              pointerEvents: penMode ? "auto" : "none",
              cursor: penMode ? "crosshair" : "default"
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
          />
        </div>
      </div>
    </div>
  );
}