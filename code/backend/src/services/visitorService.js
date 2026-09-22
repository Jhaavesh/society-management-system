import Visitor from "../models/visitor.js";
import Flat from "../models/flat.js";
import { pickAllowedFields } from "../utils/fields.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

export async function createVisitor(data, context) {
  const { visitorName, visitorMobile, purpose, visitDate, flatId } = data;
  const targetFlatId = context.user.role === "resident" ? context.user.flatId : flatId;
  if (context.user.role === "resident" && !context.user.flatId) {
    throw new ValidationError("Resident is not assigned to a flat");
  }
  if (!targetFlatId || !visitorName || !visitDate) {
    throw new ValidationError("flatId, visitorName, and visitDate are required");
  }
  if (!await Flat.exists({ _id: targetFlatId, societyId: context.societyId })) {
    throw new ValidationError("Flat does not belong to this society");
  }
  return Visitor.create({
    flatId: targetFlatId,
    visitorName,
    visitorMobile,
    purpose,
    visitDate,
    societyId: context.societyId,
  });
}

export async function listVisitors(data, context) {
  if (!context.societyId) {
    throw new ValidationError("societyId is required");
  }
  const filter = { societyId: context.societyId };
  if (context.user.role === "resident") {
    if (!context.user.flatId) {
      throw new ValidationError("Resident is not assigned to a flat");
    }
    filter.flatId = context.user.flatId;
  } else if (data.status) {
    filter.status = data.status;
  }
  return Visitor.find(filter)
    .populate("flatId", "flatNumber wing")
    .sort({ visitDate: -1 })
    .lean();
}

export async function getVisitor(data, context) {
  const { visitorId } = data;
  if (!visitorId) {
    throw new ValidationError("visitorId is required");
  }
  const visitor = await Visitor.findOne({ _id: visitorId, societyId: context.societyId })
    .populate("flatId", "flatNumber wing")
    .populate("approvedBy", "name")
    .lean();
  if (!visitor) {
    throw new NotFoundError("Visitor entry not found");
  }
  return visitor;
}

export async function updateVisitor(data, context) {
  const { visitorId, ...updates } = data;
  if (!visitorId) {
    throw new ValidationError("visitorId is required");
  }
  const { values, unknown } = pickAllowedFields(updates, ["visitorName", "visitorMobile", "purpose", "visitDate", "status"]);
  if (unknown.length) {
    throw new ValidationError(`Unsupported visitor fields: ${unknown.join(", ")}`);
  }
  if (!Object.keys(values).length) {
    throw new ValidationError("At least one editable visitor field is required");
  }
  const visitor = await Visitor.findOneAndUpdate(
    { _id: visitorId, societyId: context.societyId },
    { ...values, approvedBy: context.user.sub },
    { new: true, runValidators: true }
  );
  if (!visitor) {
    throw new NotFoundError("Visitor entry not found");
  }
  return visitor;
}

export async function deleteVisitor(data, context) {
  const { visitorId } = data;
  if (!visitorId) {
    throw new ValidationError("visitorId is required");
  }
  const visitor = await Visitor.findOneAndDelete({ _id: visitorId, societyId: context.societyId });
  if (!visitor) {
    throw new NotFoundError("Visitor entry not found");
  }
  return { success: true };
}
