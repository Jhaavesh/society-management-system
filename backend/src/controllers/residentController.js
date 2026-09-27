import { createResident, listResidents, getResident, updateResident, assignFlat, removeResident } from "../services/residentService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listResidentsController = async (req, res, next) => {
  try {
    const data = await listResidents({}, ctx(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createResidentController = async (req, res, next) => {
  try {
    const data = await createResident(req.body, ctx(req));
    res.status(201).json({ success: true, data, message: "Resident created successfully" });
  } catch (error) {
    next(error);
  }
};

export const getResidentController = async (req, res, next) => {
  try {
    const data = await getResident({ residentId: req.params.id }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data });
  } catch (error) {
    next(error);
  }
};

export const updateResidentController = async (req, res, next) => {
  try {
    const data = await updateResident({ residentId: req.params.id, ...req.body }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Resident updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const assignFlatController = async (req, res, next) => {
  try {
    const data = await assignFlat({ residentId: req.params.id, flatId: req.body.flatId }, ctx(req));
    res.json({ success: true, data, message: "Flat assigned successfully" });
  } catch (error) {
    next(error);
  }
};

export const removeResidentController = async (req, res, next) => {
  try {
    const data = await removeResident({ residentId: req.params.id }, ctx(req));
    res.json({ success: true, ...data, message: "Resident removed successfully" });
  } catch (error) {
    next(error);
  }
};
