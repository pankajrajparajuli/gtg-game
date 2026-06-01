"use client"

import { GameProvider, useGame } from "./context/GameStateContext"
import LandingPage from "./pages/LandingPage"
import GamePage from "./pages/GamePage"

function GameContent() {
  const { currentRoom } = useGame()

  // If connected to a room, show the game room
  if (currentRoom) {
    return <GamePage />
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
