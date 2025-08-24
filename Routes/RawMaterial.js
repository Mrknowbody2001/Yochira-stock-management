import express from "express";
import { searchRawMaterials } from "../Controllers/RawMaterialController.js";

const RawMaterialRouter = express.Router();

//search
RawMaterialRouter.get("/search", searchRawMaterials);

export default RawMaterialRouter;
