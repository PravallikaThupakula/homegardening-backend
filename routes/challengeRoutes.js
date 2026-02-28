const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllChallenges,
  getChallengeById,
  joinChallenge,
  updateChallengeProgress,
  getLeaderboard,
  getUserChallenges,
  shareProgress,
} = require("../controllers/challengeController");

router.get("/", getAllChallenges);
router.get("/leaderboard", getLeaderboard);
router.get("/user", authMiddleware, getUserChallenges);
router.post("/share", authMiddleware, shareProgress);
router.get("/:id", getChallengeById);
router.post("/:challengeId/join", authMiddleware, joinChallenge);
router.put("/:challengeId/progress", authMiddleware, updateChallengeProgress);

module.exports = router;
