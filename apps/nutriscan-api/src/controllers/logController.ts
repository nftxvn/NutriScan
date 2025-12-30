import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { catchAsync } from "../utils/error";
import { addDailyLog, getDailySummary, getRecentLogs, deleteLog } from "../services/logService";
import { z } from "zod";

const logSchema = z.object({
  foodId: z.string(),
  quantity: z.number().min(0.1),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
});

export const addLog = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const validation = logSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ status: "fail", errors: validation.error.issues });
  }

  const { foodId, quantity, mealType } = validation.data;
  const result = await addDailyLog(req.user.id, foodId, quantity, mealType);
  res.status(201).json({ status: "success", data: result });
});

export const getDaily = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const dateStr = req.query.date as string;
  const result = await getDailySummary(req.user.id, dateStr);
  res.status(200).json({ status: "success", data: result });
});

export const getRecent = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const result = await getRecentLogs(req.user.id);
  res.status(200).json({ status: "success", data: result });
});

export const removeLog = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { logId } = req.params;
  const result = await deleteLog(req.user.id, logId);
  res.status(200).json({ status: "success", data: result });
});
