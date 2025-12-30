import prisma from "../config/db";
import { AppError } from "../utils/error";

export const addDailyLog = async (userId: string, foodId: string, quantity: number, mealType: string) => {
  const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
  if (!food) throw new AppError("Food item not found", 404);

  const log = await prisma.dailyLog.create({
    data: {
      userId,
      foodId,
      quantity,
      mealType,
      date: new Date(),
    },
    include: { food: true },
  });

  return log;
};

export const getDailySummary = async (userId: string, dateStr?: string) => {
  // Parsing date string or using today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // If date provided
  if (dateStr) {
    const d = new Date(dateStr);
    startOfDay.setTime(d.setHours(0, 0, 0, 0));
    endOfDay.setTime(d.setHours(23, 59, 59, 999));
  }

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { food: true },
  });

  // Calculate totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  const logsWithMacros = logs.map((log) => {
    const cal = Math.round(log.food.calories * log.quantity);
    const p = Math.round(log.food.protein * log.quantity);
    const c = Math.round(log.food.carbs * log.quantity);
    const f = Math.round(log.food.fats * log.quantity);

    totalCalories += cal;
    totalProtein += p;
    totalCarbs += c;
    totalFats += f;

    return { ...log, macros: { calories: cal, protein: p, carbs: c, fats: f } };
  });

  return {
    date: startOfDay,
    totals: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    },
    logs: logsWithMacros,
  };
};

export const getRecentLogs = async (userId: string) => {
  return await prisma.dailyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 5,
    include: { food: true },
  });
};

export const deleteLog = async (userId: string, logId: string) => {
  const log = await prisma.dailyLog.findUnique({ where: { id: logId } });
  if (!log) throw new AppError("Log not found", 404);
  if (log.userId !== userId) throw new AppError("Unauthorized", 403);

  await prisma.dailyLog.delete({ where: { id: logId } });
  return { deleted: true };
};
