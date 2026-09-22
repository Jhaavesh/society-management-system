import { validate, createNoticeSchema, noticeQuerySchema } from "../validators/index.js";
import { createNotice, listNotices } from "../services/noticeService.js";

const ctx = (req) => ({ user: req.user, societyId: req.societyId });

export const listNoticesController = [
  validate(noticeQuerySchema),
  async (req, res, next) => {
    try {
      const data = await listNotices({}, ctx(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
];

export const createNoticeController = [
  validate(createNoticeSchema),
  async (req, res, next) => {
    try {
      const data = await createNotice(req.body, ctx(req));
      res.status(201).json({ success: true, data, message: "Notice created successfully" });
    } catch (error) {
      next(error);
    }
  },
];
