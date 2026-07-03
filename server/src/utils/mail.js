import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("✓ SMTP Connected");
  }
});

export async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
  });
}