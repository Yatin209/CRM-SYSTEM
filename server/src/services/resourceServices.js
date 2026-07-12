import { isMongoReady } from "../config/db.js";
import Activity from "../models/Activity.js";
import Campaign from "../models/Campaign.js";
import Communication from "../models/Communication.js";
import Customer from "../models/Customer.js";
import FollowUp from "../models/FollowUp.js";
import Notification from "../models/Notification.js";
import Report from "../models/Report.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { createGenericService } from "./genericService.js";
import { sendCustomerWelcomeEmail } from "./customerEmailService.js";
import { findOneMemory } from "../data/memoryStore.js";

const baseCustomerService = createGenericService({
  collectionName: "customers",
  Model: Customer,
  searchable: ["name", "company", "email", "owner", "category"]
});

async function createCustomerAndSendWelcomeEmail(payload, actorId) {
  const customer = await baseCustomerService.create(payload, actorId);
  await sendCustomerWelcomeEmail(customer, actorId);
  return customer;
}

export const customerService = {
  ...baseCustomerService,

  async create(payload, actorId) {
    const email = (payload.email || "").toLowerCase().trim();

    if (isMongoReady()) {
      const existing = email ? await Customer.findOne({ email }) : null;
      if (existing) {
        const error = new Error("A customer with this email already exists");
        error.statusCode = 409;
        throw error;
      }
      return createCustomerAndSendWelcomeEmail({ ...payload, email }, actorId);
    }

    const existing = email
      ? findOneMemory("customers", (c) => (c.email || "").toLowerCase() === email)
      : null;
    if (existing) {
      const error = new Error("A customer with this email already exists");
      error.statusCode = 409;
      throw error;
    }
    return createCustomerAndSendWelcomeEmail({ ...payload, email }, actorId);
  },

  async update(id, payload, actorId) {
    if (payload.email) {
      const email = payload.email.toLowerCase().trim();
      const existing = isMongoReady()
        ? await Customer.findOne({ email, _id: { $ne: id } })
        : findOneMemory(
            "customers",
            (c) => (c.email || "").toLowerCase() === email && c.id !== id,
          );
      if (existing) {
        const error = new Error("A customer with this email already exists");
        error.statusCode = 409;
        throw error;
      }
      payload = { ...payload, email };
    }
    return baseCustomerService.update(id, payload, actorId);
  }
};

export const taskService = createGenericService({
  collectionName: "tasks",
  Model: Task,
  searchable: ["title", "relatedTo", "assignee", "type"]
});

export const communicationService = createGenericService({
  collectionName: "communications",
  Model: Communication,
  searchable: ["subject", "linkedTo", "owner", "type"]
});

export const followUpService = createGenericService({
  collectionName: "followUps",
  Model: FollowUp,
  searchable: ["relatedName", "owner", "outcome"]
});

export const notificationService = createGenericService({
  collectionName: "notifications",
  Model: Notification,
  searchable: ["title", "message", "type"]
});

export const activityService = createGenericService({
  collectionName: "activities",
  Model: Activity,
  searchable: ["label", "detail", "actor"]
});

export const reportService = createGenericService({
  collectionName: "reports",
  Model: Report,
  searchable: ["name", "type", "generatedBy"]
});

export const campaignService = createGenericService({
  collectionName: "campaigns",
  Model: Campaign,
  searchable: ["name", "type", "owner", "status"]
});

const baseUserService = createGenericService({
  collectionName: "users",
  Model: User,
  searchable: ["name", "email", "role", "region"]
});

export const userService = {
  ...baseUserService,

  async create(payload, actorId) {
    const password = payload.password || "Nexa@123";

    if (isMongoReady()) {
      const user = new User({
        ...payload,
        createdBy: actorId,
        updatedBy: actorId
      });

      user.password = password;
      await user.save();

      return user.toJSON();
    }

    return baseUserService.create(
      {
        ...payload,
        password
      },
      actorId
    );
  }
};
