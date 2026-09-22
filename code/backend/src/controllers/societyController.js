import { validate, createSocietySchema, updateSocietySchema, societyIdParamSchema } from "../validators/index.js";
import { createSociety, listSocieties, getSociety, updateSociety } from "../services/societyService.js";

export const listSocietiesController = async (req, res, next) => {
  try {
    const data = await listSocieties({}, { user: req.user });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createSocietyController = [
  validate(createSocietySchema),
  async (req, res, next) => {
    try {
      const data = await createSociety(req.body, { user: req.user });
      res.status(201).json({ success: true, data, message: "Society created successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const getSocietyController = [
  validate(societyIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await getSociety({ societyId: req.params.societyId }, { user: req.user });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
];

export const updateSocietyController = [
  validate(societyIdParamSchema),
  validate(updateSocietySchema),
  async (req, res, next) => {
    try {
      const data = await updateSociety({ societyId: req.params.societyId, ...req.body }, { user: req.user });
      res.json({ success: true, data, message: "Society updated successfully" });
    } catch (error) {
      next(error);
    }
  },
];
