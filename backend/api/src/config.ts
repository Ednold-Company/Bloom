import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  jwtSecret: process.env.JWT_SECRET || "change_me",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
};
