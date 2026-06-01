"use client"

import { Settings, Clock, LogOut } from "lucide-react"
import { useGame } from "@/context/game-context"
import { Button } from "@/components/ui"

export function StatusBar() {
  const { currentRoom, leaveRoom } = useGame()

  if (!currentRoom) return null

  const statusLabels: Record<string, string> = {
    waiting: "Waiting for players",
    starting: "Starting...",
    drawing: "Drawing in progress",
    guessing: "Guess the word!",
    roundEnd: "Round ended",
    gameEnd: "Game over!",
  }

  return (
    <div className="bg-card rounded-xl border-4 border-card-foreground/10 shadow-lg px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">Round</span>
          <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-bold">
            {currentRoom.currentRound} / {currentRoom.totalRounds}
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full font-semibold text-sm ${
              currentRoom.status === "drawing"
                ? "bg-primary/20 text-primary"
                : currentRoom.status === "waiting"
                  ? "bg-accent/20 text-accent-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {statusLabels[currentRoom.status]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-card-foreground">{currentRoom.title}</h1>
        {currentRoom.status === "drawing" && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-bold tabular-nums">{currentRoom.timeRemaining}s</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {currentRoom.isPrivate && (
          <div className="bg-muted px-3 py-1.5 rounded-lg">
            <span className="text-sm text-muted-foreground">Code: </span>
            <span className="font-mono font-bold text-card-foreground">{currentRoom.code}</span>
          </div>
        )}

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground">
          <Settings className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={leaveRoom}
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

export default StatusBar
