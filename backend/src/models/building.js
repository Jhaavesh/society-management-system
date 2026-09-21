import mongoose from "mongoose";

const schema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
  name: { type: String, required: true, trim: true },
  floors: { type: Number, min: 1, default: 1 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Building", schema);
