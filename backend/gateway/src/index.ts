import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.GATEWAY_PORT ? Number(process.env.GATEWAY_PORT) : 3001;
const apiTarget = process.env.API_TARGET || "http://localhost:4000";

const blockedIps = new Set<string>(["203.0.113.1"]);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "";
  if (blockedIps.has(ip)) {
    return res.status(403).json({ error: "IP blocked" });
  }
  return next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get("/health", (_req, res) => {
  res.json({ status: "gateway-ok" });
});

app.use(
  "/",
  createProxyMiddleware({
    target: apiTarget,
    changeOrigin: true,
    ws: true,
    logLevel: "warn",
  })
);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Bloom Gateway listening on port ${port} -> ${apiTarget}`);
});
