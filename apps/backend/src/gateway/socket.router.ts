import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "@gtg/shared";
import { createRoom } from "../services/room.service.js";

export function registerSocketRouter(
  io: Server,
  socket: Socket,
): void {
  console.log(`🔌 Connected: ${socket.id}`);

  socket.on(SOCKET_EVENTS.CREATE_ROOM, async () => {
    try {
      const room = await createRoom(socket.id);

      // 👇 Temporary log added here to verify Redis storage
      console.log("Stored room:", room.id);

      socket.emit(SOCKET_EVENTS.ROOM_CREATED, room);
    } catch (error) {
      console.error(`Error creating room for socket ${socket.id}:`, error);
      socket.emit("error", "Failed to create room.");
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
}