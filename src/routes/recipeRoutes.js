import express from "express";
import { requireAuth } from "../middleware/auth.js";
import recipeController from "../controllers/recipeController.js";

const router = express.Router();

router.get("/", recipeController.listRecipes);
router.get("/:id", recipeController.getRecipe);

router.post("/", requireAuth, recipeController.createRecipe);
router.put("/:id", requireAuth, recipeController.updateRecipe);
router.delete("/:id", requireAuth, recipeController.deleteRecipe);

router.put("/:id/visibility", requireAuth, recipeController.setVisibility);
router.post("/:id/steps", requireAuth, recipeController.replaceSteps);
router.post("/:id/ingredients", requireAuth, recipeController.replaceIngredients);

export default router;

