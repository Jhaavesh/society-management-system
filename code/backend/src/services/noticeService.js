import Notice from "../models/notice.js";
import { buildPagination, paginatedResponse } from "../utils/pagination.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

export async function createNotice(data, context) {
  const { title, content, validTill } = data;
  if (!title || !content) {
    throw new ValidationError("title and content are required");
  }
  return Notice.create({
    title,
    content,
    validTill,
    societyId: context.societyId,
    publishedBy: context.user.sub,
  });
}

export async function listNotices(data, context) {
  if (!context.societyId) {
    throw new ValidationError("societyId is required");
  }
  const { page, limit, skip } = buildPagination(data);
  const [items, total] = await Promise.all([
    Notice.find({ societyId: context.societyId })
      .populate("publishedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notice.countDocuments({ societyId: context.societyId }),
  ]);
  return paginatedResponse(items, total, page, limit);
}

export async function getNotice(data, context) {
  const { noticeId } = data;
  if (!noticeId) {
    throw new ValidationError("noticeId is required");
  }
  const notice = await Notice.findOne({ _id: noticeId, societyId: context.societyId })
    .populate("publishedBy", "name")
    .lean();
  if (!notice) {
    throw new NotFoundError("Notice not found");
  }
  return notice;
}

export async function updateNotice(data, context) {
  const { noticeId, ...updates } = data;
  if (!noticeId) {
    throw new ValidationError("noticeId is required");
  }
  const notice = await Notice.findOneAndUpdate(
    { _id: noticeId, societyId: context.societyId },
    updates,
    { new: true, runValidators: true }
  );
  if (!notice) {
    throw new NotFoundError("Notice not found");
  }
  return notice;
}

export async function deleteNotice(data, context) {
  const { noticeId } = data;
  if (!noticeId) {
    throw new ValidationError("noticeId is required");
  }
  const notice = await Notice.findOneAndDelete({ _id: noticeId, societyId: context.societyId });
  if (!notice) {
    throw new NotFoundError("Notice not found");
  }
  return { success: true };
}
