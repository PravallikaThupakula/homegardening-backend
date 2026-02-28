const express = require("express");
const router = express.Router();
const {
  getAllPests,
  getPestById,
  searchPests,
  getPestsByPlant,
} = require("../controllers/pestController");

router.get("/", getAllPests);
router.get("/search", searchPests);
router.get("/plant/:plantType", getPestsByPlant);
router.get("/:id", getPestById);

module.exports = router;
