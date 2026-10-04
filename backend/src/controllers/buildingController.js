import { createBuilding, listBuildings, getBuilding, updateBuilding, deleteBuilding } from "../services/buildingService.js";

const ctx = (req) => ({ user: req.user, societyId: req.params.societyId || req.societyId });

export const listBuildingsController = async (req, res, next) => {
  try {
    const data = await listBuildings({ societyId: req.params.societyId }, ctx(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createBuildingController = async (req, res, next) => {
  try {
    const data = await createBuilding({ societyId: req.params.societyId, ...req.body }, ctx(req));
    res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Building created successfully" });
  } catch (error) {
    next(error);
  }
};

export const getBuildingController = async (req, res, next) => {
  try {
    const data = await getBuilding({ buildingId: req.params.id }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data });
  } catch (error) {
    next(error);
  }
};

export const updateBuildingController = async (req, res, next) => {
  try {
    const data = await updateBuilding({ buildingId: req.params.id, ...req.body }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Building updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteBuildingController = async (req, res, next) => {
  try {
    const data = await deleteBuilding({ buildingId: req.params.id }, ctx(req));
    res.json({ success: true, ...data, message: "Building deleted successfully" });
  } catch (error) {
    next(error);
  }
};
