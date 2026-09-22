import { validate, createResidentSchema, residentQuerySchema } from "../validators/index.js";
import { createResident, listResidents } from "../services/residentService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listResidentsController = [
  validate(residentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listResidents({}, ctx(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
];

export const createResidentController = [
  validate(createResidentSchema),
  async (req, res, next) => {
    try {
      const data = await createResident(req.body, ctx(req));
      res.status(201).json({ success: true, data, message: "Resident created successfully" });
    } catch (error) {
      next(error);
    }
  },
];
