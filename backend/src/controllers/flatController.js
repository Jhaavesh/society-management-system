import { createFlat, listFlats, getFlat, updateFlat, deleteFlat } from "../services/flatService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listFlatsController = async (req, res, next) => {
  try {
    const data = await listFlats({ societyId: req.societyId, buildingId: req.query.buildingId }, ctx(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createFlatController = async (req, res, next) => {
  try {
    const data = await createFlat({ societyId: req.societyId, ...req.body }, ctx(req));
    res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Flat created successfully" });
  } catch (error) {
    next(error);
  }
};

export const getFlatController = async (req, res, next) => {
  try {
    const data = await getFlat({ flatId: req.params.id }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data });
  } catch (error) {
    next(error);
  }
};

export const updateFlatController = async (req, res, next) => {
  try {
    const data = await updateFlat({ flatId: req.params.id, ...req.body }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Flat updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteFlatController = async (req, res, next) => {
  try {
    const data = await deleteFlat({ flatId: req.params.id }, ctx(req));
    res.json({ success: true, ...data, message: "Flat deleted successfully" });
  } catch (error) {
    next(error);
  }
};
