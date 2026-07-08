import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    logger.warn(
      "MONGODB_URI is not set. API is running in in-memory demo mode.",
    );
    return false;
  }

  try {
    mongoose.set("strictQuery", true);

    // Configure connection options
    const mongooseOptions = {
      autoIndex: env.nodeEnv !== "production",
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB
    await mongoose.connect(env.mongoUri, mongooseOptions);

    logger.info("✓ MongoDB connected successfully");

    // Setup connection event listeners
    mongoose.connection.on("error", (error) => {
      logger.error(`MongoDB connection error: ${error.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("✓ MongoDB reconnected");
    });

    return true;
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    logger.error(
      `Connection string: ${env.mongoUri.replace(/:[^:@]+@/, ":***@")}`,
    );

    if (env.nodeEnv === "production") {
      throw error; // In production, fail fast
    } else {
      logger.warn(
        "Running in in-memory demo mode. Database operations will use memory store.",
      );
      return false;
    }
  }
}

export function isMongoReady() {
  return mongoose.connection.readyState === 1;
}
