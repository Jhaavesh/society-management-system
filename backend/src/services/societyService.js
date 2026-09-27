import Society from "../models/society.js";
import User from "../models/user.js";
import { buildPagination, paginatedResponse } from "../utils/pagination.js";
import { AuthorizationError, NotFoundError, ValidationError } from "../errors/index.js";

export async function createSociety(data, context) {
  const { name, address, city, state, pincode, logoUrl } = data;
  if (!name) {
    throw new ValidationError("Society name is required");
  }
  const society = await Society.create({
    name,
    address,
    city,
    state,
    pincode,
    logoUrl,
    createdBy: context.user.sub,
  });
  await User.updateOne(
    { _id: context.user.sub },
    { $addToSet: { societyIds: society._id } }
  );
  return society;
}

export async function listSocieties(data, context) {
  const { page, limit, skip } = buildPagination(data);
  const filter = context.user.role === "platform_admin" ? {} : { _id: { $in: context.user.societyIds } };
  const [items, total] = await Promise.all([
    Society.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Society.countDocuments(filter),
  ]);
  return paginatedResponse(items, total, page, limit);
}

export async function getSociety(data, context) {
  const { societyId } = data;
  if (!societyId) {
    throw new ValidationError("societyId is required");
  }
  const society = await Society.findById(societyId).lean();
  if (!society) {
    throw new NotFoundError("Society not found");
  }
  return society;
}

export async function updateSociety(data, context) {
  const { societyId, ...updates } = data;
  if (!societyId) {
    throw new ValidationError("societyId is required");
  }
  const society = await Society.findOneAndUpdate(
    { _id: societyId },
    updates,
    { new: true, runValidators: true }
  );
  if (!society) {
    throw new NotFoundError("Society not found");
  }
  return society;
}

export async function deleteSociety(data, context) {
  const { societyId } = data;
  if (!societyId) {
    throw new ValidationError("societyId is required");
  }
  const society = await Society.findByIdAndDelete(societyId);
  if (!society) {
    throw new NotFoundError("Society not found");
  }
  await User.updateMany(
    { societyIds: societyId },
    { $pull: { societyIds: societyId } }
  );
  return { success: true };
}
