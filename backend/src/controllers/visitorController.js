import { createVisitor, listVisitors, getVisitor, updateVisitor, deleteVisitor } from "../services/visitorService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listVisitorsController = async (req, res, next) => {
  try {
    const data = await listVisitors({ status: req.query.status }, ctx(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createVisitorController = async (req, res, next) => {
  try {
    const data = await createVisitor(req.body, ctx(req));
    res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Visitor created successfully" });
  } catch (error) {
    next(error);
  }
};

export const getVisitorController = async (req, res, next) => {
  try {
    const data = await getVisitor({ visitorId: req.params.id }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data });
  } catch (error) {
    next(error);
  }
};

export const updateVisitorController = async (req, res, next) => {
  try {
    const data = await updateVisitor({ visitorId: req.params.id, ...req.body }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Visitor updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteVisitorController = async (req, res, next) => {
  try {
    const data = await deleteVisitor({ visitorId: req.params.id }, ctx(req));
    res.json({ success: true, ...data, message: "Visitor deleted successfully" });
  } catch (error) {
    next(error);
  }
};
