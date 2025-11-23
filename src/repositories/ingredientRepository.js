import prisma from "../config/db.js";

export async function searchByName(q, limit = 50) {
  if (!q) {
    return prisma.ingredient.findMany({
      take: limit,
      orderBy: { name: "asc" },
    });
  }

  return prisma.ingredient.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function findById(ingredientId) {
  return prisma.ingredient.findUnique({
    where: { ingredient_id: ingredientId },
  });
}

export async function create({ name, unit = null }) {
  return prisma.ingredient.create({
    data: { name, unit },
  });
}

export async function update(ingredientId, { name, unit = null }) {
  return prisma.ingredient.update({
    where: { ingredient_id: ingredientId },
    data: {
      ...(name !== undefined && { name }),
      ...(unit !== undefined && { unit }),
    },
  });
}

export async function deleteById(ingredientId) {
  return prisma.ingredient.delete({
    where: { ingredient_id: ingredientId },
  });
}

export async function upsertByName({ name, unit = null }) {
  return prisma.ingredient.upsert({
    where: { name },
    update: {
      ...(unit !== null && { unit }),
    },
    create: { name, unit },
  });
}

const ingredientRepository = {
  searchByName,
  findById,
  create,
  update,
  deleteById,
  upsertByName,
};

export default ingredientRepository;