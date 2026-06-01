"use client"

import { useGame } from "@/context/game-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, Users, Loader2, AlertCircle, LogIn, Settings, ArrowLeft, Clock, RotateCcw } from "lucide-react"
import { useState, type ChangeEvent, type KeyboardEvent } from "react"
import {
  DEFAULT_ROOM_SETTINGS,
  PLAYER_OPTIONS,
  ROUND_OPTIONS,
  DRAW_TIME_OPTIONS,
  type RoomSettings,
} from "@/types/game"

interface GameCardProps {
  className?: string
}

export function GameCard({ className = "" }: GameCardProps) {
  const {
    username,
    setUsername,
    joinPublicGame,
    createPrivateRoom,
    joinRoom,
    isLoading,
    error,
    clearError,
  } = useGame()

  const [roomCode, setRoomCode] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(DEFAULT_ROOM_SETTINGS)

  const isDisabled = !username.trim() || isLoading
  const isJoinDisabled = !username.trim() || !roomCode.trim() || isLoading

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    if (error) clearError()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isDisabled) {
      joinPublicGame()
    }
  }

  const handleRoomCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value.toUpperCase())
    if (error) clearError()
  }

  const handleRoomCodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isJoinDisabled) {
      joinRoom(roomCode)
    }
  }

  const handleJoinRoom = () => {
    joinRoom(roomCode)
  }

  const handlePlay = () => {
    joinPublicGame()
  }

  const handleShowSettings = () => {
    if (!username.trim()) {
      return
    }
    setShowSettings(true)
  }

  const handleCreateRoom = () => {
    createPrivateRoom(roomSettings)
  }

  const handleBackToMain = () => {
    setShowSettings(false)
  }

  // Settings view
  if (showSettings) {
    return (
      <Card className={`w-full max-w-sm bg-card/95 backdrop-blur-sm shadow-2xl border-0 ${className}`}>
        <CardContent className="p-6 space-y-5">
          {/* Header with back button */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToMain}
              className="h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold text-card-foreground">Room Settings</h2>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Number of Players */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <Users className="w-4 h-4 text-secondary" />
              Players
            </Label>
            <Select
              value={roomSettings.maxPlayers.toString()}
              onValueChange={(val) =>
                setRoomSettings((prev) => ({ ...prev, maxPlayers: parseInt(val) }))
              }
            >
              <SelectTrigger className="h-11 bg-input border-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAYER_OPTIONS.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} players
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Rounds */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <RotateCcw className="w-4 h-4 text-primary" />
              Rounds
            </Label>
            <Select
              value={roomSettings.totalRounds.toString()}
              onValueChange={(val) =>
                setRoomSettings((prev) => ({ ...prev, totalRounds: parseInt(val) }))
              }
            >
              <SelectTrigger className="h-11 bg-input border-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROUND_OPTIONS.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "round" : "rounds"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Draw Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <Clock className="w-4 h-4 text-accent" />
              Draw Time
            </Label>
            <Select
              value={roomSettings.drawTime.toString()}
              onValueChange={(val) =>
                setRoomSettings((prev) => ({ ...prev, drawTime: parseInt(val) }))
              }
            >
              <SelectTrigger className="h-11 bg-input border-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DRAW_TIME_OPTIONS.map((seconds) => (
                  <SelectItem key={seconds} value={seconds.toString()}>
                    {seconds} seconds
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Create Room Button */}
          <Button
            onClick={handleCreateRoom}
            disabled={isLoading}
            className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Users className="w-5 h-5 mr-2" />
            )}
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Main view
  return (
    <Card className={`w-full max-w-sm bg-card/95 backdrop-blur-sm shadow-2xl border-0 ${className}`}>
      <CardContent className="p-6 space-y-4">
        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Username Input */}
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold text-card-foreground"
          >
            Enter your nickname
          </label>
          <Input
            id="username"
            type="text"
            placeholder="CoolArtist123"
            value={username}
            onChange={handleUsernameChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="h-12 text-lg font-medium bg-input border-2 border-border focus:border-ring transition-colors"
            maxLength={20}
            autoComplete="off"
            aria-describedby={error ? "username-error" : undefined}
          />
        </div>

        {/* Primary Action - Play Button */}
        <Button
          onClick={handlePlay}
          disabled={isDisabled}
          className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
          ) : (
            <Play className="w-6 h-6 mr-2" />
          )}
          {isLoading ? "Joining..." : "Play!"}
        </Button>

        {/* Secondary Action - Create Private Room */}
        <Button
          onClick={handleShowSettings}
          disabled={isDisabled}
          variant="secondary"
          className="w-full h-12 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Users className="w-5 h-5 mr-2" />
          )}
          Create Private Room
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or join a room</span>
          </div>
        </div>

        {/* Room Code Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={handleRoomCodeChange}
            onKeyDown={handleRoomCodeKeyDown}
            disabled={isLoading}
            className="h-12 text-lg font-medium uppercase tracking-widest bg-input border-2 border-border focus:border-ring transition-colors"
            maxLength={6}
            autoComplete="off"
          />
          <Button
            onClick={handleJoinRoom}
            disabled={isJoinDisabled}
            variant="outline"
            className="h-12 px-4 font-semibold border-2 border-accent bg-accent/10 hover:bg-accent/20 text-accent-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span className="sr-only">Join Room</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
