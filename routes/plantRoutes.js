import express from "express";

import {
  getAllPlants,
  getPlantById,
  searchPlants,
  getPlantsByRegion,
} from "../controllers/plantController.js";

const router = express.Router();

/* ================= PLANT ROUTES ================= */

router.get("/", getAllPlants);

router.get("/search", searchPlants);

router.get("/region/:region", getPlantsByRegion);

router.get("/:id", getPlantById);

export default router;