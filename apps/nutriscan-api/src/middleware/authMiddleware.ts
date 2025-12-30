import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error";
import prisma from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    console.log("[Auth] Authorization header:", req.headers.authorization ? "Present" : "Missing");
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("[Auth] Token extracted:", !!token);
    }

    if (!token) {
      return res.status(401).json({ status: "fail", message: "Not authorized to access this route" });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};
