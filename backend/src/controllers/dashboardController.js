import { getDashboardKPIs } from "../services/dashboardService.js";

export const getDashboardController = async (req, res, next) => {
  try {
    const data = await getDashboardKPIs({ societyId: req.params.societyId }, { user: req.user });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
