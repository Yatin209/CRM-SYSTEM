import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let transporter = null;

export function isMailConfigured() {
  return Boolean(env.smtp.host && env.smtp.port && env.smtp.user && env.smtp.pass && env.smtp.from);
}

function getTransporter() {
  if (!isMailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }

  return transporter;
}

export async function verifyMailTransport() {
  const client = getTransporter();
  if (!client) {
    logger.warn("SMTP is not configured. Outbound email will be skipped.");
    return false;
  }

  await client.verify();
  logger.info("SMTP transport verified");
  return true;
}

export async function sendMail({ to, subject, html, text }) {
  const client = getTransporter();
  if (!client) {
    logger.warn(`SMTP is not configured. Skipped email to ${to}.`);
    return { skipped: true, reason: "SMTP_NOT_CONFIGURED" };
  }

  return client.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text,
  });
}
