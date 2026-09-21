import { Router } from "express";
import Payment from "../models/payment.js";
import MaintenanceBill from "../models/maintenancebill.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "resident") filter.flatId = req.user.flatId;
    else if (req.query.billId) filter.billId = req.query.billId;
    res.json(await Payment.find(filter).populate("billId flatId", "month year flatNumber").sort({ paymentDate: -1 }).lean());
  } catch (error) { next(error); }
});

router.post("/", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const { billId, flatId, amountPaid, method, transactionRef } = req.body;
    const bill = await MaintenanceBill.findOne({ _id: billId, flatId, societyId: req.societyId });
    if (!bill) return res.status(400).json({ message: "Bill does not belong to this society or flat" });
    const payment = await Payment.create({ billId, flatId, amountPaid, method, transactionRef, societyId: req.societyId, recordedBy: req.user.sub });
    await MaintenanceBill.updateOne({ _id: bill._id }, { status: "paid" });
    res.status(201).json(payment);
  } catch (error) { next(error); }
});

export default router;
