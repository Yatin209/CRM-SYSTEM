import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import apiRoutes from "./routes/index.js";
import { successResponse } from "./utils/apiResponse.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (curl/Postman) with no origin header
      if (!origin) return callback(null, true);
      if (env.nodeEnv !== "production") {
        // In development, accept any localhost/127.0.0.1 port to avoid
        // breaking auth when Vite picks a different port than CLIENT_ORIGIN.
        const allowedPattern =
          /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/;

        if (allowedPattern.test(origin) || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      }
      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) =>
  successResponse(res, "NexaCRM API is healthy", { service: "nexacrm-api" }),
);
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
