import mongoose from "mongoose";

const schema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
  flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
  visitorName: { type: String, required: true, trim: true },
  visitorMobile: { type: String, trim: true },
  purpose: { type: String, trim: true },
  visitDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected", "checked_in", "checked_out"], default: "pending", index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Visitor", schema);
