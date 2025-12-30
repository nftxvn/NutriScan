import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { catchAsync } from "../utils/error";
import { createOrUpdateProfile, getUserProfile, deleteUser } from "../services/userService";
import { profileSchema } from "../utils/validation";

export const getProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const result = await getUserProfile(req.user.id);
  res.status(200).json({ status: "success", data: result });
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const validation = profileSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ status: "fail", errors: validation.error.issues });
  }

  const result = await createOrUpdateProfile(req.user.id, validation.data);
  res.status(200).json({ status: "success", data: result });
});

export const deleteAccount = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  await deleteUser(req.user.id);
  res.status(200).json({ status: "success", message: "Account deleted successfully" });
});


