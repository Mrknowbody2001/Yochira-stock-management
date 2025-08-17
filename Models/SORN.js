import mongoose from "mongoose";

const SORNItemSchema = new mongoose.Schema({
  materialId: String,
  materialName: String,
  qty: Number,
  unitPrice: Number,
  unitName: String,
  value: Number,
  receiveQty: Number,
});

const SORNSchema = new mongoose.Schema(
  {
    SORNNo: { type: String, required: true },
    SONo: { type: String, required: true },
    supplierId: { type: String, required: true },
    supplierName: { type: String, required: true },
    paymentType: String,
    deliveryDate: Date,
    remark: String,
    sornCreatedDate: { type: Date, default: Date.now },
    items: [SORNItemSchema],
    grandTotal: { type: Number, default: 0 },
    totalPriceDifference: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("SORN", SORNSchema);
