import app from "./app.js";
import redis from "./config/redis.js";

const PORT = Number(process.env.PORT) || 8080;

async function bootstrap() {
  try {
    await redis.ping();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();