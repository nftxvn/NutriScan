import prisma from "../config/db";

export const getAnalyticsSummary = async (userId: string, days: number = 7) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Get daily logs for the period
  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { food: true },
  });

  // Get daily metrics for the period
  const metrics = await prisma.dailyMetric.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });

  // Get user profile for targets
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  // Calculate daily totals grouped by date
  const dailyTotals: Record<string, { calories: number; protein: number; carbs: number; fats: number }> = {};
  
  logs.forEach((log) => {
    const dateKey = log.date.toISOString().split("T")[0];
    if (!dailyTotals[dateKey]) {
      dailyTotals[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
    dailyTotals[dateKey].calories += Math.round(log.food.calories * log.quantity);
    dailyTotals[dateKey].protein += Math.round(log.food.protein * log.quantity);
    dailyTotals[dateKey].carbs += Math.round(log.food.carbs * log.quantity);
    dailyTotals[dateKey].fats += Math.round(log.food.fats * log.quantity);
  });

  // Calculate averages
  const daysWithData = Object.keys(dailyTotals).length || 1;
  const totalCalories = Object.values(dailyTotals).reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = Object.values(dailyTotals).reduce((sum, d) => sum + d.protein, 0);
  const totalCarbs = Object.values(dailyTotals).reduce((sum, d) => sum + d.carbs, 0);
  const totalFats = Object.values(dailyTotals).reduce((sum, d) => sum + d.fats, 0);

  // Calculate water and sleep averages
  const avgWater = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.waterIntake, 0) / metrics.length 
    : 0;
  const avgSleep = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.sleepMinutes, 0) / metrics.length 
    : 0;

  // Get weight history
  const weightHistory = metrics
    .filter((m) => m.weightRecorded !== null)
    .map((m) => ({ date: m.date, weight: m.weightRecorded }));

  // Current weight from profile or last recorded
  const currentWeight = weightHistory.length > 0 
    ? weightHistory[weightHistory.length - 1].weight 
    : profile?.weight || null;

  // Build chart data (last 7 days calorie percentages)
  const chartData: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayData = dailyTotals[key];
    if (dayData && profile?.targetCalories) {
      chartData.push(Math.min(100, Math.round((dayData.calories / profile.targetCalories) * 100)));
    } else {
      chartData.push(0);
    }
  }

  return {
    period: days,
    averages: {
      calories: Math.round(totalCalories / daysWithData),
      protein: Math.round(totalProtein / daysWithData),
      carbs: Math.round(totalCarbs / daysWithData),
      fats: Math.round(totalFats / daysWithData),
      water: parseFloat(avgWater.toFixed(1)),
      sleepMinutes: Math.round(avgSleep),
    },
    targets: profile ? {
      calories: profile.targetCalories,
      protein: profile.targetProtein,
      carbs: profile.targetCarbs,
      fats: profile.targetFats,
    } : null,
    macroPercentages: profile ? {
      protein: Math.min(100, Math.round((totalProtein / daysWithData / profile.targetProtein) * 100)),
      carbs: Math.min(100, Math.round((totalCarbs / daysWithData / profile.targetCarbs) * 100)),
      fats: Math.min(100, Math.round((totalFats / daysWithData / profile.targetFats) * 100)),
    } : { protein: 0, carbs: 0, fats: 0 },
    weight: {
      current: currentWeight,
      goal: profile?.mainGoal === "lose" ? (profile.weight - 5) : profile?.mainGoal === "gain" ? (profile.weight + 5) : profile?.weight,
      history: weightHistory,
    },
    chartData,
  };
};
