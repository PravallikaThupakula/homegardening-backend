const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  getJournalEntries,
  createJournalEntry,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
} = require("../controllers/journalController");
const { getReflection, detectMood } = require("../controllers/journalAiController");

router.get("/", authMiddleware, getJournalEntries);
router.post("/ai/reflection", authMiddleware, getReflection);
router.post("/ai/mood", authMiddleware, detectMood);
router.get("/:id", authMiddleware, getJournalEntryById);
router.post("/", authMiddleware, upload.single("image"), createJournalEntry);
router.put("/:id", authMiddleware, upload.single("image"), updateJournalEntry);
router.delete("/:id", authMiddleware, deleteJournalEntry);

module.exports = router;
