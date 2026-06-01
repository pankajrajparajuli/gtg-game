"use client"
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import { io, Socket } from "socket.io-client"
import { SOCKET_EVENTS } from "@gtg/shared"
import type {
  GameState,
  GameContextValue,
  Room,
  ChatMessage,
  DrawingStroke,
  Player,
  RoomSettings,
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/types/game"

// Action types
type GameAction =
  | { type: "SET_USERNAME"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ROOM"; payload: Room | null }
  | { type: "UPDATE_ROOM"; payload: Partial<Room> }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "CLEAR_ERROR" }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "ADD_STROKE"; payload: DrawingStroke }
  | { type: "UNDO_STROKE" }
  | { type: "CLEAR_STROKES" }
  | { type: "SET_COLOR"; payload: string }
  | { type: "SET_BRUSH_SIZE"; payload: number }
  | { type: "SET_TOOL"; payload: "brush" | "eraser" }
  | { type: "SET_CUSTOM_WORDS"; payload: string }
  | { type: "ADD_PLAYER"; payload: Player }
  | { type: "REMOVE_PLAYER"; payload: string }

// Initial state
const initialState: GameState = {
  username: "",
  currentRoom: null,
  isConnected: false,
  isLoading: false,
  error: null,
  messages: [],
  strokes: [],
  currentColor: "#000000",
  brushSize: 8,
  currentTool: "brush",
  customWords: "",
}

// Mock players for demo
const mockPlayers: Player[] = [
  { id: "1", username: "ArtMaster", avatar: "A", score: 450, isDrawing: true, isHost: true, isOnline: true },
  { id: "2", username: "DoodleKing", avatar: "D", score: 320, isDrawing: false, isHost: false, isOnline: true },
  { id: "3", username: "SketchPro", avatar: "S", score: 280, isDrawing: false, isHost: false, isOnline: true },
  { id: "4", username: "Picasso2024", avatar: "P", score: 150, isDrawing: false, isHost: false, isOnline: false },
]

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_USERNAME":
      return { ...state, username: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "SET_ROOM":
      return { ...state, currentRoom: action.payload }
    case "UPDATE_ROOM":
      if (!state.currentRoom) return state
      return { ...state, currentRoom: { ...state.currentRoom, ...action.payload } }
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "ADD_STROKE":
      return { ...state, strokes: [...state.strokes, action.payload] }
    case "UNDO_STROKE":
      return { ...state, strokes: state.strokes.slice(0, -1) }
    case "CLEAR_STROKES":
      return { ...state, strokes: [] }
    case "SET_COLOR":
      return { ...state, currentColor: action.payload }
    case "SET_BRUSH_SIZE":
      return { ...state, brushSize: action.payload }
    case "SET_TOOL":
      return { ...state, currentTool: action.payload }
    case "SET_CUSTOM_WORDS":
      return { ...state, customWords: action.payload }
    case "ADD_PLAYER":
      if (!state.currentRoom) return state
      return {
        ...state,
        currentRoom: {
          ...state.currentRoom,
          players: [...state.currentRoom.players, action.payload],
        },
      }
    case "REMOVE_PLAYER":
      if (!state.currentRoom) return state
      return {
        ...state,
        currentRoom: {
          ...state.currentRoom,
          players: state.currentRoom.players.filter((p) => p.id !== action.payload),
        },
      }
    default:
      return state
  }
}

// Create context
const GameContext = createContext<GameContextValue | null>(null)

// Provider component
interface GameProviderProps {
  children: ReactNode
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  // Initialize socket connection
  useEffect(() => {
    // Socket.IO connection (connect to your server URL)
    // For demo purposes, we're using mock data without a real server
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    const shouldConnect = Boolean(import.meta.env.VITE_SOCKET_URL || import.meta.env.NEXT_PUBLIC_SOCKET_URL)

    // Only connect if URL is configured
    if (shouldConnect) {
      socketRef.current = io(socketUrl, {
        autoConnect: true,
        transports: ["websocket", "polling"],
      })

      const socket = socketRef.current

      socket.on("connect", () => {
        dispatch({ type: "SET_CONNECTED", payload: true })
      })

      socket.on("disconnect", () => {
        dispatch({ type: "SET_CONNECTED", payload: false })
      })

      socket.on(SOCKET_EVENTS.ROOM_CREATED, (room) => {
        dispatch({ type: "SET_ROOM", payload: room })
        dispatch({ type: "SET_LOADING", payload: false })
      })

      socket.on(SOCKET_EVENTS.ROOM_UPDATED, (roomData) => {
        dispatch({ type: "UPDATE_ROOM", payload: roomData })
        dispatch({ type: "SET_LOADING", payload: false })
      })

      socket.on(SOCKET_EVENTS.ROOM_ERROR, (message) => {
        dispatch({ type: "SET_ERROR", payload: message })
      })

      socket.on(SOCKET_EVENTS.GAME_STARTED, () => {
        dispatch({ type: "UPDATE_ROOM", payload: { status: "drawing", currentRound: 1 } })
      })

      socket.on(SOCKET_EVENTS.DRAW_UPDATE, (stroke) => {
        dispatch({ type: "ADD_STROKE", payload: stroke })
      })

      socket.on(SOCKET_EVENTS.CANVAS_CLEARED, () => {
        dispatch({ type: "CLEAR_STROKES" })
      })

      socket.on(SOCKET_EVENTS.MESSAGE_BROADCAST, (message) => {
        dispatch({ type: "ADD_MESSAGE", payload: message })
      })

      socket.on("error", (message) => {
        dispatch({ type: "SET_ERROR", payload: message })
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [state.currentRoom])

  const setUsername = useCallback((username: string) => {
    dispatch({ type: "SET_USERNAME", payload: username })
  }, [])

  const joinPublicGame = useCallback(() => {
    if (!state.username.trim()) {
      dispatch({ type: "SET_ERROR", payload: "Please enter a username" })
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })

    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: "PUBLIC", username: state.username })
    } else {
      // Mock behavior for demo
      setTimeout(() => {
        const mockRoom: Room = {
          id: crypto.randomUUID(),
          code: "PUBLIC",
          title: "Public Game Room",
          isPrivate: false,
          players: [
            {
              id: crypto.randomUUID(),
              username: state.username,
              avatar: state.username[0].toUpperCase(),
              score: 0,
              isDrawing: false,
              isHost: false,
              isOnline: true,
            },
            ...mockPlayers,
          ],
          maxPlayers: 8,
          currentRound: 1,
          totalRounds: 3,
          drawTime: 80,
          status: "waiting",
          timeRemaining: 80,
        }
        dispatch({ type: "SET_ROOM", payload: mockRoom })
        dispatch({ type: "SET_CONNECTED", payload: true })
        dispatch({ type: "SET_LOADING", payload: false })

        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            id: crypto.randomUUID(),
            playerId: "system",
            playerName: "System",
            content: `${state.username} joined the room`,
            type: "system",
            timestamp: Date.now(),
          },
        })
      }, 1000)
    }
  }, [state.username])

  const createPrivateRoom = useCallback(
    (settings: RoomSettings) => {
      if (!state.username.trim()) {
        dispatch({ type: "SET_ERROR", payload: "Please enter a username" })
        return
      }

      dispatch({ type: "SET_LOADING", payload: true })

      if (socketRef.current?.connected) {
        socketRef.current.emit(SOCKET_EVENTS.CREATE_ROOM, { username: state.username, settings })
      } else {
        // Mock behavior for demo
        setTimeout(() => {
          const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
          const mockRoom: Room = {
            id: crypto.randomUUID(),
            code: roomCode,
            title: "Private Game Room",
            isPrivate: true,
            players: [
              {
                id: crypto.randomUUID(),
                username: state.username,
                avatar: state.username[0].toUpperCase(),
                score: 0,
                isDrawing: false,
                isHost: true,
                isOnline: true,
              },
            ],
            maxPlayers: settings.maxPlayers,
            currentRound: 0,
            totalRounds: settings.totalRounds,
            drawTime: settings.drawTime,
            status: "waiting",
            timeRemaining: settings.drawTime,
          }
          dispatch({ type: "SET_ROOM", payload: mockRoom })
          dispatch({ type: "SET_CONNECTED", payload: true })
          dispatch({ type: "SET_LOADING", payload: false })

          dispatch({
            type: "ADD_MESSAGE",
            payload: {
              id: crypto.randomUUID(),
              playerId: "system",
              playerName: "System",
              content: `Room created! Share code: ${roomCode}`,
              type: "system",
              timestamp: Date.now(),
            },
          })
        }, 1000)
      }
    },
    [state.username]
  )

  const joinRoom = useCallback(
    (roomCode: string) => {
      if (!state.username.trim()) {
        dispatch({ type: "SET_ERROR", payload: "Please enter a username" })
        return
      }

      dispatch({ type: "SET_LOADING", payload: true })

      if (socketRef.current?.connected) {
        socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: roomCode, username: state.username })
      } else {
        // Mock behavior for demo
        setTimeout(() => {
          const mockRoom: Room = {
            id: crypto.randomUUID(),
            code: roomCode,
            title: "Private Game Room",
            isPrivate: true,
            players: [
              ...mockPlayers,
              {
                id: crypto.randomUUID(),
                username: state.username,
                avatar: state.username[0].toUpperCase(),
                score: 0,
                isDrawing: false,
                isHost: false,
                isOnline: true,
              },
            ],
            maxPlayers: 8,
            currentRound: 0,
            totalRounds: 3,
            drawTime: 80,
            status: "waiting",
            timeRemaining: 80,
          }
          dispatch({ type: "SET_ROOM", payload: mockRoom })
          dispatch({ type: "SET_CONNECTED", payload: true })
          dispatch({ type: "SET_LOADING", payload: false })
        }, 1000)
      }
    },
    [state.username]
  )

  const leaveRoom = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM)
    }
    dispatch({ type: "SET_ROOM", payload: null })
    dispatch({ type: "SET_CONNECTED", payload: false })
    dispatch({ type: "CLEAR_STROKES" })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  const startGame = useCallback(() => {
    if (!state.currentRoom) return

    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.START_GAME)
    } else {
      dispatch({ type: "UPDATE_ROOM", payload: { status: "drawing", currentRound: 1 } })
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: crypto.randomUUID(),
          playerId: "system",
          playerName: "System",
          content: "Game started! Round 1 begins.",
          type: "system",
          timestamp: Date.now(),
        },
      })
    }
  }, [state.currentRoom])

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !state.currentRoom) return

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        playerId: state.currentRoom.players[0]?.id || "unknown",
        playerName: state.username || "You",
        content,
        type: state.currentRoom.status === "drawing" ? "guess" : "chat",
        timestamp: Date.now(),
      }

      if (socketRef.current?.connected) {
        socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, { content, type: message.type as "chat" | "guess" })
      }

      dispatch({ type: "ADD_MESSAGE", payload: message })
    },
    [state.currentRoom, state.username]
  )

  const sendGif = useCallback(
    (gifUrl: string) => {
      if (!state.currentRoom) return

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        playerId: state.currentRoom.players[0]?.id || "unknown",
        playerName: state.username || "You",
        content: "",
        type: "gif",
        gifUrl,
        timestamp: Date.now(),
      }

      if (socketRef.current?.connected) {
        socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, { content: "", type: "gif", gifUrl })
      }

      dispatch({ type: "ADD_MESSAGE", payload: message })
    },
    [state.currentRoom, state.username]
  )

  const addStroke = useCallback((stroke: DrawingStroke) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.DRAW_EVENT, stroke)
    }
    dispatch({ type: "ADD_STROKE", payload: stroke })
  }, [])

  const undoStroke = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.DRAW_EVENT, { type: "undo" } as unknown as DrawingStroke)
    }
    dispatch({ type: "UNDO_STROKE" })
  }, [])

  const clearCanvas = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.CLEAR_CANVAS)
    }
    dispatch({ type: "CLEAR_STROKES" })
  }, [])

  const setCurrentColor = useCallback((color: string) => {
    dispatch({ type: "SET_COLOR", payload: color })
  }, [])

  const setBrushSize = useCallback((size: number) => {
    dispatch({ type: "SET_BRUSH_SIZE", payload: size })
  }, [])

  const setCurrentTool = useCallback((tool: "brush" | "eraser") => {
    dispatch({ type: "SET_TOOL", payload: tool })
  }, [])

  const setCustomWords = useCallback((words: string) => {
    dispatch({ type: "SET_CUSTOM_WORDS", payload: words })
  }, [])

  const copyInviteLink = useCallback(() => {
    if (!state.currentRoom) return
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${state.currentRoom.code}`
    navigator.clipboard.writeText(link)
  }, [state.currentRoom])

  const value: GameContextValue = {
    ...state,
    setUsername,
    joinPublicGame,
    createPrivateRoom,
    joinRoom,
    leaveRoom,
    clearError,
    startGame,
    sendMessage,
    sendGif,
    addStroke,
    undoStroke,
    clearCanvas,
    setCurrentColor,
    setBrushSize,
    setCurrentTool,
    setCustomWords,
    copyInviteLink,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// Custom hook to use game context
export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
