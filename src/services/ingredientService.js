import ingredientRepository from "../repositories/ingredientRepository.js";

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function searchIngredientsService({ q }) {
  const query = (q || "").toString().trim();
  return ingredientRepository.searchByName(query, 50);
}

export async function getIngredientByIdService({ id }) {
  const ingredientId = Number(id);
  if (!Number.isInteger(ingredientId) || ingredientId < 1) {
    throw httpError(400, "Invalid ingredient id");
  }

  const ing = await ingredientRepository.findById(ingredientId);
  if (!ing) throw httpError(404, "Not found");
  return ing;
}

export async function createIngredientService({ name, unit }) {
  if (!name) throw httpError(400, "name is required");

  const normalizedName = String(name).trim().toLowerCase();
  const normalizedUnit = unit ? String(unit).trim().toLowerCase() : null;

  try {
    const created = await ingredientRepository.create({
      name: normalizedName,
      unit: normalizedUnit,
    });
    return created;
  } catch (e) {
    if (e.code === "P2002") {
      throw httpError(409, "Ingredient already exists");
    }
    throw e;
  }
}

export async function updateIngredientService({ id, name, unit }) {
  const ingredientId = Number(id);
  if (!Number.isInteger(ingredientId) || ingredientId < 1) {
    throw httpError(400, "Invalid ingredient id");
  }

  if (!name) throw httpError(400, "name is required");

  const normalizedName = String(name).trim().toLowerCase();
  const normalizedUnit = unit ? String(unit).trim().toLowerCase() : null;

  try {
    const updated = await ingredientRepository.update(ingredientId, {
      name: normalizedName,
      unit: normalizedUnit,
    });
    return updated;
  } catch (e) {
    if (e.code === "P2025") throw httpError(404, "Not found");
    if (e.code === "P2002") throw httpError(409, "Duplicate name");
    throw e;
  }
}

export async function deleteIngredientService({ id }) {
  const ingredientId = Number(id);
  if (!Number.isInteger(ingredientId) || ingredientId < 1) {
    throw httpError(400, "Invalid ingredient id");
  }

  try {
    await ingredientRepository.deleteById(ingredientId);
  } catch (e) {
    if (e.code === "P2025") throw httpError(404, "Not found");
    throw e;
  }
}

export async function resolveIngredientForRecipeService({ name, unit }) {
  const normalizedName = String(name).trim().toLowerCase();
  const normalizedUnit = unit ? String(unit).trim().toLowerCase() : null;

  const ing = await ingredientRepository.upsertByName({
    name: normalizedName,
    unit: normalizedUnit,
  });

  return ing; 
}

const ingredientService = {
  searchIngredientsService,
  getIngredientByIdService,
  createIngredientService,
  updateIngredientService,
  deleteIngredientService,
  resolveIngredientForRecipeService,
};

export default ingredientService;