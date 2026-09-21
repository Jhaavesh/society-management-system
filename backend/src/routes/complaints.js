import { Router } from "express";
import Complaint from "../models/complaint.js";
import Flat from "../models/flat.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "security", "accountant"];

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "resident") filter.userId = req.user.sub;
    if (req.query.status) filter.status = req.query.status;
    res.json(await Complaint.find(filter).populate("flatId", "flatNumber wing").sort({ createdAt: -1 }).lean());
  } catch (error) { next(error); }
});

router.post("/", requireRole("resident", ...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const { flatId, category, description, priority } = req.body;
    if (!flatId || !category || !description) return res.status(400).json({ message: "flatId, category and description are required" });
    if (!await Flat.exists({ _id: flatId, societyId: req.societyId })) return res.status(400).json({ message: "Flat does not belong to this society" });
    res.status(201).json(await Complaint.create({ flatId, category, description, priority, societyId: req.societyId, userId: req.user.sub }));
  } catch (error) { next(error); }
});

router.patch("/:id", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const complaint = await Complaint.findOneAndUpdate({ _id: req.params.id, societyId: req.societyId }, req.body, { new: true, runValidators: true });
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (error) { next(error); }
});

export default router;
