import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Flat from "../models/flat.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("platform_admin", "society_admin", "accountant"));

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try {
    const residents = await User.find({ societyIds: req.societyId, role: "resident", active: true }).select("name email phone flatId createdAt").populate("flatId", "flatNumber wing").sort({ name: 1 }).lean();
    res.json(residents);
  } catch (error) { next(error); }
});

router.post("/", requireSocietyAccess, async (req, res, next) => {
  try {
    const { name, email, password, phone, flatId } = req.body;
    if (!name || !email || !password || !flatId) return res.status(400).json({ message: "name, email, password and flatId are required" });
    const flat = await Flat.findOne({ _id: flatId, societyId: req.societyId });
    if (!flat) return res.status(400).json({ message: "Flat does not belong to this society" });
    const user = await User.create({ name, email, phone, flatId, role: "resident", societyIds: [req.societyId], passwordHash: await bcrypt.hash(password, 12) });
    await Flat.updateOne({ _id: flatId }, { status: "occupied", $addToSet: { residentIds: user._id } });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, phone: user.phone, flatId: user.flatId });
  } catch (error) { next(error); }
});

export default router;
