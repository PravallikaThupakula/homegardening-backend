import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getAllPosts,
  createPost,
  getPostById,
  addComment,
  toggleLike,
  searchPosts,
} from "../controllers/forumController.js";

import {
  suggestAnswer,
  suggestTags,
} from "../controllers/forumAiController.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/search", searchPosts);

router.post("/ai/suggest-answer", authMiddleware, suggestAnswer);
router.post("/ai/suggest-tags", authMiddleware, suggestTags);

router.get("/:id", getPostById);
router.post("/", authMiddleware, createPost);
router.post("/:postId/comments", authMiddleware, addComment);
router.post("/:postId/like", authMiddleware, toggleLike);

export default router;