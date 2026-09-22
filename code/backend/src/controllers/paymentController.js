import { validate, createPaymentSchema, paymentQuerySchema } from "../validators/index.js";
import { createPayment, listPayments } from "../services/paymentService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listPaymentsController = [
  validate(paymentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listPayments({ billId: req.query.billId }, ctx(req));
      res.json({ success: true, data });
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
      res.status(201).json({ success: true, data, message: "Payment recorded successfully" });
    } catch (error) {
      next(error);
    }
  },
];
