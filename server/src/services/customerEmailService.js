import mongoose from "mongoose";
import { isMongoReady } from "../config/db.js";
import { logger } from "../config/logger.js";
import { createMemory } from "../data/memoryStore.js";
import Communication from "../models/Communication.js";
import { sendMail } from "../utils/mail.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function customerObjectId(customer) {
  const id = customer?._id || customer?.id;
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
}

function buildWelcomeEmail(customer) {
  const name = escapeHtml(customer.name || "there");
  const company = escapeHtml(customer.company || "your organization");
  const owner = escapeHtml(customer.owner || "your account manager");

  const text = [
    `Hello ${customer.name || "there"},`,
    "Welcome aboard. Your customer profile has been created in NexaCRM.",
    `${customer.owner || "Your account manager"} will be your primary point of contact for updates, follow-ups, and support.`,
    "Regards,",
    "NexaCRM Team",
  ].join("\n\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#152033">
      <h2 style="margin:0 0 12px;color:#0f766e">Welcome aboard, ${name}</h2>
      <p>Your customer profile for <strong>${company}</strong> has been created successfully.</p>
      <p><strong>${owner}</strong> will be your primary point of contact for updates, follow-ups, and support.</p>
      <p>We are glad to have you with us.</p>
      <p style="margin-top:24px">Regards,<br><strong>NexaCRM Team</strong></p>
    </div>
  `;

  return {
    subject: `Welcome to NexaCRM, ${customer.name || "Customer"}`,
    html,
    text,
  };
}

async function recordWelcomeCommunication(customer, actorId, mailResult, email) {
  const communication = {
    type: "Email",
    subject: email.subject,
    linkedTo: customer.company || customer.name,
    customer: customerObjectId(customer),
    owner: customer.owner || "System",
    date: new Date(),
    outcome: "Welcome Email Sent",
    sentiment: "Positive",
    to: customer.email,
    body: email.html,
    status: "Sent",
    messageId: mailResult?.messageId,
    createdBy: actorId,
    updatedBy: actorId,
  };

  if (isMongoReady()) {
    await Communication.create(communication);
    return;
  }

  createMemory(
    "communications",
    {
      ...communication,
      customer: customer.id || null,
      date: communication.date.toISOString(),
    },
    actorId,
  );
}

export async function sendCustomerWelcomeEmail(customer, actorId) {
  if (!customer?.email) {
    logger.warn("Welcome email skipped because customer email is missing.");
    return { sent: false, skipped: true, reason: "CUSTOMER_EMAIL_MISSING" };
  }

  const email = buildWelcomeEmail(customer);

  try {
    const result = await sendMail({
      to: customer.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    if (result?.skipped) {
      return { sent: false, ...result };
    }

    await recordWelcomeCommunication(customer, actorId, result, email);
    logger.info(`Welcome email sent to ${customer.email}`);
    return { sent: true, messageId: result?.messageId };
  } catch (error) {
    logger.error(`Welcome email failed for ${customer.email}: ${error.message}`);
    return { sent: false, error: error.message };
  }
}
