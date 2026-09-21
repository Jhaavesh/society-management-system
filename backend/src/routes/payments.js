import { Router } from "express";
import mongoose from "mongoose";
import Payment from "../models/payment.js";
import MaintenanceBill from "../models/maintenancebill.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "resident") {
      if (!req.user.flatId) return res.status(403).json({ message: "Resident is not assigned to a flat" });
      filter.flatId = req.user.flatId;
    }
    else if (req.query.billId) filter.billId = req.query.billId;
    res.json(await Payment.find(filter).populate("billId flatId", "month year flatNumber").sort({ paymentDate: -1 }).lean());
  } catch (error) { next(error); }
});

router.post("/", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { billId, flatId, amountPaid, method, transactionRef } = req.body;
    const amount = Number(amountPaid);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: "amountPaid must be greater than zero" });
    if (!billId || !flatId) return res.status(400).json({ message: "billId and flatId are required" });
    let payment;
    await session.withTransaction(async () => {
      const bill = await MaintenanceBill.findOne({ _id: billId, flatId, societyId: req.societyId }).session(session);
      if (!bill) throw Object.assign(new Error("Bill does not belong to this society or flat"), { statusCode: 400 });
      const totals = await Payment.aggregate([
        { $match: { billId: bill._id } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]).session(session);
      const paid = Number(totals[0]?.total || 0);
      const remaining = Math.max(0, Number(bill.amount) - paid);
      if (remaining <= 0) throw Object.assign(new Error("Bill is already fully paid"), { statusCode: 409 });
      if (amount > remaining) throw Object.assign(new Error(`Payment exceeds remaining balance of ${remaining}`), { statusCode: 400 });
      const ref = String(transactionRef || "").trim() || undefined;
      const created = await Payment.create([{ billId: bill._id, flatId, amountPaid: amount, method, transactionRef: ref, societyId: req.societyId, recordedBy: req.user.sub }], { session });
      const nextPaid = Math.round((paid + amount) * 100) / 100;
      await MaintenanceBill.updateOne({ _id: bill._id }, { $set: { amountPaid: nextPaid, status: nextPaid >= Number(bill.amount) ? "paid" : "pending" } }, { session });
      payment = created[0];
    });
    res.status(201).json(payment);
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "transactionRef has already been recorded" });
    if (error?.statusCode) return res.status(error.statusCode).json({ message: error.message });
    next(error);
  } finally { await session.endSession(); }
});

export default router;
