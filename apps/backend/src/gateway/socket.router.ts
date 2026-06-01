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
  socket.on(
    SOCKET_EVENTS.CREATE_ROOM,
    async (data: { username: string; settings?: { maxPlayers: number; totalRounds: number; drawTime: number } }) => {
      try {
        const room = await createRoom(socket.id, data.username, data.settings)
        socket.join(room.id)
        socket.emit(SOCKET_EVENTS.ROOM_CREATED, room)
      } catch (error) {
        console.error(`Error creating room for socket ${socket.id}:`, error)
        socket.emit("error", "Failed to create room.")
      }
    },
  )

  // --- 2. JOIN ROOM EVENT ---
  socket.on(
    SOCKET_EVENTS.JOIN_ROOM,
    async (payload: { roomId: string; username: string }) => {
      try {
        const room = await joinRoom(payload.roomId, {
          id: socket.id,
          username: payload.username,
          score: 0,
          isDrawing: false,
          isHost: false,
          isOnline: true,
        })

        if (!room) {
          socket.emit("error", "Room not found.")
          return
        }

        socket.join(payload.roomId)
        io.to(payload.roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room)
      } catch (error) {
        console.error(`Error joining room ${payload.roomId} for socket ${socket.id}:`, error)
        socket.emit("error", "Failed to join room.")
      }
    },
  )

  // --- 3. DISCONNECT EVENT (UPDATED) ---
  socket.on("disconnect", async () => {
    console.log(`❌ Disconnected: ${socket.id}`);

    try {
      // 1. Find which room this specific player was sitting in
      const room = await findRoomByPlayerId(socket.id);
      
      // If they weren't in a room (e.g., disconnected while on main menu), stop here
      if (!room) return;

      // 2. Remove them from the room and handle host-migration logic internally
      const updatedRoom = await removePlayerFromRoom(room.id, socket.id);

      // 3. If the room still exists (meaning players are still inside), update everyone else
      if (updatedRoom) {
        io.to(room.id).emit(SOCKET_EVENTS.ROOM_UPDATED, updatedRoom);
      }
    } catch (error) {
      console.error(`Error processing disconnect for socket ${socket.id}:`, error);
    }
  });
}