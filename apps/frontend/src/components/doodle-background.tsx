"use client"

import {
  Pencil,
  Star,
  Lightbulb,
  HelpCircle,
  Trash2,
  Circle,
  ArrowRight,
  Palette,
  Sparkles,
} from "lucide-react"

interface DoodleBackgroundProps {
  className?: string
}

const DOODLE_ITEMS = [
  { Icon: Star, x: 5, y: 10, rotate: 15, size: 24 },
  { Icon: Pencil, x: 85, y: 8, rotate: -20, size: 28 },
  { Icon: Lightbulb, x: 45, y: 5, rotate: 0, size: 26 },
  { Icon: HelpCircle, x: 15, y: 40, rotate: 10, size: 22 },
  { Icon: Trash2, x: 75, y: 35, rotate: -10, size: 26 },
  { Icon: Circle, x: 30, y: 70, rotate: 0, size: 20 },
  { Icon: ArrowRight, x: 60, y: 65, rotate: 45, size: 24 },
  { Icon: Palette, x: 90, y: 75, rotate: -15, size: 28 },
  { Icon: Sparkles, x: 10, y: 85, rotate: 20, size: 22 },
  { Icon: Star, x: 50, y: 90, rotate: -30, size: 20 },
  { Icon: Pencil, x: 25, y: 25, rotate: 30, size: 24 },
  { Icon: Lightbulb, x: 70, y: 55, rotate: -5, size: 22 },
  { Icon: HelpCircle, x: 40, y: 45, rotate: 15, size: 20 },
  { Icon: Sparkles, x: 55, y: 20, rotate: -25, size: 26 },
  { Icon: Palette, x: 20, y: 60, rotate: 10, size: 24 },
  { Icon: Trash2, x: 80, y: 90, rotate: 5, size: 22 },
] as const

export function DoodleBackground({ className = "" }: DoodleBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {DOODLE_ITEMS.map((item, index) => {
        const { Icon, x, y, rotate, size } = item
        return (
          <div
            key={index}
            className="absolute text-white/15"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `rotate(${rotate}deg)`,
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </div>
        )
      })}
    </div>
  )
}
