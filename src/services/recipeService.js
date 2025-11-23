import recipeRepository from "../repositories/recipeRepository.js";
import ingredientService from "./ingredientService.js";

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function isAdmin(user) {
  return user && user.role === "ADMIN";
}

function isCreator(user) {
  return user && user.role === "CREATOR";
}

function canModifyRecipe(user, ownerUserId) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const uid = user.userid ?? user.id;
  return uid === ownerUserId;
}

export async function listRecipesService({ q, page = 1, pageSize = 20 }) {
  const p = Math.max(Number(page) || 1, 1);
  const ps = Math.max(Math.min(Number(pageSize) || 20, 100), 1);

  const where = { is_public: true };

  if (q) {
    where.title = {
      contains: q.toString(),
      mode: "insensitive",
    };
  }

  const [total, recipes] = await Promise.all([
    recipeRepository.countPublicRecipes(where),
    recipeRepository.findPublicRecipes(where, {
      skip: (p - 1) * ps,
      take: ps,
    }),
  ]);

  return {
    data: recipes.map((r) => ({
      id: r.recipe_id,
      title: r.title,
      isPublic: r.is_public,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    meta: {
      page: p,
      pageSize: ps,
      total,
      hasNext: p * ps < total,
    },
  };
}

export async function getRecipeService({ id, user }) {
  const recipeId = Number(id);
  if (!Number.isInteger(recipeId) || recipeId < 1) {
    throw httpError(400, "Invalid recipe id");
  }

  const recipe = await recipeRepository.findRecipeWithRelations(recipeId);
  if (!recipe) throw httpError(404, "Not found");

  const ownerUserId = recipe.user_id;
  if (!recipe.is_public && !canModifyRecipe(user, ownerUserId)) {
    // hide existence
    throw httpError(404, "Not found");
  }

  return {
    id: recipe.recipe_id,
    title: recipe.title,
    description: recipe.description,
    isPublic: recipe.is_public,
    ownerId: recipe.user_id,
    servings: recipe.servings,
    prepMinutes: recipe.prep_time,
    cookMinutes: recipe.cook_time,
    steps: recipe.steps.map((s) => ({
      order: s.step_number,
      text: s.instruction,
    })),
    ingredients: recipe.recipeIngredients.map((ri) => ({
      ingredientId: ri.ingredient.ingredient_id,
      name: ri.ingredient.name,
      unit: ri.ingredient.unit,
    })),
    tags: recipe.recipeTags.map((rt) => rt.tag.name),
  };
}

export async function createRecipeService({ user, body }) {
  if (!user) throw httpError(403, "Forbidden");
  if (!isAdmin(user) && !isCreator(user)) {
    throw httpError(403, "Forbidden");
  }

  const {
    title,
    description,
    isPublic = true,
    servings,
    prepMinutes,
    cookMinutes,
    steps = [],
    ingredients = [],
    tags = [],
  } = body || {};

  if (!title || typeof title !== "string") {
    throw httpError(400, "title is required");
  }

  const ownerId = user.userid ?? user.id;

  const stepCreates = steps.map((s, idx) => ({
    step_number: Number(s.order ?? idx + 1),
    instruction: String(s.text || ""),
  }));

  const ingredientIds = [];
  for (const i of ingredients) {
    if (!i.name) {
      throw httpError(400, "Each ingredient needs a name");
    }
    const ing = await ingredientService.resolveIngredientForRecipeService({
      name: i.name,
      unit: i.unit,
    });
    ingredientIds.push(ing.ingredient_id);
  }

  const tagIds = [];
  for (const t of tags) {
    const name = String(t).trim().toLowerCase();
    const tag = await recipeRepository.upsertTagByName(name);
    tagIds.push(tag.tag_id);
  }

  const created = await recipeRepository.createRecipe({
    user_id: ownerId,
    title,
    description,
    is_public: !!isPublic,
    servings: servings ?? null,
    prep_time: prepMinutes ?? null,
    cook_time: cookMinutes ?? null,
    steps: stepCreates.length ? { create: stepCreates } : undefined,
    recipeIngredients: ingredientIds.length
      ? {
          create: ingredientIds.map((ingredient_id) => ({
            ingredient_id,
          })),
        }
      : undefined,
    recipeTags: tagIds.length
      ? {
          create: tagIds.map((tag_id) => ({
            tag_id,
          })),
        }
      : undefined,
  });

  return {
    id: created.recipe_id,
    title: created.title,
    isPublic: created.is_public,
  };
}

export async function updateRecipeService({ id, user, body }) {
  const recipeId = Number(id);
  if (!Number.isInteger(recipeId) || recipeId < 1) {
    throw httpError(400, "Invalid recipe id");
  }

  const existing = await recipeRepository.findRecipeOwner(recipeId);
  if (!existing) throw httpError(404, "Not found");
  if (!canModifyRecipe(user, existing.user_id)) {
    throw httpError(403, "Forbidden");
  }

  const { title, description, isPublic, servings, prepMinutes, cookMinutes } =
    body || {};

  const data = {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(isPublic !== undefined && { is_public: !!isPublic }),
    ...(servings !== undefined && { servings }),
    ...(prepMinutes !== undefined && { prep_time: prepMinutes }),
    ...(cookMinutes !== undefined && { cook_time: cookMinutes }),
  };

  const updated = await recipeRepository.updateRecipe(recipeId, data);

  return {
    id: updated.recipe_id,
    title: updated.title,
    isPublic: updated.is_public,
  };
}

export async function deleteRecipeService({ id, user }) {
  const recipeId = Number(id);
  if (!Number.isInteger(recipeId) || recipeId < 1) {
    throw httpError(400, "Invalid recipe id");
  }

  const existing = await recipeRepository.findRecipeOwner(recipeId);
  if (!existing) throw httpError(404, "Not found");
  if (!canModifyRecipe(user, existing.user_id)) {
    throw httpError(403, "Forbidden");
  }

  await recipeRepository.deleteRecipe(recipeId);
}

export async function setVisibilityService({ id, user, isPublic }) {
  const recipeId = Number(id);
  if (!Number.isInteger(recipeId) || recipeId < 1) {
    throw httpError(400, "Invalid recipe id");
  }

  const existing = await recipeRepository.findRecipeOwner(recipeId);
  if (!existing) throw httpError(404, "Not found");
  if (!canModifyRecipe(user, existing.user_id)) {
    throw httpError(403, "Forbidden");
  }

  const updated = await recipeRepository.updateRecipe(recipeId, {
    is_public: !!isPublic,
  });

  return {
    id: updated.recipe_id,
    isPublic: updated.is_public,
  };
}

export async function replaceStepsService({ id, user, steps }) {
  const recipeId = Number(id);
  if (!Number.isInteger(recipeId) || recipeId < 1) {
    throw httpError(400, "Invalid recipe id");
  }

  const existing = await recipeRepository.findRecipeOwner(recipeId);
  if (!existing) throw httpError(404, "Not found");
  if (!canModifyRecipe(user, existing.user_id)) {
    throw httpError(403, "Forbidden");
  }

  const payload = (steps || []).map((s, idx) => ({
    step_number: Number(s.order ?? idx + 1),
    instruction: String(s.text || ""),
  }));

  await recipeRepository.deleteStepsForRecipe(recipeId);
  await recipeRepository.createStepsForRecipe(recipeId, payload);

  const updated = await recipeRepository.getStepsForRecipe(recipeId);

  return {
    steps: updated.map((s) => ({
      order: s.step_number,
      text: s.instruction,
    })),
  };
}

export async function replaceIngredientsService({ id, user, ingredients }) {
  const recipeId = Number(id);
  if (!Number.isInteger(recipeId) || recipeId < 1) {
    throw httpError(400, "Invalid recipe id");
  }

  const existing = await recipeRepository.findRecipeOwner(recipeId);
  if (!existing) throw httpError(404, "Not found");
  if (!canModifyRecipe(user, existing.user_id)) {
    throw httpError(403, "Forbidden");
  }

  const ingredientIds = [];
  for (const i of ingredients || []) {
    if (!i.name) {
      throw httpError(400, "Each ingredient must have a name");
    }
    const ing = await ingredientService.resolveIngredientForRecipeService({
      name: i.name,
      unit: i.unit,
    });
    ingredientIds.push(ing.ingredient_id);
  }

  await recipeRepository.replaceRecipeIngredients(recipeId, ingredientIds);

  const after = await recipeRepository.getRecipeIngredientsWithDetails(
    recipeId
  );

  return {
    ingredients: after.recipeIngredients.map((ri) => ({
      ingredientId: ri.ingredient.ingredient_id,
      name: ri.ingredient.name,
      unit: ri.ingredient.unit,
    })),
  };
}

const recipeService = {
  listRecipesService,
  getRecipeService,
  createRecipeService,
  updateRecipeService,
  deleteRecipeService,
  setVisibilityService,
  replaceStepsService,
  replaceIngredientsService,
};

export default recipeService;