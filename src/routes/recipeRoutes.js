const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const recipeController = require("../controllers/recipeController");


router.get("/", recipeController.listRecipes);

router.get("/:id", recipeController.getRecipe);

router.post("/", requireAuth, recipeController.createRecipe);

router.put("/:id", requireAuth, recipeController.updateRecipe);

router.delete("/:id", requireAuth, recipeController.deleteRecipe);

router.put("/:id/visibility", requireAuth, recipeController.setVisibility);

router.post("/:id/steps", requireAuth, recipeController.replaceSteps);

router.post("/:id/ingredients", requireAuth, recipeController.replaceIngredients);

module.exports = router;
