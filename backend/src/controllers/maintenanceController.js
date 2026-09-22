import { validate, createBillSchema, updateBillSchema, billIdParamSchema, billQuerySchema } from "../validators/index.js";
import { createBill, listBills, getBill, updateBill } from "../services/maintenanceService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listBillsController = [
  validate(billQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listBills({ flatId: req.query.flatId, status: req.query.status }, ctx(req));
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
];

export const createBillController = [
  validate(createBillSchema),
  async (req, res, next) => {
    try {
      const data = await createBill(req.body, ctx(req));
      res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Maintenance bill created successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const getBillController = [
  validate(billIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await getBill({ billId: req.params.id }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data });
    } catch (error) {
      next(error);
    }
  },
];

export const updateBillController = [
  validate(billIdParamSchema),
  validate(updateBillSchema),
  async (req, res, next) => {
    try {
      const data = await updateBill({ billId: req.params.id, ...req.body }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Maintenance bill updated successfully" });
    } catch (error) {
      next(error);
    }
  },
];
