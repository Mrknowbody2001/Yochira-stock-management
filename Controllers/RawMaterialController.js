import MaterialStore from "../Models/MaterialStore.js";
import MaterialTransaction from "../Models/MaterialTransaction.js";
import RawMaterial from "../Models/RawMaterial.js";

export const searchRawMaterials = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const regex = new RegExp(query, "i"); // Case-insensitive search
    const materials = await RawMaterial.find({
      $or: [{ materialName: regex }, { materialId: regex }],
    }).limit(10); // Limit results to 10

    res.status(200).json(materials);
  } catch (error) {
    console.error("Error searching raw materials:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateMaterialStoreController = async (req, res, next) => {
  try {
    const { items, referenceNo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    for (const item of items) {
      const { materialId, materialName, receiveQty, uom, unitPrice } = item;

      if (!materialId || !receiveQty || receiveQty <= 0) continue;

      let storeItem = await MaterialStore.findOne({ materialId });

      if (storeItem) {
        storeItem.currentStock += receiveQty;
        storeItem.unitPrice = unitPrice;
        storeItem.lastUpdated = new Date();
        await storeItem.save();
      } else {
        storeItem = new MaterialStore({
          materialId,
          materialName,
          currentStock: receiveQty,
          uom,
          unitPrice,
          lastUpdated: new Date(),
        });
        await storeItem.save();
      }

      await MaterialTransaction.create({
        materialId,
        materialName,
        qty: receiveQty,
        uom,
        unitPrice,
        type: "RECEIVE",
        referenceNo,
        remark: "Stock updated via StockIn",
      });
    }

    res.status(200).json({ message: "Material store updated successfully" });
  } catch (error) {
    console.error("Error updating material store:", error.message);
    next(error);
  }
};

export const stockOutMaterial = async (req, res, next) => {
  try {
    const { items, referenceNo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    for (const item of items) {
      const { materialId, materialName, qty, uom } = item;

      if (!materialId || !qty || qty <= 0) continue;

      // Find the material in store
      let storeItem = await MaterialStore.findOne({ materialId });

      if (!storeItem) {
        return res.status(400).json({
          message: `Material ${materialId} not found in store. Cannot stock out.`,
        });
      }

      // Check for sufficient stock
      if (storeItem.currentStock < qty) {
        return res.status(400).json({
          message: `Not enough stock for ${materialId}. Available: ${storeItem.currentStock}`,
        });
      }

      // Reduce stock
      storeItem.currentStock -= qty;
      storeItem.lastUpdated = new Date();
      await storeItem.save();

      // Log transaction with the original price
      await MaterialTransaction.create({
        materialId,
        materialName,
        qty,
        uom,
        unitPrice: storeItem.unitPrice, // Keep price from DB
        type: "ISSUE",
        referenceNo,
        remark: "Stock updated via StockOut",
      });
    }

    res.status(200).json({ message: "Stock out completed successfully" });
  } catch (error) {
    console.error("Error in stock out:", error.message);
    next(error);
  }
};
