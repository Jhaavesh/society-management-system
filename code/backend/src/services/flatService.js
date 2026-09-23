import Flat from "../models/flat.js";
import Building from "../models/building.js";
import { buildPagination, paginatedResponse } from "../utils/pagination.js";
import { NotFoundError, ValidationError, ConflictError } from "../errors/index.js";

export async function createFlat(data, context) {
  const { societyId, buildingId, flatNumber, floor, wing } = data;
  if (!societyId || !buildingId || !flatNumber) {
    throw new ValidationError("societyId, buildingId, and flatNumber are required");
  }
  const building = await Building.findOne({ _id: buildingId, societyId, active: true });
  if (!building) {
    throw new ValidationError("Building does not belong to this society");
  }
  try {
    return await Flat.create({ societyId, buildingId, flatNumber, floor, wing });
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictError("Flat number already exists in this building");
    }
    throw error;
  }
}

export async function listFlats(data, context) {
  const { societyId, buildingId } = data;
  if (!societyId) {
    throw new ValidationError("societyId is required");
  }
  const { page, limit, skip } = buildPagination(data);
  const filter = { societyId };
  if (buildingId) filter.buildingId = buildingId;
  if (context.user.role === "resident") {
    if (!context.user.flatId) {
      throw new ValidationError("Resident is not assigned to a flat");
    }
    filter._id = context.user.flatId;
  }
  const [items, total] = await Promise.all([
    Flat.find(filter).populate("buildingId", "name").sort({ flatNumber: 1 }).skip(skip).limit(limit).lean(),
    Flat.countDocuments(filter),
  ]);
  return paginatedResponse(items, total, page, limit);
}

export async function getFlat(data, context) {
  const { flatId } = data;
  if (!flatId) {
    throw new ValidationError("flatId is required");
  }
  const flat = await Flat.findById(flatId).populate("buildingId", "name").lean();
  if (!flat) {
    throw new NotFoundError("Flat not found");
  }
  return flat;
}

export async function updateFlat(data, context) {
  const { flatId, ...updates } = data;
  if (!flatId) {
    throw new ValidationError("flatId is required");
  }
  if (updates.buildingId) {
    const building = await Building.findOne({ _id: updates.buildingId, societyId: updates.societyId || context.societyId, active: true });
    if (!building) {
      throw new ValidationError("Building does not belong to this society");
    }
  }
  const flat = await Flat.findOneAndUpdate(
    { _id: flatId, societyId: context.societyId },
    updates,
    { new: true, runValidators: true }
  );
  if (!flat) {
    throw new NotFoundError("Flat not found");
  }
  return flat;
}

export async function deleteFlat(data, context) {
  const { flatId } = data;
  if (!flatId) {
    throw new ValidationError("flatId is required");
  }
  const flat = await Flat.findOneAndDelete({ _id: flatId, societyId: context.societyId });
  if (!flat) {
    throw new NotFoundError("Flat not found");
  }
  return { success: true };
}
