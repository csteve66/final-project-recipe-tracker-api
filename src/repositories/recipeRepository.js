import prisma from "../config/db.js";

export async function countPublicRecipes(where) {
  return prisma.recipe.count({ where });
}

export async function findPublicRecipes(where, { skip, take }) {
  return prisma.recipe.findMany({
    where,
    select: {
      recipe_id: true,
      title: true,
      is_public: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { updated_at: "desc" },
    skip,
    take,
  });
}

export async function findRecipeWithRelations(recipeId) {
  return prisma.recipe.findUnique({
    where: { recipe_id: recipeId },
    include: {
      steps: {
        orderBy: { step_number: "asc" },
      },
      recipeIngredients: {
        include: { ingredient: true },
      },
      recipeTags: {
        include: { tag: true },
      },
    },
  });
}

export async function findRecipeOwner(recipeId) {
  return prisma.recipe.findUnique({
    where: { recipe_id: recipeId },
    select: { user_id: true },
  });
}

export async function createRecipe(data) {
  return prisma.recipe.create({
    data,
    select: {
      recipe_id: true,
      title: true,
      is_public: true,
    },
  });
}

export async function updateRecipe(recipeId, data) {
  return prisma.recipe.update({
    where: { recipe_id: recipeId },
    data,
    select: {
      recipe_id: true,
      title: true,
      is_public: true,
    },
  });
}

export async function deleteRecipe(recipeId) {
  return prisma.recipe.delete({
    where: { recipe_id: recipeId },
  });
}

export async function deleteStepsForRecipe(recipeId) {
  return prisma.step.deleteMany({
    where: { recipe_id: recipeId },
  });
}

export async function createStepsForRecipe(recipeId, stepsPayload) {
  return prisma.step.createMany({
    data: stepsPayload.map((s) => ({
      recipe_id: recipeId,
      step_number: s.step_number,
      instruction: s.instruction,
    })),
  });
}

export async function getStepsForRecipe(recipeId) {
  return prisma.step.findMany({
    where: { recipe_id: recipeId },
    orderBy: { step_number: "asc" },
  });
}


export async function replaceRecipeIngredients(recipeId, ingredientIds) {
  return prisma.$transaction([
    prisma.recipeIngredient.deleteMany({
      where: { recipe_id: recipeId },
    }),
    prisma.recipeIngredient.createMany({
      data: ingredientIds.map((ingredient_id) => ({
        recipe_id: recipeId,
        ingredient_id,
      })),
    }),
  ]);
}

export async function getRecipeIngredientsWithDetails(recipeId) {
  return prisma.recipe.findUnique({
    where: { recipe_id: recipeId },
    include: {
      recipeIngredients: {
        include: { ingredient: true },
      },
    },
  });
}

export async function upsertTagByName(name) {
  return prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

export async function replaceRecipeTags(recipeId, tagIds) {
  return prisma.$transaction([
    prisma.recipeTag.deleteMany({
      where: { recipe_id: recipeId },
    }),
    prisma.recipeTag.createMany({
      data: tagIds.map((tag_id) => ({
        recipe_id: recipeId,
        tag_id,
      })),
    }),
  ]);
}

const recipeRepository = {
  countPublicRecipes,
  findPublicRecipes,
  findRecipeWithRelations,
  findRecipeOwner,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  deleteStepsForRecipe,
  createStepsForRecipe,
  getStepsForRecipe,
  replaceRecipeIngredients,
  getRecipeIngredientsWithDetails,
  upsertTagByName,
  replaceRecipeTags,
};

export default recipeRepository;