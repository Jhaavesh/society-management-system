import { Router } from "express";
import mongoose from "mongoose";
import Society from "../models/society.js";
import User from "../models/user.js";
import Flat from "../models/flat.js";
import MaintenanceBill from "../models/maintenancebill.js";
import Payment from "../models/payment.js";
import Complaint from "../models/complaint.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.get("/:societyId", requireAuth, requireRole("platform_admin", "society_admin", "accountant", "security"), requireSocietyAccess, async (req, res, next) => {
  try {
    const [society, residents, homes, bills, paidBills, payments, openRequests] = await Promise.all([
      Society.findById(req.societyId).lean(),
      User.countDocuments({ societyIds: req.societyId, role: "resident", active: true }),
      Flat.countDocuments({ societyId: req.societyId }),
      MaintenanceBill.countDocuments({ societyId: req.societyId }),
      MaintenanceBill.countDocuments({ societyId: req.societyId, status: "paid" }),
      Payment.aggregate([{ $match: { societyId: new mongoose.Types.ObjectId(req.societyId) } }, { $group: { _id: null, total: { $sum: "$amountPaid" } } }]),
      Complaint.countDocuments({ societyId: req.societyId, status: { $in: ["open", "assigned", "in_progress"] } })
    ]);
    if (!society) return res.status(404).json({ message: "Society not found" });
    const totalCollected = payments[0]?.total || 0;
    const collectionRate = bills ? Math.round((paidBills / bills) * 1000) / 10 : 0;
    res.json({ society, kpis: { residents, homes, collectionRate, collected: totalCollected, openRequests }, status: "live" });
  } catch (error) { next(error); }
});

export default router;
