import { Router } from "express";
import { body } from "express-validator";
import { convert, leadController, moveLeadStage } from "../controllers/leadController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();
const salesRoles = ["Administrator", "Manager", "Sales Executive"];

router.use(authenticate);
router.get("/", authorize(...salesRoles), leadController.list);
router.get("/:id", authorize(...salesRoles), leadController.getById);
router.post(
  "/",
  authorize(...salesRoles),
  [
    body("name").isString().notEmpty(),
    body("company").isString().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("phone").isString().notEmpty(),
    body("source").isString().notEmpty(),
    body("owner").isString().notEmpty()
  ],
  validate,
  leadController.create
);
router.patch("/:id", authorize(...salesRoles), leadController.update);
router.put("/:id", authorize(...salesRoles), leadController.update);
router.patch("/:id/stage", authorize(...salesRoles), [body("stage").isString().notEmpty()], validate, moveLeadStage);
router.put("/:id/stage", authorize(...salesRoles), [body("stage").isString().notEmpty()], validate, moveLeadStage);
router.post("/:id/convert", authorize(...salesRoles), convert);
router.delete("/:id", authorize("Administrator", "Manager"), leadController.remove);

export default router;
