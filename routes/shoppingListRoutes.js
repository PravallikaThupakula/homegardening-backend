const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getShoppingList,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  generateFromPlants,
} = require("../controllers/shoppingListController");

router.get("/", authMiddleware, getShoppingList);
router.post("/", authMiddleware, addShoppingItem);
router.post("/generate", authMiddleware, generateFromPlants);
router.put("/:id", authMiddleware, updateShoppingItem);
router.delete("/:id", authMiddleware, deleteShoppingItem);

module.exports = router;
