import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "@gtg/shared";
import { createRoom, joinRoom } from "../services/room.service.js"; // Added joinRoom import

export function registerSocketRouter(
  io: Server,
  socket: Socket,
): void {
  console.log(`🔌 Connected: ${socket.id}`);

  // --- 1. CREATE ROOM EVENT ---
  socket.on(SOCKET_EVENTS.CREATE_ROOM, async () => {
    try {
      const room = await createRoom(socket.id);
      socket.emit(SOCKET_EVENTS.ROOM_CREATED, room);
    } catch (error) {
      console.error(`Error creating room for socket ${socket.id}:`, error);
      socket.emit("error", "Failed to create room.");
    }
  });

  // --- 2. JOIN ROOM EVENT ---
  socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId: string) => {
    try {
      const room = await joinRoom(roomId, {
        id: socket.id,
        username: `Player-${socket.id.slice(0, 4)}`, // Creates a temporary readable name like Player-a1B2
        score: 0,
      });

      // If the room doesn't exist in Redis, stop and optionally alert the client
      if (!room) {
        socket.emit("error", "Room not found.");
        return;
      }

      // Tell Socket.io to subscribe this socket channel to the Redis room ID room
      socket.join(roomId);

      // Broadcast the updated player list to EVERYONE inside that specific room
      io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
      
    } catch (error) {
      console.error(`Error joining room ${roomId} for socket ${socket.id}:`, error);
      socket.emit("error", "Failed to join room.");
    }
  });

  // --- 3. DISCONNECT EVENT ---
  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
}