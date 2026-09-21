import mongoose from "mongoose";

const roles = ["platform_admin", "society_admin", "resident", "security", "accountant"];
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: roles, default: "resident" },
  phone: { type: String, trim: true },
  societyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Society" }],
  flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export { roles };
export default mongoose.model("User", userSchema);
