"use client"

import { DoodleBackground } from "./doodle-background"
import { GameLogo } from "./game-logo"
import { GameCard } from "./game-card"

export function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Doodle Background */}
      <DoodleBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-4xl">
        {/* Logo */}
        <GameLogo />

        {/* Main Interaction Card */}
        <GameCard />

        {/* Footer hint */}
        <p className="text-white/60 text-sm text-center">No account needed. Just pick a name and start playing!</p>
      </div>
    </main>
  )
}
