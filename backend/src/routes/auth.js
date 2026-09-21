import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email, active: true }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    const payload = { sub: user._id.toString(), name: user.name, role: user.role, flatId: user.flatId?.toString() || null, societyIds: user.societyIds.map(String) };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, flatId: user.flatId, societyIds: user.societyIds } });
  } catch (error) { next(error); }
});

export default router;
