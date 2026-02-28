import express from "express";

import {
  getAllPests,
  getPestById,
  searchPests,
  getPestsByPlant,
} from "../controllers/pestController.js";

const router = express.Router();

/* ================= PEST ROUTES ================= */

router.get("/", getAllPests);

router.get("/search", searchPests);

router.get("/plant/:plantType", getPestsByPlant);

router.get("/:id", getPestById);

export default router;