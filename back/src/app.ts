import cors from "cors";
import express, { Request, Response, Router } from "express";

import { config } from "./config";
import { requireAuth } from "./middlewares/requireAuth";
import { authRouter } from "./router/auth";
import { checkInsRouter } from "./router/checkIns";
import { giftsRouter } from "./router/gifts";
import { giftMediaRouter } from "./router/giftMedia";
import { giftRecipientsRouter } from "./router/giftRecipients";
import { giftTrustedThirdsRouter } from "./router/giftTrustedThirds";
import { thirdPartyValidationsRouter } from "./router/thirdPartyValidations";
import { usersRouter } from "./router/users";

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
  const apiRouter = Router();

  app.use(
    cors({
      origin: resolveCorsOrigin(),
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", apiRouter);

  apiRouter.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  apiRouter.use("/check-ins", checkInsRouter);
  apiRouter.use("/third-party-validations", thirdPartyValidationsRouter);
  apiRouter.use("/auth/logout", requireAuth);
  apiRouter.use("/auth", authRouter);
  apiRouter.use("/users", requireAuth, usersRouter);
  apiRouter.use(
    "/gifts",
    requireAuth,
    giftsRouter,
    giftMediaRouter,
    giftRecipientsRouter,
    giftTrustedThirdsRouter,
  );

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
}
