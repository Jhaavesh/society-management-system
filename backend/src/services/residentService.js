import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Flat from "../models/flat.js";
import { buildPagination, paginatedResponse } from "../utils/pagination.js";
import { NotFoundError, ValidationError, ConflictError } from "../errors/index.js";

export async function createResident(data, context) {
  const { name, email, password, phone, flatId } = data;
  if (!name || !email || !password || !flatId) {
    throw new ValidationError("name, email, password, and flatId are required");
  }
  const flat = await Flat.findOne({ _id: flatId, societyId: context.societyId });
  if (!flat) {
    throw new ValidationError("Flat does not belong to this society");
  }
  const emailLower = String(email).toLowerCase().trim();
  const existingUser = await User.findOne({ email: emailLower });
  if (existingUser) {
    throw new ConflictError("Email already registered");
  }
  const user = await User.create({
    name,
    email: emailLower,
    phone,
    flatId,
    role: "resident",
    societyIds: [context.societyId],
    passwordHash: await bcrypt.hash(password, 12),
  });
  await Flat.updateOne(
    { _id: flatId },
    { status: "occupied", $addToSet: { residentIds: user._id } }
  );
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, flatId: user.flatId };
}

export async function listResidents(data, context) {
  if (!context.societyId) {
    throw new ValidationError("societyId is required");
  }
  const { page, limit, skip } = buildPagination(data);
  const [items, total] = await Promise.all([
    User.find({ societyIds: context.societyId, role: "resident", active: true })
      .select("name email phone flatId createdAt")
      .populate("flatId", "flatNumber wing")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({ societyIds: context.societyId, role: "resident", active: true }),
  ]);
  return paginatedResponse(items, total, page, limit);
}

export async function getResident(data, context) {
  const { residentId } = data;
  if (!residentId) {
    throw new ValidationError("residentId is required");
  }
  const resident = await User.findOne({ _id: residentId, societyIds: context.societyId, role: "resident" })
    .select("name email phone flatId createdAt")
    .populate("flatId", "flatNumber wing")
    .lean();
  if (!resident) {
    throw new NotFoundError("Resident not found");
  }
  return resident;
}

export async function updateResident(data, context) {
  const { residentId, ...updates } = data;
  if (!residentId) {
    throw new ValidationError("residentId is required");
  }
  const allowedFields = ["name", "email", "phone", "active"];
  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }
  if (!Object.keys(filteredUpdates).length) {
    throw new ValidationError("At least one editable field is required");
  }
  const resident = await User.findOneAndUpdate(
    { _id: residentId, societyIds: context.societyId, role: "resident" },
    filteredUpdates,
    { new: true, runValidators: true }
  ).select("name email phone flatId createdAt").populate("flatId", "flatNumber wing");
  if (!resident) {
    throw new NotFoundError("Resident not found");
  }
  return resident;
}

export async function assignFlat(data, context) {
  const { residentId, flatId } = data;
  if (!residentId || !flatId) {
    throw new ValidationError("residentId and flatId are required");
  }
  const flat = await Flat.findOne({ _id: flatId, societyId: context.societyId });
  if (!flat) {
    throw new ValidationError("Flat does not belong to this society");
  }
  if (flat.status === "occupied") {
    throw new ValidationError("Flat is already occupied");
  }
  const resident = await User.findOne({ _id: residentId, societyIds: context.societyId, role: "resident" });
  if (!resident) {
    throw new NotFoundError("Resident not found");
  }
  if (resident.flatId) {
    await Flat.updateOne(
      { _id: resident.flatId },
      { status: "vacant", $pull: { residentIds: resident._id } }
    );
  }
  resident.flatId = flatId;
  resident.societyIds = [context.societyId];
  await resident.save();
  await Flat.updateOne(
    { _id: flatId },
    { status: "occupied", $addToSet: { residentIds: resident._id } }
  );
  return { id: resident._id, name: resident.name, email: resident.email, flatId: resident.flatId };
}

export async function removeResident(data, context) {
  const { residentId } = data;
  if (!residentId) {
    throw new ValidationError("residentId is required");
  }
  const resident = await User.findOne({ _id: residentId, societyIds: context.societyId, role: "resident" });
  if (!resident) {
    throw new NotFoundError("Resident not found");
  }
  if (resident.flatId) {
    await Flat.updateOne(
      { _id: resident.flatId },
      { status: "vacant", $pull: { residentIds: resident._id } }
    );
  }
  await User.deleteOne({ _id: residentId });
  return { success: true };
}
