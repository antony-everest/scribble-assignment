import { useEffect, useRef, useCallback, useState } from "react";
import type { Stroke } from "../services/api";

interface CanvasProps {
  strokes: Stroke[];
  isDrawer: boolean;
  onStrokeComplete?: (stroke: Stroke) => void;
  onClear?: () => void;
}

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];
const BRUSH_SIZES = [2, 4, 6, 8];

export function Canvas({ strokes, isDrawer, onStrokeComplete, onClear }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [currentWidth, setCurrentWidth] = useState(BRUSH_SIZES[1]);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let index = 1; index < stroke.points.length; index++) {
        ctx.lineTo(stroke.points[index].x, stroke.points[index].y);
      }

      ctx.stroke();
    }
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function getCanvasPoint(event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in event) {
      const touch = event.touches[0] ?? event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function handlePointerDown(event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawer) return;

    event.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(event);
    currentStrokeRef.current = [point];
  }

  function handlePointerMove(event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing || !isDrawer) return;

    event.preventDefault();
    const point = getCanvasPoint(event);
    currentStrokeRef.current.push(point);

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const points = currentStrokeRef.current;
    if (points.length < 2) return;

    const prev = points[points.length - 2];
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  function handlePointerUp(event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing || !isDrawer) return;

    event.preventDefault();
    setIsDrawing(false);

    const points = currentStrokeRef.current;
    if (points.length > 1 && onStrokeComplete) {
      onStrokeComplete({ points, color: currentColor, width: currentWidth });
    }

    currentStrokeRef.current = [];
  }

  return (
    <div className="canvas-container">
      {isDrawer && (
        <div className="canvas-toolbar">
          <div className="canvas-toolbar__group">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`canvas-toolbar__color ${currentColor === color ? "canvas-toolbar__color--active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
                type="button"
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
          <div className="canvas-toolbar__group">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                className={`canvas-toolbar__size ${currentWidth === size ? "canvas-toolbar__size--active" : ""}`}
                onClick={() => setCurrentWidth(size)}
                type="button"
                aria-label={`Brush size ${size}`}
              >
                <span
                  className="canvas-toolbar__size-dot"
                  style={{
                    width: size + 4,
                    height: size + 4,
                    borderRadius: "50%",
                    display: "inline-block",
                    backgroundColor: currentWidth === size ? "#000" : "#888"
                  }}
                />
              </button>
            ))}
          </div>
          {onClear && (
            <button className="button button--secondary button--small" onClick={onClear} type="button">
              Clear
            </button>
          )}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className={`canvas ${isDrawer ? "canvas--interactive" : ""}`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "4px",
          width: "100%",
          height: "400px",
          cursor: isDrawer ? "crosshair" : "default",
          touchAction: isDrawer ? "none" : "auto"
        }}
      />
      {!isDrawer && strokes.length === 0 && (
        <div className="canvas__empty-message" style={{ textAlign: "center", color: "#9ca3af", marginTop: "-200px", position: "relative", pointerEvents: "none" }}>
          Waiting for the drawer to start drawing...
        </div>
      )}
    </div>
  );
}
