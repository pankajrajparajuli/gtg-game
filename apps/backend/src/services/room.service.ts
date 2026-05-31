import { nanoid } from "nanoid";
import { REDIS_KEYS } from "@gtg/shared";
import type { Room, Player } from "@gtg/shared"; // Cleanly merged imports
import redis from "../config/redis.js";

/**
 * Adds a player to an existing room and updates Redis
 */
export async function joinRoom(
  roomId: string,
  player: Player,
): Promise<Room | null> {
  const room = await getRoom(roomId);

  if (!room) {
    return null;
  }

  room.players.push(player);

  await redis.set(
    `${REDIS_KEYS.ROOM}:${room.id}`,
    JSON.stringify(room),
  );

  return room;
}

/**
 * Creates a brand new game room
 */
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

/**
 * Fetches a room from Redis by its ID
 */
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