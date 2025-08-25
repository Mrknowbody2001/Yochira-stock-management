import express from "express";
import {
  searchRawMaterials,
  stockOutMaterial,
  updateMaterialStoreController,
} from "../Controllers/RawMaterialController.js";

const RawMaterialRouter = express.Router();

//search
RawMaterialRouter.get("/search", searchRawMaterials);

//update store from storeIn
RawMaterialRouter.post("/update-store", updateMaterialStoreController);

//remove material from store
RawMaterialRouter.post("/stock-out", stockOutMaterial);

export default RawMaterialRouter;
