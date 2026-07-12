import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 5000),

  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5174",

  mongoUri: process.env.MONGODB_URI || "",

  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET || "local-access-secret-change-me",

  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "local-refresh-secret-change-me",

  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "2h",

  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  cookieDomain: process.env.COOKIE_DOMAIN || undefined,

  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "NexaCRM <no-reply@nexacrm.local>",
  },
};

