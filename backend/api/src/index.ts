import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import authRoutes from "./routes/auth";
import cycleRoutes from "./routes/cycles";
import symptomRoutes from "./routes/symptoms";
import notificationRoutes from "./routes/notifications";
import predictionRoutes from "./routes/predictions";
import chatRoutes from "./routes/chat";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/cycles", cycleRoutes);
app.use("/symptoms", symptomRoutes);
app.use("/notifications", notificationRoutes);
app.use("/predictions", predictionRoutes);
app.use("/chat", chatRoutes);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Bloom API listening on port ${config.port}`);
});
