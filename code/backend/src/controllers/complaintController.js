import { validate, createComplaintSchema, updateComplaintSchema, complaintIdParamSchema, complaintQuerySchema } from "../validators/index.js";
import { createComplaint, listComplaints, getComplaint, updateComplaint } from "../services/complaintService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listComplaintsController = [
  validate(complaintQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listComplaints({ status: req.query.status }, ctx(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
];

export const createComplaintController = [
  validate(createComplaintSchema),
  async (req, res, next) => {
    try {
      const data = await createComplaint(req.body, ctx(req));
      res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Complaint created successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const getComplaintController = [
  validate(complaintIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await getComplaint({ complaintId: req.params.id }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data });
    } catch (error) {
      next(error);
    }
  },
];

export const updateComplaintController = [
  validate(complaintIdParamSchema),
  validate(updateComplaintSchema),
  async (req, res, next) => {
    try {
      const data = await updateComplaint({ complaintId: req.params.id, ...req.body }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Complaint updated successfully" });
    } catch (error) {
      next(error);
    }
  },
];
