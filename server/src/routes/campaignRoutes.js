import { Router } from "express";
import { body } from "express-validator";
import { campaignController } from "../controllers/campaignController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

const crmRoles = ["Administrator", "Manager", "Sales Executive"];

router.use(authenticate);

router.get("/", authorize(...crmRoles), campaignController.list);

router.get("/:id", authorize(...crmRoles), campaignController.getById);

router.post(
  "/",
  authorize("Administrator", "Manager"),
  [
    body("name").notEmpty(),
    body("type").notEmpty(),
    body("owner").notEmpty(),
    body("budget").optional().isNumeric(),
    body("expectedRevenue").optional().isNumeric(),
    body("actualRevenue").optional().isNumeric(),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
  ],
  validate,
  campaignController.create,
);

router.patch(
  "/:id",
  authorize("Administrator", "Manager"),
  campaignController.update,
);

router.put(
  "/:id",
  authorize("Administrator", "Manager"),
  campaignController.update,
);

router.delete("/:id", authorize("Administrator"), campaignController.remove);

export default router;
