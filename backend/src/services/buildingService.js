import Building from "../models/building.js";
import { pickAllowedFields } from "../utils/fields.js";
import { buildPagination, paginatedResponse } from "../utils/pagination.js";
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
  const { page, limit, skip } = buildPagination(data);
  const [items, total] = await Promise.all([
    Building.find({ societyId, active: true }).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Building.countDocuments({ societyId, active: true }),
  ]);
  return paginatedResponse(items, total, page, limit);
}

export async function getBuilding(data, context) {
  const { buildingId } = data;
  if (!buildingId) {
    throw new ValidationError("buildingId is required");
  }
  // SECURITY: Filter by societyId to prevent cross-society data access
  const filter = { _id: buildingId };
  if (context.societyId) {
    filter.societyId = context.societyId;
  }
  const building = await Building.findOne(filter).lean();
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
  // SECURITY: Whitelist allowed fields to prevent field injection (e.g. overwriting societyId)
  const { values, unknown } = pickAllowedFields(updates, ["name", "floors", "active"]);
  if (unknown.length) {
    throw new ValidationError(`Unsupported building fields: ${unknown.join(", ")}`);
  }
  if (!Object.keys(values).length) {
    throw new ValidationError("At least one editable building field is required");
  }
  // SECURITY: Filter by societyId to prevent cross-society modification
  const filter = { _id: buildingId };
  if (context.societyId) {
    filter.societyId = context.societyId;
  }
  const building = await Building.findOneAndUpdate(
    filter,
    values,
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
  // SECURITY: Filter by societyId to prevent cross-society deletion
  const filter = { _id: buildingId };
  if (context.societyId) {
    filter.societyId = context.societyId;
  }
  const building = await Building.findOneAndDelete(filter);
  if (!building) {
    throw new NotFoundError("Building not found");
  }
  return { success: true };
}
