import { validate, createPaymentSchema, paymentQuerySchema } from "../validators/index.js";
import { createPayment, listPayments, getPayment, deletePayment } from "../services/paymentService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });
const managers = ["platform_admin", "society_admin", "accountant"];

export const listPaymentsController = [
  validate(paymentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listPayments({ billId: req.query.billId }, ctx(req));
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
];

export const createPaymentController = [
  validate(createPaymentSchema),
  async (req, res, next) => {
    try {
      const data = await createPayment(req.body, ctx(req));
      res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Payment recorded successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const getPaymentController = [
  validate(paymentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await getPayment({ paymentId: req.params.id }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data });
    } catch (error) {
      next(error);
    }
  },
];

export const deletePaymentController = [
  validate(paymentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await deletePayment({ paymentId: req.params.id }, ctx(req));
      res.json({ success: true, ...data, message: "Payment deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
];
