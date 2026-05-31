export interface Player {
  id: string;
  username: string;
  score: number;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  createdAt: string;
}