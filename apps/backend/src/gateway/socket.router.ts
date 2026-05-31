import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "@gtg/shared";
import { 
  createRoom, 
  joinRoom, 
  findRoomByPlayerId,     // Added import
  removePlayerFromRoom    // Added import
} from "../services/room.service.js";

export function registerSocketRouter(
  io: Server,
  socket: Socket,
): void {
  console.log(`🔌 Connected: ${socket.id}`);

  // --- 1. CREATE ROOM EVENT ---
  socket.on(SOCKET_EVENTS.CREATE_ROOM, async () => {
    try {
      const room = await createRoom(socket.id);
      // Join the creator socket to the room so they receive room updates
      socket.join(room.id);
      // Cache the room id on the socket for quick lookup during disconnect
      socket.data.roomId = room.id;
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
        username: `Player-${socket.id.slice(0, 4)}`,
        score: 0,
      });

      if (!room) {
        socket.emit("error", "Room not found.");
        return;
      }

      socket.join(roomId);
      // Cache the room id on the socket for quick lookup during disconnect
      socket.data.roomId = roomId;
      io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
      
    } catch (error) {
      console.error(`Error joining room ${roomId} for socket ${socket.id}:`, error);
      socket.emit("error", "Failed to join room.");
    }
  });

  // --- 3. DISCONNECT EVENT (UPDATED) ---
  socket.on("disconnect", async () => {
    console.log(`❌ Disconnected: ${socket.id}`);

    try {
      // Prefer the socket-stored room id for quick lookup
      const socketRoomId: string | undefined = socket.data?.roomId;

      let roomIdToClean: string | undefined = socketRoomId;

      // Fallback: search Redis if socket doesn't have a cached room id
      if (!roomIdToClean) {
        const room = await findRoomByPlayerId(socket.id);
        if (!room) return;
        roomIdToClean = room.id;
      }

      // Remove the player and update Redis. If the room is empty, this returns null
      const updatedRoom = await removePlayerFromRoom(roomIdToClean, socket.id);

      if (updatedRoom) {
        io.to(roomIdToClean).emit(SOCKET_EVENTS.ROOM_UPDATED, updatedRoom);
      }
    } catch (error) {
      console.error(`Error processing disconnect for socket ${socket.id}:`, error);
    }
  });
}