import { nanoid } from "nanoid";

import { REDIS_KEYS } from "@gtg/shared";
import type { Room } from "@gtg/shared";

import redis from "../config/redis.js";

export async function createRoom(
  hostId: string,
): Promise<Room> {
  const room: Room = {
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

  await redis.set(
    `${REDIS_KEYS.ROOM}:${room.id}`,
    JSON.stringify(room),
  );

  return room;
}

export async function getRoom(
  roomId: string,
): Promise<Room | null> {
  const roomData = await redis.get(
    `${REDIS_KEYS.ROOM}:${roomId}`,
  );

  if (!roomData) {
    return null;
  }

  return JSON.parse(roomData) as Room;
}