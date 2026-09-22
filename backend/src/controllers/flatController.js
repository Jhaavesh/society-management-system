import { validate, createFlatSchema, updateFlatSchema, flatIdParamSchema, flatQuerySchema } from "../validators/index.js";
import { createFlat, listFlats, getFlat, updateFlat } from "../services/flatService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listFlatsController = [
  validate(flatQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listFlats({ buildingId: req.query.buildingId }, ctx(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
];

export const createFlatController = [
  validate(createFlatSchema),
  async (req, res, next) => {
    try {
      const data = await createFlat(req.body, ctx(req));
      res.status(201).json({ success: true, data, message: "Flat created successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const getFlatController = [
  validate(flatIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await getFlat({ flatId: req.params.id }, ctx(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
];

export const updateFlatController = [
  validate(flatIdParamSchema),
  validate(updateFlatSchema),
  async (req, res, next) => {
    try {
      const data = await updateFlat({ flatId: req.params.id, ...req.body }, ctx(req));
      res.json({ success: true, data, message: "Flat updated successfully" });
    } catch (error) {
      next(error);
    }
  },
];
