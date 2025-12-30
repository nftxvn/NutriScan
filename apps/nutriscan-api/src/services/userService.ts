import prisma from "../config/db";
import { z } from "zod";
import { profileSchema } from "../utils/validation";
import { AppError } from "../utils/error";

const calculateTargets = (
  gender: string,
  weight: number,
  height: number,
  age: number,
  goal: string
) => {
  // BMR (Mifflin-St Jeor)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === "male" ? 5 : -161;

  // TDEE (Assuming sedentary/light active 1.2 for simplicity if not provided)
  // Ideally we ask for activity level. Defaulting to 1.2
  const tdee = bmr * 1.2;

  let targetCalories = Math.round(tdee);
  if (goal === "lose") targetCalories -= 500;
  if (goal === "gain") targetCalories += 500;

  // Macros (Simplified split)
  // Protein: 2g per kg (good for muscle) -> 4 cal/g
  // Fats: 0.8g per kg -> 9 cal/g
  // Carbs: Remainder -> 4 cal/g

  const protein = Math.round(weight * 2); 
  const fats = Math.round(weight * 1); // slightly higher fat for satiety
  
  const proteinCals = protein * 4;
  const fatCals = fats * 9;
  const remainingCals = targetCalories - proteinCals - fatCals;
  const carbs = Math.max(0, Math.round(remainingCals / 4));

  return { targetCalories, targetProtein: protein, targetFats: fats, targetCarbs: carbs };
};

export const createOrUpdateProfile = async (userId: string, data: z.infer<typeof profileSchema>) => {
  const { name, avatar, gender, dateOfBirth, height, weight, mainGoal } = data;

  // Update user name and avatar if provided
  if (name || avatar) {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        ...(name && { name }),
        ...(avatar && { avatar })
      },
    });
  }

  // If only updating avatar/name, don't touch profile metrics
  if (!gender && !dateOfBirth && !height && !weight && !mainGoal) {
    // Just return the existing profile (or null if doesn't exist)
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true, avatar: true, role: true } } },
    });
    return existingProfile;
  }

  // For full profile update, we need all required fields
  if (!gender || !dateOfBirth || !height || !weight || !mainGoal) {
    // Try to get existing profile values for partial updates
    const existing = await prisma.userProfile.findUnique({ where: { userId } });
    if (!existing) {
      throw new AppError("Full profile data required for new profile creation", 400);
    }
    // Merge with existing data
    const mergedData = {
      gender: gender || existing.gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existing.dateOfBirth,
      height: height ?? existing.height,
      weight: weight ?? existing.weight,
      mainGoal: mainGoal || existing.mainGoal,
    };
    
    const dobDate = mergedData.dateOfBirth;
    const ageDifMs = Date.now() - dobDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    const targets = calculateTargets(mergedData.gender, mergedData.weight, mergedData.height, age, mergedData.mainGoal);

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        ...mergedData,
        ...targets,
      },
    });
    return profile;
  }

  const dobDate = new Date(dateOfBirth);
  const ageDifMs = Date.now() - dobDate.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  const targets = calculateTargets(gender, weight, height, age, mainGoal);

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      gender,
      dateOfBirth: dobDate,
      height,
      weight,
      mainGoal,
      ...targets,
    },
    create: {
      userId,
      gender,
      dateOfBirth: dobDate,
      height,
      weight,
      mainGoal,
      ...targets,
    },
  });

  return profile;
};

export const getUserProfile = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, avatar: true, role: true } } },
  });
  if (!profile) {
    throw new AppError("Profile not found", 404);
  }
  return profile;
};

export const deleteUser = async (userId: string) => {
  // Delete user will cascade delete profile due to foreign key constraints usually,
  // but explicitly deleting ensures clarity or if we want soft delete later.
  // For now, hard delete user.
  return await prisma.user.delete({
    where: { id: userId },
  });
};


