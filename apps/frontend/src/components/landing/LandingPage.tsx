"use client"

import { DoodleBackground } from "@/components/shared/DoodleBackground"
import { GameLogo } from "@/components/shared/GameLogo"
import { GameCard } from "@/components/game/GameCard"

export function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      <DoodleBackground />
      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-4xl">
        <GameLogo />
        <GameCard />
        <p className="text-white/60 text-sm text-center">No account needed. Just pick a name and start playing!</p>
      </div>
    </main>
  )
}

export default LandingPage
