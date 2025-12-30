import prisma from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error";
import { z } from "zod";
import { registerSchema, loginSchema } from "../utils/validation";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const registerUser = async (data: z.infer<typeof registerSchema>) => {
  const { email, password, name } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return { user: { id: user.id, email: user.email, name: user.name }, token };
};

export const loginUser = async (data: z.infer<typeof loginSchema>) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { profile: true } 
  });
  if (!user) {
    throw new AppError("Ups! Email atau password yang kamu masukkan salah.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Ups! Email atau password yang kamu masukkan salah.", 401);
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  // Return user with profile
  // Remove passwordHash before returning
  const { passwordHash: _, ...userData } = user;

  return { user: userData, token };
};

export const checkEmailAvailable = async (email: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  return { available: !existingUser };
};
