import { Router } from "express";
import redis from "../config/redis.js";

const healthRouter = Router();

healthRouter.get("/redis", async (_req, res) => {
  await redis.set("test", "hello");

  const value = await redis.get("test");

  res.json({
    redis: value,
  });
});

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;