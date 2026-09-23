import { validate, createVisitorSchema, updateVisitorSchema, visitorIdParamSchema, visitorQuerySchema } from "../validators/index.js";
import { createVisitor, listVisitors, getVisitor, updateVisitor, deleteVisitor } from "../services/visitorService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });
const managers = ["platform_admin", "society_admin", "security"];

export const listVisitorsController = [
  validate(visitorQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listVisitors({ status: req.query.status }, ctx(req));
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
];

export const createVisitorController = [
  validate(createVisitorSchema),
  async (req, res, next) => {
    try {
      const data = await createVisitor(req.body, ctx(req));
      res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Visitor created successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const getVisitorController = [
  validate(visitorIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await getVisitor({ visitorId: req.params.id }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data });
    } catch (error) {
      next(error);
    }
  },
];

export const updateVisitorController = [
  validate(visitorIdParamSchema),
  validate(updateVisitorSchema),
  async (req, res, next) => {
    try {
      const data = await updateVisitor({ visitorId: req.params.id, ...req.body }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Visitor updated successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const deleteVisitorController = [
  validate(visitorIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await deleteVisitor({ visitorId: req.params.id }, ctx(req));
      res.json({ success: true, ...data, message: "Visitor deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
];
