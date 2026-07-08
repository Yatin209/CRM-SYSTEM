
import { Router } from "express";

import { authenticate } from "../middlewares/auth.js";

import {
  sendEmail,
  addInternalNote,
  getLeadHistory,
  getCustomerHistory,
} from "../services/communicationActions.js";
const router = Router();

router.use(authenticate);
router.post("/send-email", async (req, res) => {
  try {
    const communication = await sendEmail({
      ...req.body,

      user: req.user,
    });

    res.status(200).json({
      success: true,

      message: "Email sent successfully",

      data: communication,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      message: err.message,
    });
  }
});
router.post("/internal-note", async (req, res) => {
  try {
    const note = await addInternalNote({
      ...req.body,

      user: req.user,
    });

    res.status(201).json({
      success: true,

      data: note,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      message: err.message,
    });
  }
});
router.get("/lead/:leadId/history", async (req, res) => {
  try {
    const history = await getLeadHistory(req.params.leadId);

    res.json({
      success: true,

      data: history,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      message: err.message,
    });
  }
});
router.get("/customer/:customerId/history", async (req, res) => {
  try {
    const history = await getCustomerHistory(req.params.customerId);

    res.json({
      success: true,

      data: history,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      message: err.message,
    });
  }
});
export default router;
