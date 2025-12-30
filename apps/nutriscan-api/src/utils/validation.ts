import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  dateOfBirth: z.string().optional(), // ISO Date string
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  mainGoal: z.enum(["lose", "maintain", "gain"]).optional(),
});
