export type RoomStatus =
  | "waiting"
  | "starting"
  | "drawing"
  | "guessing"
  | "roundEnd"
  | "gameEnd"

export interface Player {
  id: string;
  username: string;
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
  hostId: string;
  players: Player[];
  maxPlayers: number;
  currentRound: number;
  totalRounds: number;
  drawTime: number;
  status: RoomStatus;
  currentWord?: string;
  currentDrawerId?: string;
  timeRemaining: number;
  createdAt: string;
}

export interface RoomSettings {
  maxPlayers: number;
  totalRounds: number;
  drawTime: number;
}