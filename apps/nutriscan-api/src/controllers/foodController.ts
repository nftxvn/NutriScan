import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { catchAsync } from "../utils/error";
import { AppError } from "../utils/error";
import prisma from "../config/db";

// Get All Foods - Strict separation of Public vs Personal
export const getAllFoods = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { type, search } = req.query;
  const userId = req.user.id;

  const whereClause: any = {};

  if (type === 'personal') {
    // Personal Tab: Show ONLY my created private foods
    whereClause.createdBy = userId;
    whereClause.isPublic = false;
  } else {
    // All other tabs (Catalog): Show ONLY Public foods
    whereClause.isPublic = true;
    if (type && type !== 'all') {
      whereClause.type = type;
    }
  }

  if (search && typeof search === "string") {
    whereClause.name = { contains: search };
  }

  const foods = await prisma.foodItem.findMany({
    where: whereClause,
    orderBy: { name: "asc" },
  });

  res.status(200).json({
    status: "success",
    results: foods.length,
    data: foods,
  });
});

// Create Food - Logic to separate Public (Admin) vs Private (User)
export const createFood = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, calories, protein, carbs, fats, servingSize, brand, image, type } = req.body;

  // Determine visibility: Admin -> Public, User -> Private
  const isPublic = req.user.role === "admin";

  const newFood = await prisma.foodItem.create({
    data: {
      name,
      brand,
      servingSize: servingSize || "1 serving",
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fats: Number(fats || 0),
      image,
      type: type || "local",
      isPublic,
      createdBy: req.user.id
    },
  });

  res.status(201).json({
    status: "success",
    data: newFood,
  });
});

// Update Food
export const updateFood = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const food = await prisma.foodItem.findUnique({ where: { id } });

  if (!food) {
    return next(new AppError("Food not found", 404));
  }

  // Check permission: Admin OR Owner
  if (req.user.role !== "admin" && food.createdBy !== req.user.id) {
    return next(new AppError("You do not have permission to edit this food", 403));
  }

  const updatedFood = await prisma.foodItem.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json({
    status: "success",
    data: updatedFood,
  });
});

// Delete Food
export const deleteFood = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const food = await prisma.foodItem.findUnique({ where: { id } });

  if (!food) {
    return next(new AppError("Food not found", 404));
  }

  // Check permission: Admin OR Owner
  if (req.user.role !== "admin" && food.createdBy !== req.user.id) {
    return next(new AppError("You do not have permission to delete this food", 403));
  }

  await prisma.foodItem.delete({ where: { id } });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
