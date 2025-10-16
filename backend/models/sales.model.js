import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },

}, { timestamps: true });

export default mongoose.model("Sale", saleSchema);
