import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { catchAsync } from "../utils/error";
import prisma from "../config/db";

export const toggleRole = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  
  if (!user) {
    return res.status(404).json({ status: "fail", message: "User not found" });
  }

  const newRole = user.role === "admin" ? "user" : "admin";

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: newRole }
  });

  res.status(200).json({
    status: "success",
    message: `Role switched to ${newRole}`,
    data: {
      role: newRole
    }
  });
});
