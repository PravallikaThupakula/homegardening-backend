const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllPosts,
  createPost,
  getPostById,
  addComment,
  toggleLike,
  searchPosts,
} = require("../controllers/forumController");
const { suggestAnswer, suggestTags } = require("../controllers/forumAiController");

router.get("/", getAllPosts);
router.get("/search", searchPosts);
router.post("/ai/suggest-answer", authMiddleware, suggestAnswer);
router.post("/ai/suggest-tags", authMiddleware, suggestTags);
router.get("/:id", getPostById);
router.post("/", authMiddleware, createPost);
router.post("/:postId/comments", authMiddleware, addComment);
router.post("/:postId/like", authMiddleware, toggleLike);

module.exports = router;
