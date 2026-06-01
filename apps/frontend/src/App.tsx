"use client"

import { GameProvider, useGame } from "./context/game-context"
import { LandingPage } from "./components/landing-page"
import { GameRoom } from "./components/game-room"

function GameContent() {
  const { currentRoom } = useGame()

  // If connected to a room, show the game room
  if (currentRoom) {
    return <GameRoom />
  }

  // Otherwise, show the landing page
  return <LandingPage />
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
