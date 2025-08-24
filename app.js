import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import materialsStoreRouter from "./Routes/materialsStoreRouter.js";
import RawMaterialRouter from "./Routes/RawMaterial.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

//Routes

app.use("/api/materialStore/", materialsStoreRouter);
app.use("/api/rawMaterial", RawMaterialRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

//! Database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log(error);
  });

// ✅ Start server
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
