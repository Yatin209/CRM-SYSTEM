import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

export function createResourceRouter({ service, name, readRoles, writeRoles, deleteRoles }) {
  const router = Router();
  const controller = createCrudController(service, name);

  router.use(authenticate);
  router.get("/", authorize(...readRoles), controller.list);
  router.get("/:id", authorize(...readRoles), controller.getById);
  router.post("/", authorize(...writeRoles), controller.create);
  router.patch("/:id", authorize(...writeRoles), controller.update);
  router.put("/:id", authorize(...writeRoles), controller.update);
  router.delete("/:id", authorize(...deleteRoles), controller.remove);

  return router;
}
