import { Router } from "express";
import authRoutes from "./authRoutes.js";
import customerRoutes from "./customerRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import leadRoutes from "./leadRoutes.js";
import taskRoutes from "./taskRoutes.js";
import campaignRoutes from "./campaignRoutes.js";
import { createResourceRouter } from "./createResourceRouter.js";
import {
  activityService,
  communicationService,
  followUpService,
  notificationService,
  reportService,
  userService
} from "../services/resourceServices.js";

const router = Router();

const admin = ["Administrator"];
const managers = ["Administrator", "Manager"];
const sales = ["Administrator", "Manager", "Sales Executive"];
const crm = ["Administrator", "Manager", "Sales Executive", "Customer Support Executive"];

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/leads", leadRoutes);
router.use("/customers", customerRoutes);
router.use("/tasks", taskRoutes);
router.use("/campaigns", campaignRoutes);
router.use(
  "/communications",
  createResourceRouter({
    service: communicationService,
    name: "Communication",
    readRoles: crm,
    writeRoles: crm,
    deleteRoles: managers
  })
);
router.use(
  "/follow-ups",
  createResourceRouter({
    service: followUpService,
    name: "Follow-up",
    readRoles: crm,
    writeRoles: crm,
    deleteRoles: managers
  })
);
router.use(
  "/reports",
  createResourceRouter({
    service: reportService,
    name: "Report",
    readRoles: ["Administrator", "Manager", "Customer Support Executive"],
    writeRoles: managers,
    deleteRoles: admin
  })
);
router.use(
  "/notifications",
  createResourceRouter({
    service: notificationService,
    name: "Notification",
    readRoles: crm,
    writeRoles: managers,
    deleteRoles: managers
  })
);
router.use(
  "/activities",
  createResourceRouter({
    service: activityService,
    name: "Activity",
    readRoles: crm,
    writeRoles: sales,
    deleteRoles: admin
  })
);
router.use(
  "/users",
  createResourceRouter({
    service: userService,
    name: "User",
    readRoles: managers,
    writeRoles: admin,
    deleteRoles: admin
  })
);

import communicationRoutes from "./communicationRoutes.js";
router.use("/communications", communicationRoutes);

export default router;
