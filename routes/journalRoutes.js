import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getJournalEntries,
  createJournalEntry,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
} from "../controllers/journalController.js";

import {
  getReflection,
  detectMood,
} from "../controllers/journalAiController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ================= JOURNAL ROUTES ================= */

router.get("/", authMiddleware, getJournalEntries);

router.post("/ai/reflection", authMiddleware, getReflection);
router.post("/ai/mood", authMiddleware, detectMood);

router.get("/:id", authMiddleware, getJournalEntryById);

router.post("/", authMiddleware, upload.single("image"), createJournalEntry);

router.put("/:id", authMiddleware, upload.single("image"), updateJournalEntry);

router.delete("/:id", authMiddleware, deleteJournalEntry);

export default router;