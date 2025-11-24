import ingredientService from "../services/ingredientService.js";


export async function searchIngredients(req, res) {
  try {
    const items = await ingredientService.searchIngredientsService({
      q: req.query.q,
    });
    return res.json(items);
  } catch (err) {
    console.error("Error searching ingredients:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

export async function getIngredient(req, res) {
  try {
    const ing = await ingredientService.getIngredientByIdService({
      ingredientId: req.params.id,   
    });
    return res.json(ing);
  } catch (err) {
    console.error("Error getting ingredient:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}


export async function createIngredient(req, res) {
  try {
    const created = await ingredientService.createIngredientService({
      name: req.body?.name,
      unit: req.body?.unit,  
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error("Error creating ingredient:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

export async function updateIngredient(req, res) {
  try {
    const updated = await ingredientService.updateIngredientService({
      ingredientId: req.params.id,   
      name: req.body?.name,
      unit: req.body?.unit,
    });
    return res.json(updated);
  } catch (err) {
    console.error("Error updating ingredient:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}


export async function deleteIngredient(req, res) {
  try {
    await ingredientService.deleteIngredientService({
      ingredientId: req.params.id,   
    });
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting ingredient:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

const ingredientController = {
  searchIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};

export default ingredientController;