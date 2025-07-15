import React, { useRef, useState } from "react";

// Asegúrate de tener html2canvas disponible globalmente (por CDN en _document.tsx o public/index.html)
// <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>

type Props = {
  testId: string;
};

const CaptureArea: React.FC<Props> = ({ testId }) => {
  const [selecting, setSelecting] = useState(false);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  // Inicia la selección
  const handleStart = (e: React.MouseEvent) => {
    setSelecting(true);
    const x = e.clientX;
    const y = e.clientY;
    startPoint.current = { x, y };
    setRect({ x, y, w: 0, h: 0 });
  };

  // Actualiza el rectángulo mientras se arrastra
  const handleMove = (e: React.MouseEvent) => {
    if (!selecting || !startPoint.current) return;
    const x = Math.min(e.clientX, startPoint.current.x);
    const y = Math.min(e.clientY, startPoint.current.y);
    const w = Math.abs(e.clientX - startPoint.current.x);
    const h = Math.abs(e.clientY - startPoint.current.y);
    setRect({ x, y, w, h });
  };

  // Finaliza la selección y captura
  const handleEnd = async () => {
    setSelecting(false);
    if (!rect || rect.w < 10 || rect.h < 10) {
      setRect(null);
      return;
    }
    // @ts-ignore
    const html2canvas = window.html2canvas;
    if (!html2canvas) {
      alert("html2canvas no está disponible");
      setRect(null);
      return;
    }
    // Ignora el botón flotante
    const ignoreBtn = (el: HTMLElement) => el.id === "captureAreaBtn";
    const canvas = await html2canvas(document.body, {
      x: rect.x,
      y: rect.y,
      width: rect.w,
      height: rect.h,
      ignoreElements: ignoreBtn,
      useCORS: true,
    });
    const base64 = canvas.toDataURL();
    // Envía la imagen a la API
    await fetch("/api/save-screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, imageBase64: base64, timestamp: Date.now() }),
    });
    setRect(null);
    alert("¡Captura guardada!");
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        id="captureAreaBtn"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          padding: "10px 16px",
          background: "#005baa",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
        }}
        onClick={() => setSelecting(true)}
      >
        📸 Capturar área
      </button>
      {/* Overlay de selección */}
      {selecting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9998,
            cursor: "crosshair",
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
        >
          {rect && (
            <div
              className="selection-rectangle"
              style={{
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                border: "2px dashed #00a4e4",
                backgroundColor: "rgba(0, 164, 228, 0.2)",
                zIndex: 9999,
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      )}
    </>
  );
};

export default CaptureArea; 