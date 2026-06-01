"use client"

import { Play, Users, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useGame } from "@/context/game-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function WaitingRoom() {
  const { currentRoom, startGame, customWords, setCustomWords, copyInviteLink } = useGame()
  const [copied, setCopied] = useState(false)

  if (!currentRoom || currentRoom.status !== "waiting") return null

  const isHost = currentRoom.players.find((p) => p.isHost)?.username === currentRoom.players[0]?.username
  const canStart = currentRoom.players.length >= 2

  const handleCopyLink = () => {
    copyInviteLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="bg-card rounded-2xl border-4 border-card-foreground/10 shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-card-foreground text-center mb-6">Waiting for Players</h2>

        {/* Player count */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="text-lg text-card-foreground">
            {currentRoom.players.length} / {currentRoom.maxPlayers} players
          </span>
        </div>

        {/* Custom words (optional) */}
        {isHost && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-2">Custom Words (optional)</label>
            <Textarea
              placeholder="Enter custom words, one per line..."
              value={customWords}
              onChange={(e) => setCustomWords(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Leave empty to use default word list</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isHost && (
            <Button size="lg" className="w-full text-lg h-14 font-bold" onClick={startGame} disabled={!canStart}>
              <Play className="w-6 h-6 mr-2" />
              {canStart
                ? "Start Game"
                : `Need ${2 - currentRoom.players.length} more player${2 - currentRoom.players.length > 1 ? "s" : ""}`}
            </Button>
          )}

          <Button variant="secondary" size="lg" className="w-full text-lg h-12" onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Link Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Invite Friends
              </>
            )}
          </Button>
        </div>

        {/* Room code display */}
        {currentRoom.isPrivate && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Room Code</p>
            <p className="text-3xl font-mono font-bold text-card-foreground tracking-widest">{currentRoom.code}</p>
          </div>
        )}

        {!isHost && <p className="text-center text-muted-foreground mt-6">Waiting for the host to start the game...</p>}
      </div>
    </div>
  )
}
