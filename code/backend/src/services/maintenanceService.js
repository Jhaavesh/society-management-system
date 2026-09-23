import MaintenanceBill from "../models/maintenancebill.js";
import Flat from "../models/flat.js";
import { pickAllowedFields } from "../utils/fields.js";
import { buildPagination, paginatedResponse } from "../utils/pagination.js";
import { NotFoundError, ValidationError, AuthorizationError } from "../errors/index.js";

export async function createBill(data, context) {
  const { flatId, month, year, amount, dueDate } = data;
  if (!flatId || !month || !year || amount === undefined || !dueDate) {
    throw new ValidationError("flatId, month, year, amount, and dueDate are required");
  }
  if (!await Flat.exists({ _id: flatId, societyId: context.societyId })) {
    throw new ValidationError("Flat does not belong to this society");
  }
  return MaintenanceBill.create({
    flatId,
    month,
    year,
    amount,
    dueDate,
    societyId: context.societyId,
    createdBy: context.user.sub,
  });
}

export async function listBills(data, context) {
  if (!context.societyId) {
    throw new ValidationError("societyId is required");
  }
  const { page, limit, skip } = buildPagination(data);
  const filter = { societyId: context.societyId };
  if (context.user.role === "resident") {
    if (!context.user.flatId) {
      throw new AuthorizationError("Resident is not assigned to a flat");
    }
    filter.flatId = context.user.flatId;
  } else if (data.flatId) {
    filter.flatId = data.flatId;
  }
  if (data.status) filter.status = data.status;
  const [items, total] = await Promise.all([
    MaintenanceBill.find(filter)
      .populate("flatId", "flatNumber wing")
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MaintenanceBill.countDocuments(filter),
  ]);
  return paginatedResponse(items, total, page, limit);
}

export async function getBill(data, context) {
  const { billId } = data;
  if (!billId) {
    throw new ValidationError("billId is required");
  }
  const bill = await MaintenanceBill.findOne({ _id: billId, societyId: context.societyId })
    .populate("flatId", "flatNumber wing")
    .lean();
  if (!bill) {
    throw new NotFoundError("Bill not found");
  }
  return bill;
}

export async function updateBill(data, context) {
  const { billId, ...updates } = data;
  if (!billId) {
    throw new ValidationError("billId is required");
  }
  const { values, unknown } = pickAllowedFields(updates, ["month", "year", "amount", "dueDate", "status"]);
  if (unknown.length) {
    throw new ValidationError(`Unsupported bill fields: ${unknown.join(", ")}`);
  }
  if (!Object.keys(values).length) {
    throw new ValidationError("At least one editable bill field is required");
  }
  const bill = await MaintenanceBill.findOneAndUpdate(
    { _id: billId, societyId: context.societyId },
    values,
    { new: true, runValidators: true }
  );
  if (!bill) {
    throw new NotFoundError("Bill not found");
  }
  return bill;
}

export async function deleteBill(data, context) {
  const { billId } = data;
  if (!billId) {
    throw new ValidationError("billId is required");
  }
  const bill = await MaintenanceBill.findOneAndDelete({ _id: billId, societyId: context.societyId });
  if (!bill) {
    throw new NotFoundError("Bill not found");
  }
  return { success: true };
}
