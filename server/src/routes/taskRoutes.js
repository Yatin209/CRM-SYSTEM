import { Router } from "express";
import { body } from "express-validator";
import { createCrudController } from "../controllers/crudController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { taskService } from "../services/resourceServices.js";

const router = Router();
const controller = createCrudController(taskService, "Task", {
  describe: (r) => `${r?.title || ""}${r?.relatedTo ? ` — ${r.relatedTo}` : ""}`
});
const crmRoles = ["Administrator", "Manager", "Sales Executive", "Customer Support Executive"];

router.use(authenticate);
router.get("/", authorize(...crmRoles), controller.list);
router.get("/:id", authorize(...crmRoles), controller.getById);
router.post(
  "/",
  authorize(...crmRoles),
  [body("title").isString().notEmpty(), body("relatedTo").isString().notEmpty(), body("assignee").isString().notEmpty(), body("dueDate").isISO8601()],
  validate,
  controller.create
);
router.patch("/:id", authorize(...crmRoles), controller.update);
router.put("/:id", authorize(...crmRoles), controller.update);
router.delete("/:id", authorize("Administrator", "Manager"), controller.remove);

export default router;
