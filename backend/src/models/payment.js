import mongoose from "mongoose";

const schema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
  billId: { type: mongoose.Schema.Types.ObjectId, ref: "MaintenanceBill", required: true, index: true },
  flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
  amountPaid: { type: Number, min: 0.01, required: true },
  paymentDate: { type: Date, default: Date.now },
  method: { type: String, enum: ["cash", "cheque", "online"], default: "cash" },
  transactionRef: { type: String, trim: true, unique: true, sparse: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Payment", schema);
