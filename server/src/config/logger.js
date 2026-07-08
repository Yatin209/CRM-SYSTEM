import winston from "winston";
import { env } from "./env.js";

export const logger = winston.createLogger({
  level: env.nodeEnv === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => `${timestamp} ${level}: ${stack || message}`)
  ),
  transports: [new winston.transports.Console()]
});
