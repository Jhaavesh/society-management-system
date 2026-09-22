import mongoose from "mongoose";
import Society from "../models/society.js";
import User from "../models/user.js";
import Flat from "../models/flat.js";
import MaintenanceBill from "../models/maintenancebill.js";
import Payment from "../models/payment.js";
import Complaint from "../models/complaint.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

export async function getDashboardKPIs(data, context) {
  const { societyId } = data;
  if (!societyId) {
    throw new ValidationError("societyId is required");
  }
  const [society, residents, homes, bills, paidBills, payments, openRequests] = await Promise.all([
    Society.findById(societyId).lean(),
    User.countDocuments({ societyIds: societyId, role: "resident", active: true }),
    Flat.countDocuments({ societyId }),
    MaintenanceBill.countDocuments({ societyId }),
    MaintenanceBill.countDocuments({ societyId, status: "paid" }),
    Payment.aggregate([
      { $match: { societyId: new mongoose.Types.ObjectId(societyId) } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]),
    Complaint.countDocuments({ societyId, status: { $in: ["open", "assigned", "in_progress"] } }),
  ]);
  if (!society) {
    throw new NotFoundError("Society not found");
  }
  const totalCollected = payments[0]?.total || 0;
  const collectionRate = bills ? Math.round((paidBills / bills) * 1000) / 10 : 0;
  return {
    society,
    kpis: {
      residents,
      homes,
      collectionRate,
      collected: totalCollected,
      openRequests,
    },
    status: "live",
  };
}

