import type { Server, Socket } from "socket.io";

import { SOCKET_EVENTS } from "@gtg/shared";

import { createRoom } from "../services/room.service.js";

export function registerSocketRouter(
  io: Server,
  socket: Socket,
): void {
  console.log(`🔌 Connected: ${socket.id}`);

  socket.on(SOCKET_EVENTS.CREATE_ROOM, () => {
    const room = createRoom(socket.id);

    socket.emit(SOCKET_EVENTS.ROOM_CREATED, room);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
}