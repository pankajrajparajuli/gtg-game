// Game-related TypeScript types

export interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
  isDrawing: boolean;
  isHost: boolean;
  isOnline: boolean;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  isPrivate: boolean;
  players: Player[];
  maxPlayers: number;
  currentRound: number;
  totalRounds: number;
  drawTime: number;
  status: GameStatus;
  currentWord?: string;
  currentDrawerId?: string;
  timeRemaining: number;
}

export interface RoomSettings {
  maxPlayers: number;
  totalRounds: number;
  drawTime: number;
}

export type GameStatus = 'waiting' | 'starting' | 'drawing' | 'guessing' | 'roundEnd' | 'gameEnd';

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: CanvasPoint[];
  color: string;
  brushSize: number;
  tool: 'brush' | 'eraser';
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  type: 'chat' | 'guess' | 'system' | 'correct' | 'gif';
  gifUrl?: string;
  timestamp: number;
}

export interface GameState {
  username: string;
  currentRoom: Room | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  messages: ChatMessage[];
  strokes: DrawingStroke[];
  currentColor: string;
  brushSize: number;
  currentTool: 'brush' | 'eraser';
  customWords: string;
}

export interface GameContextValue extends GameState {
  setUsername: (username: string) => void;
  joinPublicGame: () => void;
  createPrivateRoom: (settings: RoomSettings) => void;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  clearError: () => void;
  startGame: () => void;
  sendMessage: (content: string) => void;
  sendGif: (gifUrl: string) => void;
  addStroke: (stroke: DrawingStroke) => void;
  undoStroke: () => void;
  clearCanvas: () => void;
  setCurrentColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setCurrentTool: (tool: 'brush' | 'eraser') => void;
  setCustomWords: (words: string) => void;
  copyInviteLink: () => void;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  totalRounds: 3,
  drawTime: 80,
};

export const PLAYER_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 10, 12];
export const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const DRAW_TIME_OPTIONS = [30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 180];

export const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#FF8C00', '#FFD700', '#32CD32',
  '#00CED1', '#1E90FF', '#9370DB', '#FF69B4', '#8B4513', '#808080',
];

export const BRUSH_SIZES = [4, 8, 12, 20, 32];

// Socket event types
export interface ServerToClientEvents {
  'room_created': (room: Room) => void;
  'room_updated': (room: Partial<Room>) => void;
  'room_error': (message: string) => void;
  'game_started': () => void;
  'turn_started': () => void;
  'draw_update': (stroke: DrawingStroke) => void;
  'canvas_cleared': () => void;
  'guess_result': (result: { correct: boolean; playerId: string; guess: string }) => void;
  'message_broadcast': (message: ChatMessage) => void;
  'timer_update': (timeRemaining: number) => void;
  'game_ended': () => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'create_room': (data: { username: string; settings?: RoomSettings }) => void;
  'join_room': (data: { roomId: string; username: string }) => void;
  'leave_room': () => void;
  'start_game': () => void;
  'draw_event': (stroke: DrawingStroke) => void;
  'clear_canvas': () => void;
  'send_message': (data: { content: string; type: 'chat' | 'guess' | 'gif'; gifUrl?: string }) => void;
}

// GIPHY API types
export interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    fixed_height_small: {
      url: string;
      width: string;
      height: string;
    };
    preview_gif: {
      url: string;
    };
  };
}

export interface GiphySearchResponse {
  data: GiphyGif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}
