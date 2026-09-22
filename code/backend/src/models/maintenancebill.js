import mongoose from "mongoose";

const schema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
  flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true, index: true },
  month: { type: Number, min: 1, max: 12, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, min: 0, required: true },
  amountPaid: { type: Number, min: 0, default: 0 },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending", index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

schema.index({ societyId: 1, flatId: 1, month: 1, year: 1 }, { unique: true });
export default mongoose.model("MaintenanceBill", schema);
