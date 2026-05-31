import { nanoid } from "nanoid";
import { REDIS_KEYS } from "@gtg/shared";
import type { Room, Player } from "@gtg/shared";
import redis from "../config/redis.js";

/**
 * Removes a player from a room. Handles room deletion if empty 
 * and transfers host authority if the host leaves.
 */
export async function removePlayerFromRoom(
  roomId: string,
  playerId: string,
): Promise<Room | null> {
  const room = await getRoom(roomId);

  if (!room) {
    return null;
  }

  // Filter out the player who is leaving
  room.players = room.players.filter(
    (player) => player.id !== playerId,
  );

  // If no players are left, clean up memory by deleting the room completely
  if (room.players.length === 0) {
    await redis.del(`${REDIS_KEYS.ROOM}:${room.id}`);
    return null;
  }

  // If the host left, assign host privileges to the next player inline
  if (room.hostId === playerId) {
    room.hostId = room.players[0].id;
  }

  // Save the modified state back to Redis
  await redis.set(
    `${REDIS_KEYS.ROOM}:${room.id}`,
    JSON.stringify(room),
  );

  return room;
}

/**
 * Searches through all active Redis rooms to find which room a specific player belongs to.
 */
export async function findRoomByPlayerId(
  playerId: string,
): Promise<Room | null> {
  const keys = await redis.keys(`${REDIS_KEYS.ROOM}:*`);

  for (const key of keys) {
    const roomData = await redis.get(key);
    if (!roomData) continue;

    try {
      const room = JSON.parse(roomData) as Room;
      const playerExists = room.players.some(
        (player) => player.id === playerId,
      );

      if (playerExists) {
        return room;
      }
    } catch (error) {
      console.error(`Error parsing room data for key ${key}:`, error);
    }
  }
  return null;
}

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
export async function createRoom(hostId: string): Promise<Room> {
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
export async function getRoom(roomId: string): Promise<Room | null> {
  const roomData = await redis.get(`${REDIS_KEYS.ROOM}:${roomId}`);

  if (!roomData) {
    return null;
  }

  try {
    return JSON.parse(roomData) as Room;
  } catch (error) {
    console.error(`Failed to parse room data for ID ${roomId}:`, error);
    return null;
  }
}