import { validate, createBuildingSchema, updateBuildingSchema, buildingIdParamSchema } from "../validators/index.js";
import { createBuilding, listBuildings, getBuilding, updateBuilding, deleteBuilding } from "../services/buildingService.js";

const managers = ["platform_admin", "society_admin", "accountant"];

export const listBuildingsController = [
  validate(buildingIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await listBuildings({ societyId: req.params.societyId }, { user: req.user });
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
];

export const createBuildingController = [
  validate(createBuildingSchema),
  async (req, res, next) => {
    try {
      const data = await createBuilding({ societyId: req.params.societyId, ...req.body }, { user: req.user });
      res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Building created successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const getBuildingController = [
  validate(buildingIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await getBuilding({ buildingId: req.params.id }, { user: req.user });
      res.json({ success: true, ...data.toObject ? data.toObject() : data });
    } catch (error) {
      next(error);
    }
  },
];

export const updateBuildingController = [
  validate(buildingIdParamSchema),
  validate(updateBuildingSchema),
  async (req, res, next) => {
    try {
      const data = await updateBuilding({ buildingId: req.params.id, ...req.body }, { user: req.user });
      res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Building updated successfully" });
    } catch (error) {
      next(error);
    }
  },
];

export const deleteBuildingController = [
  validate(buildingIdParamSchema),
  async (req, res, next) => {
    try {
      const data = await deleteBuilding({ buildingId: req.params.id }, { user: req.user });
      res.json({ success: true, ...data, message: "Building deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
];
