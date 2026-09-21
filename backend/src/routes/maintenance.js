import { Router } from "express";
import MaintenanceBill from "../models/maintenancebill.js";
import Flat from "../models/flat.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "resident") filter.flatId = req.user.flatId;
    else if (req.query.flatId) filter.flatId = req.query.flatId;
    if (req.query.status) filter.status = req.query.status;
    res.json(await MaintenanceBill.find(filter).populate("flatId", "flatNumber wing").sort({ dueDate: -1 }).lean());
  } catch (error) { next(error); }
});
router.post("/", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const { flatId, month, year, amount, dueDate } = req.body;
    if (!flatId || !month || !year || amount === undefined || !dueDate) return res.status(400).json({ message: "flatId, month, year, amount and dueDate are required" });
    if (!await Flat.exists({ _id: flatId, societyId: req.societyId })) return res.status(400).json({ message: "Flat does not belong to this society" });
    res.status(201).json(await MaintenanceBill.create({ flatId, month, year, amount, dueDate, societyId: req.societyId, createdBy: req.user.sub }));
  } catch (error) { next(error); }
});
router.patch("/:id", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const bill = await MaintenanceBill.findOneAndUpdate({ _id: req.params.id, societyId: req.societyId }, req.body, { new: true, runValidators: true });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (error) { next(error); }
});

export default router;
