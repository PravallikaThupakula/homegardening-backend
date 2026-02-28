import express from "express";

import {
  getSeasonalTips,
  getTipById,
  getSeasonalTipsByPlace,
} from "../controllers/seasonalTipsController.js";

const router = express.Router();

/* ================= SEASONAL TIPS ROUTES ================= */

router.get("/", getSeasonalTips);

router.get("/by-place", getSeasonalTipsByPlace);

router.get("/:id", getTipById);

export default router;