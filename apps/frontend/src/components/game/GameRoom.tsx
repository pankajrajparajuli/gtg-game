"use client"

import { useGame } from "@/context/game-context"
import { PlayersPanel } from "@/components/game/PlayersPanel"
import { StatusBar } from "@/components/game/StatusBar"
import { CanvasCanvas } from "@/components/canvas/CanvasCanvas"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { WaitingRoom } from "@/components/game/WaitingRoom"

export function GameRoom() {
  const { currentRoom } = useGame()

  if (!currentRoom) return null

  const isWaiting = currentRoom.status === "waiting"

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col gap-4">
      {/* Status Bar */}
      <StatusBar />

      {/* Main Content */}
      <div className="flex-1 flex gap-4">
        {/* Left: Players Panel */}
        <PlayersPanel />

        {/* Center: Canvas or Waiting Room */}
        <div className="flex-1 flex flex-col">{isWaiting ? <WaitingRoom /> : <CanvasCanvas />}</div>

        {/* Right: Chat Panel */}
        <ChatPanel />
      </div>
    </div>
  )
}

export default GameRoom
