import { createSociety, listSocieties, getSociety, updateSociety, deleteSociety } from "../services/societyService.js";

export const listSocietiesController = async (req, res, next) => {
  try {
    const data = await listSocieties({}, { user: req.user });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createSocietyController = async (req, res, next) => {
  try {
    const data = await createSociety(req.body, { user: req.user });
    res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Society created successfully" });
  } catch (error) {
    next(error);
  }
};

export const getSocietyController = async (req, res, next) => {
  try {
    const data = await getSociety({ societyId: req.params.societyId }, { user: req.user });
    res.json({ success: true, ...data.toObject ? data.toObject() : data });
  } catch (error) {
    next(error);
  }
};

export const updateSocietyController = async (req, res, next) => {
  try {
    const data = await updateSociety({ societyId: req.params.societyId, ...req.body }, { user: req.user });
    res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Society updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteSocietyController = async (req, res, next) => {
  try {
    const data = await deleteSociety({ societyId: req.params.societyId }, { user: req.user });
    res.json({ success: true, ...data, message: "Society deleted successfully" });
  } catch (error) {
    next(error);
  }
};
