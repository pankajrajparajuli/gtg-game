import type { Server, Socket } from "socket.io";

export function registerSocketRouter(
  io: Server,
  socket: Socket,
): void {
  console.log(`🔌 Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
}