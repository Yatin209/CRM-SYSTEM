import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isMongoReady } from "../config/db.js";
import { env } from "../config/env.js";
import {
  createMemory,
  findUserByEmail,
  getMemory,
  memoryState,
  updateMemory,
} from "../data/memoryStore.js";
import PasswordReset from "../models/PasswordReset.js";
import User from "../models/User.js";
import { sendMail } from "../utils/mail.js";

function sanitizeUser(user) {
  if (!user) return null;
  const value = typeof user.toObject === "function" ? user.toObject() : user;
  return {
    id: value.id || value._id?.toString(),
    name: value.name,
    email: value.email,
    role: value.role,
    region: value.region,
    status: value.status,
    avatar: value.avatar,
    performance: value.performance,
  };
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, name: user.name },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn },
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, version: user.refreshTokenVersion || 0 },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn },
  );
}

export async function loginUser(email, password) {
  let user = null;
  let valid = false;

  if (isMongoReady()) {
    user = await User.findOne({
      email: email.toLowerCase().trim(),
      status: "Active",
    }).select("+passwordHash");

    console.log("\n========== LOGIN DEBUG ==========");
    console.log("Email Entered:", email);
    console.log("Password Entered:", password);

    if (!user) {
      console.log("❌ User not found.");
    } else {
     
      try {
        valid = await user.comparePassword(password);
        console.log("Password Match:", valid);
      } catch (err) {
        console.log("Password Compare Error:", err.message);
        valid = false;
      }
    }

    console.log("=================================\n");
  } else {
    user = findUserByEmail(email);

    valid = !!user && user.status === "Active" && user.password === password;

    console.log("\n========== MEMORY LOGIN DEBUG ==========");
    console.log("Email:", email);
    console.log("User:", user);
    console.log("Password Match:", valid);
    console.log("========================================\n");
  }

  if (!user || !valid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    accessToken: signAccessToken(safeUser),
    refreshToken: signRefreshToken(user),
  };
}

export async function refreshSession(refreshToken) {
  const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  const user = isMongoReady()
    ? await User.findById(decoded.sub)
    : getMemory("users", decoded.sub);

  if (!user || user.status !== "Active") {
    const error = new Error("Session expired");
    error.statusCode = 401;
    throw error;
  }

  const safeUser = sanitizeUser(user);
  return {
    user: safeUser,
    accessToken: signAccessToken(safeUser),
  };
}
export async function createPasswordReset(email) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  let user = null;

  if (isMongoReady()) {
    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      await PasswordReset.create({
        user: user.id,
        email: user.email,
        tokenHash,
        expiresAt,
      });
    }
  } else {
    user = findUserByEmail(email);

    if (user) {
      createMemory(
        "passwordResets",
        {
          email: user.email,
          tokenHash,
          expiresAt: expiresAt.toISOString(),
        },
        null,
      );
    }
  }

  if (user) {
    const resetLink = `${env.clientOrigin}/reset-password?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "Reset your NexaCRM password",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>NexaCRM Password Reset</h2>
          <p>Hello ${user.name || "User"},</p>
          <p>You requested to reset your password.</p>

          <p>
            <a href="${resetLink}"
               style="
                 background:#2563eb;
                 color:white;
                 padding:12px 24px;
                 text-decoration:none;
                 border-radius:6px;
               ">
               Reset Password
            </a>
          </p>

          <p>This link expires in <strong>30 minutes</strong>.</p>

          <p>If you didn't request this, simply ignore this email.</p>

          <br>

          <p>Regards,<br><strong>NexaCRM Team</strong></p>
        </div>
      `,
    });
  }

  return token;
}
export async function resetPassword(token, password) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  if (isMongoReady()) {
    const reset = await PasswordReset.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!reset) {
      const error = new Error("Reset token is invalid or expired");
      error.statusCode = 400;
      throw error;
    }
    const user = await User.findOne({ email: reset.email });
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    reset.usedAt = new Date();
    await reset.save();
    return true;
  }

  const reset = memoryState().passwordResets.find(
    (item) =>
      item.tokenHash === tokenHash &&
      !item.usedAt &&
      new Date(item.expiresAt) > new Date(),
  );
  if (!reset) {
    const error = new Error("Reset token is invalid or expired");
    error.statusCode = 400;
    throw error;
  }
  const user = findUserByEmail(reset.email);
  updateMemory("users", user.id, { password }, null);
  reset.usedAt = new Date().toISOString();
  return true;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    domain: env.cookieDomain,
    path: "/api/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}
