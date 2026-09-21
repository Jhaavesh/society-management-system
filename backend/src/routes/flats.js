import { Router } from "express";
import Flat from "../models/flat.js";
import Building from "../models/building.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.query.buildingId) filter.buildingId = req.query.buildingId;
    res.json(await Flat.find(filter).populate("buildingId", "name").sort({ flatNumber: 1 }).lean());
  } catch (error) { next(error); }
});
router.post("/", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const building = await Building.exists({ _id: req.body.buildingId, societyId: req.societyId, active: true });
    if (!building) return res.status(400).json({ message: "Building does not belong to this society" });
    res.status(201).json(await Flat.create({ ...req.body, societyId: req.societyId }));
  } catch (error) { next(error); }
});
router.patch("/:id", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const flat = await Flat.findOneAndUpdate({ _id: req.params.id, societyId: req.societyId }, req.body, { new: true, runValidators: true });
    if (!flat) return res.status(404).json({ message: "Flat not found" });
    res.json(flat);
  } catch (error) { next(error); }
});

export default router;
