const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAISuggestions,
  getPlantCareTips,
} = require("../controllers/aiController");
const { getPestAdvice } = require("../controllers/pestAdviceController");

router.get("/suggestions", authMiddleware, getAISuggestions);
router.get("/plant/:plantId/tips", authMiddleware, getPlantCareTips);
router.post("/pest-advice", authMiddleware, getPestAdvice);

module.exports = router;
