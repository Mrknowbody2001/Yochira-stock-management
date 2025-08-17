import MaterialStore from "../Models/MaterialStore.js";
import MaterialTransaction from "../Models/MaterialTransaction.js";

export const updateMaterialStore = async (items, referenceNo) => {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided for inventory update");
    }

    for (const item of items) {
      const { materialId, materialName, receiveQty, unitName, unitPrice } =
        item;

      if (!materialId || !receiveQty || receiveQty <= 0) continue;

      let storeItem = await MaterialStore.findOne({ materialId });

      if (storeItem) {
        // ✅ Update existing material
        storeItem.currentStock += receiveQty;
        storeItem.unitPrice = unitPrice; // update unit price
        storeItem.lastUpdated = new Date();
        await storeItem.save();
      } else {
        // ✅ Add new material
        storeItem = new MaterialStore({
          materialId,
          materialName,
          currentStock: receiveQty,
          uom: unitName,
          unitPrice,
          lastUpdated: new Date(),
        });
        await storeItem.save();
        console.log("New material added to store:", storeItem);
      }

      // ✅ Log transaction
      await MaterialTransaction.create({
        materialId,
        materialName,
        qty: receiveQty,
        uom: unitName,
        unitPrice,
        type: "RECEIVE",
        referenceNo,
        remark: "Stock updated via SORN",
      });

      console.log("Material updated in store:", storeItem);
    }

    return { message: "Material store updated successfully" };
  } catch (error) {
    console.error("Error updating material store:", error.message);
    throw new Error(`Material store update failed: ${error.message}`);
  }
};

// Get current stock
export const getMaterialStore = async (req, res, next) => {
  try {
    const storeItems = await MaterialStore.find().sort({ materialName: 1 });
    res.status(200).json(storeItems);
    console.log(storeItems);
  } catch (error) {
    next(error);
  }
};

// Get all material transactions
export const getMaterialTransactions = async (req, res, next) => {
  try {
    const transactions = await MaterialTransaction.find()
      .sort({ date: -1 })
      .limit(100); // optional: limit recent 100 records
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};
