import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/error";
import { loginUser, registerUser, checkEmailAvailable } from "../services/authService";
import { loginSchema, registerSchema } from "../utils/validation";

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ status: "fail", errors: validation.error.issues });
  }

  const result = await registerUser(validation.data);
  res.status(201).json({ status: "success", data: result });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ status: "fail", errors: validation.error.issues });
  }

  const result = await loginUser(validation.data);
  res.status(200).json({ status: "success", data: result });
});

export const checkEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: "fail", message: "Email is required" });
  }

  const result = await checkEmailAvailable(email);
  res.status(200).json({ status: "success", data: result });
});
