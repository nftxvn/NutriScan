import prisma from "../config/db";

export const searchFoods = async (query: string) => {
  return await prisma.foodItem.findMany({
    where: {
      name: {
        contains: query,
        // mode: 'insensitive' // MySQL default is usually case-insensitive depending on collation, Prisma/MySQL doesn't support 'mode' like Postgres
      },
    },
    take: 20,
  });
};

export const createFood = async (data: any) => {
  return await prisma.foodItem.create({
    data,
  });
};

export const getFoodById = async (id: string) => {
  return await prisma.foodItem.findUnique({ where: { id } });
};
