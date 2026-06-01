"use client"

import { Crown, Pencil } from "lucide-react"
import { useGame } from "@/context/game-context"
import { cn } from "@/lib/utils"

export function PlayersPanel() {
  const { currentRoom } = useGame()

  if (!currentRoom) return null

  const sortedPlayers = [...currentRoom.players].sort((a, b) => b.score - a.score)

  return (
    <div className="w-64 bg-card rounded-xl border-4 border-card-foreground/10 shadow-lg overflow-hidden flex flex-col">
      <div className="bg-secondary px-4 py-3 border-b-4 border-secondary-foreground/20">
        <h2 className="text-secondary-foreground font-bold text-lg">
          Players ({currentRoom.players.length}/{currentRoom.maxPlayers})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all",
              player.isDrawing ? "bg-primary/20 border-2 border-primary" : "bg-muted/50 hover:bg-muted"
            )}
          >
            {/* Rank */}
            <span className="text-sm font-bold text-muted-foreground w-5">#{index + 1}</span>

            {/* Avatar */}
            <div
              className={cn(
                "relative w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                player.isOnline
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-foreground/30 text-muted-foreground"
              )}
            >
              {player.avatar}
              {/* Online indicator */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                  player.isOnline ? "bg-green-500" : "bg-gray-400"
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "font-semibold truncate",
                    player.isOnline ? "text-card-foreground" : "text-muted-foreground"
                  )}
                >
                  {player.username}
                </span>
                {player.isHost && <Crown className="w-4 h-4 text-accent flex-shrink-0" />}
                {player.isDrawing && <Pencil className="w-4 h-4 text-primary flex-shrink-0" />}
              </div>
              <span className="text-sm text-muted-foreground">{player.score} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
