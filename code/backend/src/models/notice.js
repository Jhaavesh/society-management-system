import mongoose from "mongoose";

const schema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  validTill: { type: Date },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Notice", schema);
