import { validate, createBillSchema, updateBillSchema, billIdParamSchema, billQuerySchema } from "../validators/index.js";
import { createBill, listBills, getBill, updateBill, deleteBill } from "../services/maintenanceService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });
const managers = ["platform_admin", "society_admin", "accountant"];

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

export const deleteBillController = [
  validate(billIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await deleteBill({ billId: req.params.id }, ctx(req));
      res.json({ success: true, ...data, message: "Maintenance bill deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
];
