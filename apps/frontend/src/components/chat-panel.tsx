"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Image as ImageIcon, X, Search, Loader2 } from "lucide-react"
import { useGame } from "@/context/game-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { GiphyGif, GiphySearchResponse } from "@/types/game"

// GIPHY API configuration
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || import.meta.env.NEXT_PUBLIC_GIPHY_API_KEY || "dc6zaTOxFJmzC" // Demo key for testing
const GIPHY_API_URL = "https://api.giphy.com/v1/gifs"

export function ChatPanel() {
  const { messages, sendMessage, sendGif, currentRoom } = useGame()
  const [inputValue, setInputValue] = useState("")
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [gifSearch, setGifSearch] = useState("")
  const [gifs, setGifs] = useState<GiphyGif[]>([])
  const [isLoadingGifs, setIsLoadingGifs] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch trending GIFs on mount
  const fetchTrendingGifs = useCallback(async () => {
    setIsLoadingGifs(true)
    try {
      const response = await fetch(
        `${GIPHY_API_URL}/trending?api_key=${GIPHY_API_KEY}&limit=12&rating=g`
      )
      const data: GiphySearchResponse = await response.json()
      setGifs(data.data)
    } catch (error) {
      console.error("Failed to fetch trending GIFs:", error)
    } finally {
      setIsLoadingGifs(false)
    }
  }, [])

  // Search GIFs with debounce
  const searchGifs = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchTrendingGifs()
      return
    }

    setIsLoadingGifs(true)
    try {
      const response = await fetch(
        `${GIPHY_API_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=12&rating=g`
      )
      const data: GiphySearchResponse = await response.json()
      setGifs(data.data)
    } catch (error) {
      console.error("Failed to search GIFs:", error)
    } finally {
      setIsLoadingGifs(false)
    }
  }, [fetchTrendingGifs])

  // Handle GIF picker open
  useEffect(() => {
    if (showGifPicker && gifs.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTrendingGifs()
    }
  }, [showGifPicker, gifs.length, fetchTrendingGifs])

  // Debounced GIF search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (showGifPicker) {
      searchTimeoutRef.current = setTimeout(() => {
        searchGifs(gifSearch)
      }, 300)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [gifSearch, showGifPicker, searchGifs])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    sendMessage(inputValue)
    setInputValue("")
  }

  const handleGifSelect = (gif: GiphyGif) => {
    sendGif(gif.images.fixed_height.url)
    setShowGifPicker(false)
    setGifSearch("")
  }

  const getMessageStyle = (type: string) => {
    switch (type) {
      case "system":
        return "bg-muted/50 text-muted-foreground text-center italic text-sm"
      case "correct":
        return "bg-primary/20 text-primary border-l-4 border-primary"
      case "gif":
        return "bg-transparent"
      default:
        return "bg-muted/30"
    }
  }

  return (
    <div className="w-80 bg-card rounded-xl border-4 border-card-foreground/10 shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-secondary px-4 py-3 border-b-4 border-secondary-foreground/20">
        <h2 className="text-secondary-foreground font-bold text-lg">Chat</h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello!</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={cn("rounded-lg p-2.5 transition-all", getMessageStyle(msg.type))}>
              {msg.type !== "system" && (
                <span className="font-semibold text-card-foreground text-sm">{msg.playerName}: </span>
              )}
              {msg.type === "gif" && msg.gifUrl ? (
                <img src={msg.gifUrl} alt="GIF" className="rounded-lg mt-1 max-w-full h-auto" />
              ) : (
                <span className={msg.type === "system" ? "" : "text-card-foreground"}>{msg.content}</span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* GIF Picker */}
      {showGifPicker && (
        <div className="border-t border-border p-3 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search GIFs..."
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowGifPicker(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {isLoadingGifs ? (
              <div className="col-span-3 flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleGifSelect(gif)}
                  className="rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all"
                >
                  <img
                    src={gif.images.fixed_height_small.url}
                    alt={gif.title}
                    className="w-full h-16 object-cover"
                    loading="lazy"
                  />
                </button>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Powered by GIPHY</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowGifPicker(!showGifPicker)}
          className={cn("bg-gray-100 hover:bg-gray-200 text-gray-600", showGifPicker && "bg-gray-200")}
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
        <Input
          placeholder={currentRoom?.status === "drawing" ? "Type your guess..." : "Type a message..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!inputValue.trim()}>
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  )
}
