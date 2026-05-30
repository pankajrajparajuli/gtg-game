import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRouter from "./controllers/health.controller.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use("/api", healthRouter);

export default app;