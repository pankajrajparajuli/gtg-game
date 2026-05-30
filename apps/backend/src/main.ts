import http from "node:http";

import { Server } from "socket.io";

import app from "./app.js";
import redis from "./config/redis.js";
import { registerSocketRouter } from "./gateway/socket.router.js";

const PORT = Number(process.env.PORT) || 8080;

async function bootstrap() {
  try {
    await redis.ping();

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      registerSocketRouter(io, socket);
    });

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();