import { createPayment, listPayments, getPayment, deletePayment } from "../services/paymentService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listPaymentsController = async (req, res, next) => {
  try {
    const data = await listPayments({ billId: req.query.billId }, ctx(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createPaymentController = async (req, res, next) => {
  try {
    const data = await createPayment(req.body, ctx(req));
    res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Payment recorded successfully" });
  } catch (error) {
    next(error);
  }
};

export const getPaymentController = async (req, res, next) => {
  try {
    const data = await getPayment({ paymentId: req.params.id }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data });
  } catch (error) {
    next(error);
  }
};

export const deletePaymentController = async (req, res, next) => {
  try {
    const data = await deletePayment({ paymentId: req.params.id }, ctx(req));
    res.json({ success: true, ...data, message: "Payment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
