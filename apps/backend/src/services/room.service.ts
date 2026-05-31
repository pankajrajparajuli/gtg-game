import { nanoid } from "nanoid";

import type { Room } from "@gtg/shared";

export function createRoom(hostId: string): Room {
  return {
    id: nanoid(6),
    hostId,
    players: [
      {
        id: hostId,
        username: "Host",
        score: 0,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}