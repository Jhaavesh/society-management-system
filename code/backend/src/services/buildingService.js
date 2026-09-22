import Building from "../models/building.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

export async function createBuilding(data, context) {
  const { societyId, name, floors } = data;
  if (!societyId || !name) {
    throw new ValidationError("societyId and name are required");
  }
  return Building.create({ societyId, name, floors });
}

export async function listBuildings(data, context) {
  const { societyId } = data;
  if (!societyId) {
    throw new ValidationError("societyId is required");
  }
  return Building.find({ societyId, active: true }).sort({ name: 1 }).lean();
}

export async function getBuilding(data, context) {
  const { buildingId } = data;
  if (!buildingId) {
    throw new ValidationError("buildingId is required");
  }
  const building = await Building.findById(buildingId).lean();
  if (!building) {
    throw new NotFoundError("Building not found");
  }
  return building;
}

export async function updateBuilding(data, context) {
  const { buildingId, ...updates } = data;
  if (!buildingId) {
    throw new ValidationError("buildingId is required");
  }
  const building = await Building.findOneAndUpdate(
    { _id: buildingId },
    updates,
    { new: true, runValidators: true }
  );
  if (!building) {
    throw new NotFoundError("Building not found");
  }
  return building;
}

export async function deleteBuilding(data, context) {
  const { buildingId } = data;
  if (!buildingId) {
    throw new ValidationError("buildingId is required");
  }
  const building = await Building.findByIdAndDelete(buildingId);
  if (!building) {
    throw new NotFoundError("Building not found");
  }
  return { success: true };
}
