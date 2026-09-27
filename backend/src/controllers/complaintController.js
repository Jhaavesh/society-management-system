import { createComplaint, listComplaints, getComplaint, updateComplaint, deleteComplaint } from "../services/complaintService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listComplaintsController = async (req, res, next) => {
  try {
    const data = await listComplaints({ status: req.query.status }, ctx(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createComplaintController = async (req, res, next) => {
  try {
    const data = await createComplaint(req.body, ctx(req));
    res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Complaint created successfully" });
  } catch (error) {
    next(error);
  }
};

export const getComplaintController = async (req, res, next) => {
  try {
    const data = await getComplaint({ complaintId: req.params.id }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintController = async (req, res, next) => {
  try {
    const data = await updateComplaint({ complaintId: req.params.id, ...req.body }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Complaint updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteComplaintController = async (req, res, next) => {
  try {
    const data = await deleteComplaint({ complaintId: req.params.id }, ctx(req));
    res.json({ success: true, ...data, message: "Complaint deleted successfully" });
  } catch (error) {
    next(error);
  }
};
