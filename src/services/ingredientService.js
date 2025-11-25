import ingredientRepository from "../repositories/ingredientRepository.js";

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function parseIngredientId(ingredientId) {
  const id = Number(ingredientId);
  if (!Number.isInteger(id) || id < 1) {
    throw httpError(400, "Invalid ingredient id");
  }
  return id;
}

// GET /ingredients?q=
export async function searchIngredientsService({ q }) {
  const items = await ingredientRepository.searchByName(q);
  return items;
}

// GET /ingredients/:id
export async function getIngredientByIdService({ ingredientId }) {
  const id = parseIngredientId(ingredientId);
  const ing = await ingredientRepository.findById(id);

  if (!ing) {
    throw httpError(404, "Not found");
  }

  return ing;
}

// POST /ingredients
export async function createIngredientService({ name, unit }) {
  if (!name || typeof name !== "string") {
    throw httpError(400, "Name is required");
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 3 || trimmedName.length > 100) {
    throw httpError(400, "Name must be between 3 and 100 characters");
  }

  const trimmedUnit =
    unit === undefined || unit === null ? null : String(unit).trim();

  const created = await ingredientRepository.create({
    name: trimmedName,
    unit: trimmedUnit,
  });

  return created;
}

// PUT /ingredients/:id
export async function updateIngredientService({ ingredientId, name, unit }) {
  const id = parseIngredientId(ingredientId);

  const existing = await ingredientRepository.findById(id);
  if (!existing) {
    throw httpError(404, "Not found");
  }

  const data = {};

  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (trimmedName.length < 3 || trimmedName.length > 100) {
      throw httpError(400, "Name must be between 3 and 100 characters");
    }
    data.name = trimmedName;
  }

  if (unit !== undefined) {
    data.unit =
      unit === null || unit === ""
        ? null
        : String(unit).trim();
  }

  const updated = await ingredientRepository.update(id, data);

  return updated;
}

// DELETE /ingredients/:id
export async function deleteIngredientService({ ingredientId }) {
  const id = parseIngredientId(ingredientId);

  const existing = await ingredientRepository.findById(id);
  if (!existing) {
    throw httpError(404, "Not found");
  }

  await ingredientRepository.deleteById(id);
}

// Used by recipeService when creating / replacing recipe ingredients
export async function resolveIngredientForRecipeService({
  ingredientId,
  name,
  unit,
}) {
  // Case 1: use existing ingredient by numeric id
  if (ingredientId !== undefined && ingredientId !== null && ingredientId !== "") {
    const id = parseIngredientId(ingredientId);
    const ing = await ingredientRepository.findById(id);
    if (!ing) {
      throw httpError(404, "Ingredient not found");
    }
    return ing;
  }

  // Case 2: create / upsert by name + unit
  if (!name) {
    throw httpError(400, "Ingredient name is required");
  }

  const trimmedName = String(name).trim();
  const trimmedUnit =
    unit === undefined || unit === null ? null : String(unit).trim();

  const ing = await ingredientRepository.upsertByName({
    name: trimmedName,
    unit: trimmedUnit,
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
