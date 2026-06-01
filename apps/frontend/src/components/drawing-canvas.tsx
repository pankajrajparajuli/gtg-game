"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { Pencil, Eraser, Undo2, Trash2 } from "lucide-react"
import { useGame } from "@/context/game-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { COLORS, BRUSH_SIZES, type CanvasPoint, type DrawingStroke } from "@/types/game"

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<CanvasPoint[]>([])

  const {
    strokes,
    currentColor,
    brushSize,
    currentTool,
    addStroke,
    undoStroke,
    clearCanvas,
    setCurrentColor,
    setBrushSize,
    setCurrentTool,
    currentRoom,
  } = useGame()

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = stroke.tool === "eraser" ? "#FFFFFF" : stroke.color
      ctx.lineWidth = stroke.brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      stroke.points.forEach((point) => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.stroke()
    })

    // Draw current stroke
    if (currentPoints.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = currentTool === "eraser" ? "#FFFFFF" : currentColor
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.moveTo(currentPoints[0].x, currentPoints[0].y)
      currentPoints.forEach((point) => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.stroke()
    }
  }, [strokes, currentPoints, currentColor, brushSize, currentTool])

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      redrawCanvas()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [redrawCanvas])

  // Redraw canvas when strokes change
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): CanvasPoint => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (currentRoom?.status !== "drawing") return

    setIsDrawing(true)
    const point = getCanvasPoint(e)
    setCurrentPoints([point])
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || currentRoom?.status !== "drawing") return

    const point = getCanvasPoint(e)
    setCurrentPoints((prev) => [...prev, point])
  }

  const handleEnd = () => {
    if (!isDrawing) return

    setIsDrawing(false)

    if (currentPoints.length > 1) {
      const stroke: DrawingStroke = {
        id: crypto.randomUUID(),
        points: currentPoints,
        color: currentColor,
        brushSize,
        tool: currentTool,
      }
      addStroke(stroke)
    }

    setCurrentPoints([])
  }

  const isActiveGame = currentRoom?.status === "drawing"

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Toolbar */}
      <div className="bg-card rounded-xl border-4 border-card-foreground/10 shadow-lg p-3 flex items-center justify-between">
        {/* Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant={currentTool === "brush" ? "default" : "outline"}
            size="icon"
            onClick={() => setCurrentTool("brush")}
            disabled={!isActiveGame}
          >
            <Pencil className="w-5 h-5" />
          </Button>
          <Button
            variant={currentTool === "eraser" ? "default" : "outline"}
            size="icon"
            onClick={() => setCurrentTool("eraser")}
            disabled={!isActiveGame}
          >
            <Eraser className="w-5 h-5" />
          </Button>

          <div className="h-8 w-px bg-border mx-2" />

          <Button variant="outline" size="icon" onClick={undoStroke} disabled={!isActiveGame || strokes.length === 0}>
            <Undo2 className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={clearCanvas}
            disabled={!isActiveGame || strokes.length === 0}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              disabled={!isActiveGame}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100",
                currentColor === color
                  ? "border-card-foreground scale-110 ring-2 ring-primary ring-offset-2"
                  : "border-card-foreground/20"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Brush sizes */}
        <div className="flex items-center gap-2">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              disabled={!isActiveGame}
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all hover:bg-muted disabled:opacity-50",
                brushSize === size ? "border-primary bg-primary/10" : "border-border"
              )}
            >
              <span className="rounded-full bg-card-foreground" style={{ width: size, height: size }} />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 bg-card rounded-xl border-4 border-card-foreground/10 shadow-lg overflow-hidden relative"
      >
        <canvas
          ref={canvasRef}
          className={cn("absolute inset-0 w-full h-full", isActiveGame ? "cursor-crosshair" : "cursor-not-allowed")}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {!isActiveGame && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
            <p className="text-xl font-semibold text-muted-foreground">
              {currentRoom?.status === "waiting" ? "Waiting for the game to start..." : "Canvas ready"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
