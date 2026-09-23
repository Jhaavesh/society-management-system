import Complaint from "../models/complaint.js";
import Flat from "../models/flat.js";
import { pickAllowedFields } from "../utils/fields.js";
import { buildPagination, paginatedResponse } from "../utils/pagination.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

export async function createComplaint(data, context) {
  const { category, description, priority, flatId } = data;
  const targetFlatId = context.user.role === "resident" ? context.user.flatId : flatId;
  if (context.user.role === "resident" && !context.user.flatId) {
    throw new ValidationError("Resident is not assigned to a flat");
  }
  if (!targetFlatId || !category || !description) {
    throw new ValidationError("flatId, category, and description are required");
  }
  if (!await Flat.exists({ _id: targetFlatId, societyId: context.societyId })) {
    throw new ValidationError("Flat does not belong to this society");
  }
  return Complaint.create({
    flatId: targetFlatId,
    category,
    description,
    priority,
    societyId: context.societyId,
    userId: context.user.sub,
  });
}

export async function listComplaints(data, context) {
  if (!context.societyId) {
    throw new ValidationError("societyId is required");
  }
  const { page, limit, skip } = buildPagination(data);
  const filter = { societyId: context.societyId };
  if (context.user.role === "resident") {
    filter.userId = context.user.sub;
  }
  if (data.status) filter.status = data.status;
  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .populate("flatId", "flatNumber wing")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Complaint.countDocuments(filter),
  ]);
  return paginatedResponse(items, total, page, limit);
}

export async function getComplaint(data, context) {
  const { complaintId } = data;
  if (!complaintId) {
    throw new ValidationError("complaintId is required");
  }
  const complaint = await Complaint.findOne({ _id: complaintId, societyId: context.societyId })
    .populate("flatId", "flatNumber wing")
    .populate("userId", "name email")
    .populate("assignedTo", "name email")
    .lean();
  if (!complaint) {
    throw new NotFoundError("Complaint not found");
  }
  return complaint;
}

export async function updateComplaint(data, context) {
  const { complaintId, ...updates } = data;
  if (!complaintId) {
    throw new ValidationError("complaintId is required");
  }
  const { values, unknown } = pickAllowedFields(updates, ["category", "description", "priority", "status", "assignedTo"]);
  if (unknown.length) {
    throw new ValidationError(`Unsupported complaint fields: ${unknown.join(", ")}`);
  }
  if (!Object.keys(values).length) {
    throw new ValidationError("At least one editable complaint field is required");
  }
  const complaint = await Complaint.findOneAndUpdate(
    { _id: complaintId, societyId: context.societyId },
    values,
    { new: true, runValidators: true }
  );
  if (!complaint) {
    throw new NotFoundError("Complaint not found");
  }
  return complaint;
}

export async function deleteComplaint(data, context) {
  const { complaintId } = data;
  if (!complaintId) {
    throw new ValidationError("complaintId is required");
  }
  const complaint = await Complaint.findOneAndDelete({ _id: complaintId, societyId: context.societyId });
  if (!complaint) {
    throw new NotFoundError("Complaint not found");
  }
  return { success: true };
}
