import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAISuggestions,
  getPlantCareTips,
} from "../controllers/aiController.js";
import { getPestAdvice } from "../controllers/pestAdviceController.js";

const router = express.Router();

router.get("/suggestions", authMiddleware, getAISuggestions);
router.get("/plant/:plantId/tips", authMiddleware, getPlantCareTips);
router.post("/pest-advice", authMiddleware, getPestAdvice);

export default router;