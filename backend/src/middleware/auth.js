import jwt from "jsonwebtoken";
import User from "../models/user.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // SECURITY: Enforce minimum issued-at time for future token revocation support
    if (payload.iat && global.__minTokenIat && payload.iat < global.__minTokenIat) {
      return res.status(401).json({ message: "Token has been revoked" });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * SECURITY: Middleware to verify the user account is still active in the database.
 * This prevents deactivated users from continuing to use their existing JWT tokens.
 * Use this on sensitive operations (profile changes, financial actions, admin actions).
 */
export async function requireActiveUser(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.user.sub, active: true }).select("_id role societyIds flatId").lean();
    if (!user) {
      return res.status(403).json({ message: "Account is deactivated or not found" });
    }
    // Refresh critical fields from DB to prevent stale JWT claims
    req.user.role = user.role;
    req.user.societyIds = user.societyIds.map(String);
    req.user.flatId = user.flatId?.toString() || null;
    next();
  } catch {
    return res.status(500).json({ message: "Failed to verify user status" });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) return res.status(403).json({ message: "Insufficient permissions" });
    next();
  };
}

export function requireSocietyAccess(req, res, next) {
  const societyId = req.params.societyId || req.query.societyId || req.body.societyId;
  if (!societyId) return res.status(400).json({ message: "societyId is required" });
  if (req.user.role !== "platform_admin" && !req.user.societyIds?.map(String).includes(String(societyId))) {
    return res.status(403).json({ message: "You cannot access this society" });
  }
  req.societyId = societyId;
  next();
}
