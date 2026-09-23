import mongoose from "mongoose";
import Payment from "../models/payment.js";
import MaintenanceBill from "../models/maintenancebill.js";
import { buildPagination, paginatedResponse } from "../utils/pagination.js";
import { NotFoundError, ValidationError, ConflictError } from "../errors/index.js";

export async function createPayment(data, context) {
  const { billId, flatId, amountPaid, method, transactionRef } = data;
  const amount = Number(amountPaid);
  const ref = String(transactionRef || "").trim() || undefined;
  
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError("amountPaid must be greater than zero");
  }
  if (!billId || !flatId) {
    throw new ValidationError("billId and flatId are required");
  }

  const session = await mongoose.startSession();
  try {
    let payment;
    await session.withTransaction(async () => {
      const bill = await MaintenanceBill.findOne({ _id: billId, flatId, societyId: context.societyId }).session(session);
      if (!bill) {
        throw new ValidationError("Bill does not belong to this society or flat");
      }
      if (ref && await Payment.exists({ transactionRef: ref }).session(session)) {
        throw new ConflictError("transactionRef has already been recorded");
      }
      const totals = await Payment.aggregate([
        { $match: { billId: bill._id } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]).session(session);
      const paid = Number(totals[0]?.total || 0);
      const remaining = Math.max(0, Number(bill.amount) - paid);
      if (remaining <= 0) {
        throw new ConflictError("Bill is already fully paid");
      }
      if (amount > remaining) {
        throw new ValidationError(`Payment exceeds remaining balance of ${remaining}`);
      }
      const created = await Payment.create([{
        billId: bill._id,
        flatId,
        amountPaid: amount,
        method,
        transactionRef: ref,
        societyId: context.societyId,
        recordedBy: context.user.sub,
      }], { session });
      const nextPaid = Math.round((paid + amount) * 100) / 100;
      await MaintenanceBill.updateOne(
        { _id: bill._id },
        { $set: { amountPaid: nextPaid, status: nextPaid >= Number(bill.amount) ? "paid" : "pending" } },
        { session }
      );
      payment = created[0];
    });
    return payment;
  } finally {
    await session.endSession();
  }
}

export async function listPayments(data, context) {
  if (!context.societyId) {
    throw new ValidationError("societyId is required");
  }
  const { page, limit, skip } = buildPagination(data);
  const filter = { societyId: context.societyId };
  if (context.user.role === "resident") {
    if (!context.user.flatId) {
      throw new ValidationError("Resident is not assigned to a flat");
    }
    filter.flatId = context.user.flatId;
  } else if (data.billId) {
    filter.billId = data.billId;
  }
  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate("billId flatId", "month year flatNumber")
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);
  return paginatedResponse(items, total, page, limit);
}

export async function getPayment(data, context) {
  const { paymentId } = data;
  if (!paymentId) {
    throw new ValidationError("paymentId is required");
  }
  const payment = await Payment.findOne({ _id: paymentId, societyId: context.societyId })
    .populate("billId flatId", "month year flatNumber")
    .lean();
  if (!payment) {
    throw new NotFoundError("Payment not found");
  }
  return payment;
}

export async function deletePayment(data, context) {
  const { paymentId } = data;
  if (!paymentId) {
    throw new ValidationError("paymentId is required");
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ _id: paymentId, societyId: context.societyId }).session(session);
      if (!payment) {
        throw new NotFoundError("Payment not found");
      }
      const bill = await MaintenanceBill.findById(payment.billId).session(session);
      if (bill) {
        const totals = await Payment.aggregate([
          { $match: { billId: bill._id, _id: { $ne: payment._id } } },
          { $group: { _id: null, total: { $sum: "$amountPaid" } } }
        ]).session(session);
        const paid = Number(totals[0]?.total || 0);
        bill.amountPaid = paid;
        bill.status = paid >= Number(bill.amount) ? "paid" : "pending";
        await bill.save({ session });
      }
      await Payment.deleteOne({ _id: paymentId }).session(session);
    });
    return { success: true };
  } finally {
    await session.endSession();
  }
}
