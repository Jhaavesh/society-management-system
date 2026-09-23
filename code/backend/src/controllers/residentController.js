import { validate, createResidentSchema, residentQuerySchema } from "../validators/index.js";
import { createResident, listResidents, getResident, updateResident, assignFlat, removeResident } from "../services/residentService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });
const managers = ["platform_admin", "society_admin", "accountant"];

export const listResidentsController = [
  validate(residentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listResidents({}, ctx(req));
      res.json(data);
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

export const getResidentController = [
  validate(residentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await getResident({ residentId: req.params.id }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data });
    } catch (error) {
      next(error);
    }
  },
];

export const updateResidentController = [
  validate(residentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await updateResident({ residentId: req.params.id, ...req.body }, ctx(req));
      res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Resident updated successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const assignFlatController = [
  validate(residentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await assignFlat({ residentId: req.params.id, flatId: req.body.flatId }, ctx(req));
      res.json({ success: true, data, message: "Flat assigned successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const removeResidentController = [
  validate(residentQuerySchema),
  async (req, res, next) => {
    try {
      const data = await removeResident({ residentId: req.params.id }, ctx(req));
      res.json({ success: true, ...data, message: "Resident removed successfully" });
    } catch (error) {
      next(error);
    }
  },
];
