import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllChallenges,
  getChallengeById,
  joinChallenge,
  updateChallengeProgress,
  getLeaderboard,
  getUserChallenges,
  shareProgress,
} from "../controllers/challengeController.js";

const router = express.Router();

router.get("/", getAllChallenges);
router.get("/leaderboard", getLeaderboard);
router.get("/user", authMiddleware, getUserChallenges);
router.post("/share", authMiddleware, shareProgress);
router.get("/:id", getChallengeById);
router.post("/:challengeId/join", authMiddleware, joinChallenge);
router.put("/:challengeId/progress", authMiddleware, updateChallengeProgress);

export default router;