"use client"

import { Pencil, Trash2 } from "lucide-react"

const LOGO_COLORS = [
  "text-yellow-400",
  "text-green-400",
  "text-pink-400",
  "text-orange-400",
  "text-cyan-400",
] as const

interface GameLogoProps {
  className?: string
}

export function GameLogo({ className = "" }: GameLogoProps) {
  const word1 = "Guess"
  const word2 = "Garbage"

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="flex items-center gap-3">
        <Pencil
          className="w-10 h-10 md:w-14 md:h-14 text-yellow-400 rotate-[-20deg]"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <h1 className="text-4xl md:text-6xl font-black tracking-tight select-none">
          {word1.split("").map((char, i) => (
            <span key={`w1-${i}`} className={LOGO_COLORS[i % LOGO_COLORS.length]}>
              {char}
            </span>
          ))}
          <span className="text-white mx-2">the</span>
          {word2.split("").map((char, i) => (
            <span key={`w2-${i}`} className={LOGO_COLORS[i % LOGO_COLORS.length]}>
              {char}
            </span>
          ))}
        </h1>
        <Trash2
          className="w-10 h-10 md:w-14 md:h-14 text-green-400 rotate-[15deg]"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </div>
      <p className="text-white/80 text-lg md:text-xl font-semibold tracking-wide text-center">
        Draw terrible art. Guess what it is.
      </p>
    </div>
  )
}

export default GameLogo
