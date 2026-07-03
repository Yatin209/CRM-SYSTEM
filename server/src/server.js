import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

async function startServer() {
  try {
    // Connect to database
    const dbConnected = await connectDatabase();

    if (dbConnected) {
      logger.info("Database connection established successfully");
    } else {
      logger.info("Running in demo mode with in-memory data store");
    }

    // Start the server
    app.listen(env.port, () => {
      logger.info(`✓ NexaCRM API listening on http://localhost:${env.port}`);
      logger.info(`✓ Environment: ${env.nodeEnv}`);
      logger.info(`✓ Client Origin: ${env.clientOrigin}`);
      logger.info(
        `✓ Database: ${dbConnected ? "MongoDB" : "Memory Store (Demo Mode)"}`,
      );
    });
  } catch (error) {
    logger.error("Failed to start server:");
    logger.error(error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:");
  logger.error(error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();
