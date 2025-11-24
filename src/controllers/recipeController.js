import recipeService from "../services/recipeService.js";


export async function listRecipes(req, res) {
  try {
    const { q, page, pageSize } = req.query;
    const result = await recipeService.listRecipesService({
      q,
      page,
      pageSize,
    });
    return res.json(result);
  } catch (err) {
    console.error("Error listing recipes:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

export async function getRecipe(req, res) {
  try {
    const recipe = await recipeService.getRecipeService({
      id: req.params.id,
      user: req.user, 
    });
    return res.json(recipe);
  } catch (err) {
    console.error("Error getting recipe:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

export async function createRecipe(req, res) {
  try {
    const created = await recipeService.createRecipeService({
      user: req.user,
      body: req.body,
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error("Error creating recipe:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

export async function updateRecipe(req, res) {
  try {
    const updated = await recipeService.updateRecipeService({
      id: req.params.id,
      user: req.user,
      body: req.body,
    });
    return res.json(updated);
  } catch (err) {
    console.error("Error updating recipe:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

export async function deleteRecipe(req, res) {
  try {
    await recipeService.deleteRecipeService({
      id: req.params.id,
      user: req.user,
    });
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting recipe:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}


export async function setVisibility(req, res) {
  try {
    const updated = await recipeService.setVisibilityService({
      id: req.params.id,
      user: req.user,
      isPublic: req.body?.isPublic,
    });
    return res.json(updated);
  } catch (err) {
    console.error("Error setting recipe visibility:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

export async function replaceSteps(req, res) {
  try {
    const result = await recipeService.replaceStepsService({
      id: req.params.id,
      user: req.user,
      steps: req.body?.steps,
    });
    return res.json(result);
  } catch (err) {
    console.error("Error replacing recipe steps:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

export async function replaceIngredients(req, res) {
  try {
    const result = await recipeService.replaceIngredientsService({
      id: req.params.id,
      user: req.user,
      ingredients: req.body?.ingredients,
    });
    return res.json(result);
  } catch (err) {
    console.error("Error replacing recipe ingredients:", err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
}

const recipeController = {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  setVisibility,
  replaceSteps,
  replaceIngredients,
};

export default recipeController;