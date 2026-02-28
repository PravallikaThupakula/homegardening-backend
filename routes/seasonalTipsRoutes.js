const express = require("express");
const router = express.Router();
const {
  getSeasonalTips,
  getTipById,
  getSeasonalTipsByPlace,
} = require("../controllers/seasonalTipsController");

router.get("/", getSeasonalTips);
router.get("/by-place", getSeasonalTipsByPlace);
router.get("/:id", getTipById);

module.exports = router;
