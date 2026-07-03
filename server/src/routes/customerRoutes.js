import { Router } from "express";
import { body } from "express-validator";
import { createCrudController } from "../controllers/crudController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { customerService } from "../services/resourceServices.js";

const router = Router();
const controller = createCrudController(customerService, "Customer", {
  describe: (r) => `${r?.name || ""}${r?.company ? ` — ${r.company}` : ""}`
});
const crmRoles = ["Administrator", "Manager", "Sales Executive", "Customer Support Executive"];

router.use(authenticate);
router.get("/", authorize(...crmRoles), controller.list);
router.get("/:id", authorize(...crmRoles), controller.getById);
router.post(
  "/",
  authorize("Administrator", "Manager", "Sales Executive"),
  [
    body("name").isString().notEmpty(),
    body("company").isString().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("phone").isString().notEmpty(),
    body("address").optional({ checkFalsy: true }).isString(),
    body("owner").isString().notEmpty()
  ],
  validate,
  controller.create
);
router.patch("/:id", authorize("Administrator", "Manager", "Sales Executive", "Customer Support Executive"), controller.update);
router.put("/:id", authorize("Administrator", "Manager", "Sales Executive", "Customer Support Executive"), controller.update);
router.delete("/:id", authorize("Administrator", "Manager"), controller.remove);

export default router;
