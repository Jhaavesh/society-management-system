import { z } from "zod";
import { ValidationError } from "../errors/index.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const createSocietySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").trim(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  }),
});

export const updateSocietySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").trim().optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    active: z.boolean().optional(),
  }),
});

export const societyIdParamSchema = z.object({
  params: z.object({
    societyId: objectId,
  }),
});

export const createBuildingSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").trim(),
    floors: z.number().int().min(1).default(1).optional(),
  }),
});

export const updateBuildingSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").trim().optional(),
    floors: z.number().int().min(1).optional(),
    active: z.boolean().optional(),
  }),
});

export const buildingIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const createFlatSchema = z.object({
  body: z.object({
    buildingId: objectId,
    flatNumber: z.string().min(1, "Flat number is required").trim(),
    floor: z.number().int().min(0).optional(),
    wing: z.string().trim().optional(),
    status: z.enum(["vacant", "occupied"]).default("vacant").optional(),
  }),
});

export const updateFlatSchema = z.object({
  body: z.object({
    buildingId: objectId.optional(),
    flatNumber: z.string().min(1, "Flat number is required").trim().optional(),
    floor: z.number().int().min(0).optional(),
    wing: z.string().trim().optional(),
    status: z.enum(["vacant", "occupied"]).optional(),
  }),
});

export const flatIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const flatQuerySchema = z.object({
  query: z.object({
    buildingId: objectId.optional(),
  }),
});

export const createResidentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").trim(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().trim().optional(),
    flatId: objectId,
  }),
});

export const residentQuerySchema = z.object({
  query: z.object({}),
});

export const createBillSchema = z.object({
  body: z.object({
    flatId: objectId,
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    amount: z.number().min(0, "Amount must be non-negative"),
    dueDate: z.coerce.date(),
  }),
});

export const updateBillSchema = z.object({
  body: z.object({
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    amount: z.number().min(0, "Amount must be non-negative").optional(),
    dueDate: z.coerce.date().optional(),
    status: z.enum(["pending", "paid", "overdue"]).optional(),
  }),
});

export const billIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const billQuerySchema = z.object({
  query: z.object({
    flatId: objectId.optional(),
    status: z.enum(["pending", "paid", "overdue"]).optional(),
  }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    billId: objectId,
    flatId: objectId,
    amountPaid: z.number().min(0.01, "Amount paid must be greater than zero"),
    method: z.enum(["cash", "cheque", "online"]).default("cash").optional(),
    transactionRef: z.string().trim().optional(),
  }),
});

export const paymentQuerySchema = z.object({
  query: z.object({
    billId: objectId.optional(),
  }),
});

export const createComplaintSchema = z.object({
  body: z.object({
    flatId: objectId.optional(),
    category: z.string().min(1, "Category is required").trim(),
    description: z.string().min(1, "Description is required").trim(),
    priority: z.enum(["low", "normal", "high"]).default("normal").optional(),
  }),
});

export const updateComplaintSchema = z.object({
  body: z.object({
    category: z.string().min(1, "Category is required").trim().optional(),
    description: z.string().min(1, "Description is required").trim().optional(),
    priority: z.enum(["low", "normal", "high"]).optional(),
    status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).optional(),
    assignedTo: objectId.optional(),
  }),
});

export const complaintIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const complaintQuerySchema = z.object({
  query: z.object({
    status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).optional(),
  }),
});

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").trim(),
    content: z.string().min(1, "Content is required").trim(),
    validTill: z.coerce.date().optional(),
  }),
});

export const noticeQuerySchema = z.object({
  query: z.object({}),
});

export const createVisitorSchema = z.object({
  body: z.object({
    flatId: objectId.optional(),
    visitorName: z.string().min(1, "Visitor name is required").trim(),
    visitorMobile: z.string().trim().optional(),
    purpose: z.string().trim().optional(),
    visitDate: z.coerce.date(),
  }),
});

export const updateVisitorSchema = z.object({
  body: z.object({
    visitorName: z.string().min(1, "Visitor name is required").trim().optional(),
    visitorMobile: z.string().trim().optional(),
    purpose: z.string().trim().optional(),
    visitDate: z.coerce.date().optional(),
    status: z.enum(["pending", "approved", "rejected", "checked_in", "checked_out"]).optional(),
  }),
});

export const visitorIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const visitorQuerySchema = z.object({
  query: z.object({
    status: z.enum(["pending", "approved", "rejected", "checked_in", "checked_out"]).optional(),
  }),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return next(new ValidationError("Validation failed", errors));
  }

  req.body = result.data.body ?? req.body;
  req.query = result.data.query ?? req.query;
  req.params = result.data.params ?? req.params;

  next();
};
