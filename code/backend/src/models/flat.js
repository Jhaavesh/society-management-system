import mongoose from "mongoose";

const schema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true, index: true },
  flatNumber: { type: String, required: true, trim: true },
  floor: { type: Number, min: 0 },
  wing: { type: String, trim: true },
  status: { type: String, enum: ["vacant", "occupied"], default: "vacant" },
  residentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

schema.index({ societyId: 1, buildingId: 1, flatNumber: 1 }, { unique: true });
export default mongoose.model("Flat", schema);
