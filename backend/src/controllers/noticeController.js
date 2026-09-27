import { createNotice, listNotices, getNotice, updateNotice, deleteNotice } from "../services/noticeService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listNoticesController = async (req, res, next) => {
  try {
    const data = await listNotices({}, ctx(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createNoticeController = async (req, res, next) => {
  try {
    const data = await createNotice(req.body, ctx(req));
    res.status(201).json({ success: true, ...data.toObject ? data.toObject() : data, message: "Notice created successfully" });
  } catch (error) {
    next(error);
  }
};

export const getNoticeController = async (req, res, next) => {
  try {
    const data = await getNotice({ noticeId: req.params.id }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data });
  } catch (error) {
    next(error);
  }
};

export const updateNoticeController = async (req, res, next) => {
  try {
    const data = await updateNotice({ noticeId: req.params.id, ...req.body }, ctx(req));
    res.json({ success: true, ...data.toObject ? data.toObject() : data, message: "Notice updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteNoticeController = async (req, res, next) => {
  try {
    const data = await deleteNotice({ noticeId: req.params.id }, ctx(req));
    res.json({ success: true, ...data, message: "Notice deleted successfully" });
  } catch (error) {
    next(error);
  }
};
