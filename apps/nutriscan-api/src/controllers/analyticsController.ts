import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { catchAsync } from "../utils/error";
import { getAnalyticsSummary } from "../services/analyticsService";

export const getSummary = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const days = parseInt(req.query.days as string) || 7;
  const result = await getAnalyticsSummary(req.user.id, days);
  res.status(200).json({ status: "success", data: result });
});
