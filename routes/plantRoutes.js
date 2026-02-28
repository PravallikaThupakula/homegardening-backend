const express = require("express");
const router = express.Router();
const {
  getAllPlants,
  getPlantById,
  searchPlants,
  getPlantsByRegion,
} = require("../controllers/plantController");

router.get("/", getAllPlants);
router.get("/search", searchPlants);
router.get("/region/:region", getPlantsByRegion);
router.get("/:id", getPlantById);

module.exports = router;
