import {useEffect, useRef, useState } from "react";
import styles from "./App.module.css";

const App = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cols, setCols] = useState<string>("30");
  const [rows, setRows] = useState<string>("12");
  const [lineWidth, setLineWidth] = useState<string>("5");
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<string>("12");
  const [color, setColor] = useState<string>("green");

  const validateInput = (value: string, type: string) => {
    if (type === "columns") setCols(value);
    if (type === "rows") setRows(value);
    if (type === "lineWidth") setLineWidth(value);
    if (type === "fontSize") setFontSize(value);
  }

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setImageSrc(URL.createObjectURL(file));
  };

  // Draw grid on canvas
  const drawGrid = () => {
    if (!imageRef.current || !canvasRef.current) return;
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to image natural size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / parseInt(cols);
    const cellHeight = canvas.height / parseInt(rows);

    ctx.strokeStyle = color; // very thin
    ctx.lineWidth = parseInt(lineWidth);

    // Draw vertical lines
    for (let c = 1; c < parseInt(cols); c++) {
      const x = c * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let r = 1; r < parseInt(rows); r++) {
      const y = r * cellHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Set the same color for font (label) as the grid lines
    ctx.fillStyle = color; // Set font color to match grid color
    ctx.font = `${fontSize}px Arial`; // Dynamically set font size
    ctx.textAlign = "left"; // Align text to the left of the cell
    ctx.textBaseline = "top"; // Align text to the top of the cell

    // Draw labels in top-left corner of each cell
    for (let r = 0; r < parseInt(rows); r++) {
      for (let c = 0; c < parseInt(cols); c++) {
        const label = `${String.fromCharCode(65 + r)}${c + 1}`;
        const x = c * cellWidth; // X position of the top-left corner
        const y = r * cellHeight; // Y position of the top-left corner

        // Add some padding for the text to avoid touching the borders
        if (showLabels) {
          ctx.fillText(label, x + 5, y + 5); // Adjusted to the top-left of each cell with padding
        }
      }
    }
  };

  // Redraw grid whenever rows, cols, or imageSrc change
  useEffect(() => {
    if (!imageSrc) return;
    const img = imageRef.current;
    if (img?.complete) {
      drawGrid();
    } else {
      img?.addEventListener("load", drawGrid);
      return () => img?.removeEventListener("load", drawGrid);
    }
  }, [imageSrc, rows, cols, showLabels, fontSize, lineWidth, color]);

  // Merge image + grid into downloadable image
  const downloadImage = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Draw grid
    ctx.drawImage(canvasRef.current, 0, 0);

    // Download
    const link = document.createElement("a");
    link.download = "grid-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };


  return (
    <div className={styles.app}>
      <div className={styles.container}>
        {/* Title */}
        <div className={styles.title}>
          <b>GRID</b>SNAP
        </div>
        <div className={styles.upload}>
          <div className={styles.uploadTitle}>
            <div>Upload an image:</div>
          </div>
          <input
            className={styles.input}
            type="file"
            accept="image/*"
            onChange={handleUpload}
          />
        </div>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.control}>
            Columns:
            <input value={cols} onChange={(e) => validateInput(e.target.value, "columns")} className={styles.controlsInput} />
          </div>
          <div className={styles.control}>
            Rows:
            <input value={rows} onChange={(e) => validateInput(e.target.value, "rows")} className={styles.controlsInput} />
          </div>
          <div className={styles.control}>
            Line width (pixels):
            <input value={lineWidth} onChange={(e) => validateInput(e.target.value, "lineWidth")} className={styles.controlsInput} />
          </div>
          <div className={`${styles.control}`}>
          </div>
          <div className={`${styles.control}`}>
            Show labels:
            <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} className={styles.controlsInput} />
            Font size (pixels):
            <input 
              disabled={!showLabels}
              value={fontSize}
              onChange={(e) => validateInput(e.target.value, "fontSize")}
              className={`${styles.controlsInput} ${!showLabels && styles.disabled} `}
            />
          </div>
          <div className={styles.control}>
            Grid color:
            <div onClick={() => setColor("green")} className={`${styles.color} ${styles.green} ${color === "green" ? styles.selected : ""}`}></div>
            <div onClick={() => setColor("red")} className={`${styles.color} ${styles.red} ${color === "red" ? styles.selected : ""}`}></div>
            <div onClick={() => setColor("blue")} className={`${styles.color} ${styles.blue} ${color === "blue" ? styles.selected : ""}`}></div>
            <div onClick={() => setColor("yellow")} className={`${styles.color} ${styles.yellow} ${color === "yellow" ? styles.selected : ""}`}></div>
          </div>
        </div>
        {/* Grid container */}
        <div>
          <div style={{ position: "relative", overflow: "auto", maxWidth: "100vw", maxHeight: "100vh" }}>
            {imageSrc && (
              <>
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="uploaded"
                  style={{ width: "100%", height: "auto", display: "block" }}
                  onLoad={drawGrid}
                />
                <canvas
                  ref={canvasRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
          </div>
        </div>
        {/* Download */}
        <button className={styles.button} onClick={downloadImage}>Download</button>
      </div>
    </div>
  )
}

export default App
