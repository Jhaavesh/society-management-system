import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
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
