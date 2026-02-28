import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getShoppingList,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  generateFromPlants,
} from "../controllers/shoppingListController.js";

const router = express.Router();

/* ================= SHOPPING LIST ROUTES ================= */

router.get("/", authMiddleware, getShoppingList);

router.post("/", authMiddleware, addShoppingItem);

router.post("/generate", authMiddleware, generateFromPlants);

router.put("/:id", authMiddleware, updateShoppingItem);

router.delete("/:id", authMiddleware, deleteShoppingItem);

export default router;