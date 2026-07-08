import { Router } from "express";
import { body } from "express-validator";
import { forgotPassword, login, logout, refresh, reset } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 6 })],
  validate,
  login
);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", [body("email").isEmail().normalizeEmail()], validate, forgotPassword);
router.post(
  "/reset-password",
  [body("token").isString().isLength({ min: 20 }), body("password").isStrongPassword({ minLength: 8, minSymbols: 1 })],
  validate,
  reset
);

export default router;
