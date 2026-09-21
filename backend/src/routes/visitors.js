import { Router } from "express";
import Visitor from "../models/visitor.js";
import Flat from "../models/flat.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "security"];

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "resident") filter.flatId = req.user.flatId;
    else if (req.query.status) filter.status = req.query.status;
    res.json(await Visitor.find(filter).populate("flatId", "flatNumber wing").sort({ visitDate: -1 }).lean());
  } catch (error) { next(error); }
});
router.post("/", requireRole("resident", ...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const { flatId, visitorName, visitorMobile, purpose, visitDate } = req.body;
    if (!flatId || !visitorName || !visitDate) return res.status(400).json({ message: "flatId, visitorName and visitDate are required" });
    if (!await Flat.exists({ _id: flatId, societyId: req.societyId })) return res.status(400).json({ message: "Flat does not belong to this society" });
    res.status(201).json(await Visitor.create({ flatId, visitorName, visitorMobile, purpose, visitDate, societyId: req.societyId }));
  } catch (error) { next(error); }
});
router.patch("/:id", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const visitor = await Visitor.findOneAndUpdate({ _id: req.params.id, societyId: req.societyId }, { ...req.body, approvedBy: req.user.sub }, { new: true, runValidators: true });
    if (!visitor) return res.status(404).json({ message: "Visitor entry not found" });
    res.json(visitor);
  } catch (error) { next(error); }
});

export default router;
