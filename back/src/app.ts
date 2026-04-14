import cors from "cors";
import express, { Request, Response } from "express";

import { config } from "./config";
import { authRouter } from "./router/auth";
import { giftsRouter } from "./router/gifts";

function resolveCorsOrigin() {
  if (!config.corsOrigin || config.corsOrigin === "*") {
    return true;
  }

  return config.corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: resolveCorsOrigin(),
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/gifts", giftsRouter);
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
}
