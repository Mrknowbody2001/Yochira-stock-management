import express from "express";
import {
  getMaterialStore,
  getMaterialTransactions,
  updateMaterialStore,
} from "../Controllers/MaterialStoreController.js";

const materialsRouter = express.Router();

//create a new material
materialsRouter.post("/update", async (req, res, next) => {
  try {
    const { items, referenceNo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    const result = await updateMaterialStore(items, referenceNo);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Get current stock
materialsRouter.get("/store", getMaterialStore);

// Get transaction log
materialsRouter.get("/transactions", getMaterialTransactions);

export default materialsRouter;
