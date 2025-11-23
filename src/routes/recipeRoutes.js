
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import recipeController from "../controllers/recipeController.js";

import {
  validateRecipeId,
  validateCreateRecipe,
  validateUpdateRecipe,
  validateUpdateRecipeVisibility,
  validateCreateIngredientsForRecipe,
  validateCreateStepsForRecipe,
} from "../middleware/recipeValidators.js";

const router = express.Router();


router.get("/", recipeController.listRecipes);


router.get(
  "/:id",
  validateRecipeId,
  recipeController.getRecipe
);


router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "CREATOR"),
  validateCreateRecipe,
  recipeController.createRecipe
);


router.put(
  "/:id",
  authenticate,
  validateRecipeId,
  validateUpdateRecipe,
  recipeController.updateRecipe
);


router.delete(
  "/:id",
  authenticate,
  validateRecipeId,
  recipeController.deleteRecipe
);

router.put(
  "/:id/visibility",
  authenticate,
  validateRecipeId,
  validateUpdateRecipeVisibility,
  recipeController.setVisibility
);


router.post(
  "/:id/steps",
  authenticate,
  validateRecipeId,
  validateCreateStepsForRecipe,
  recipeController.replaceSteps
);

router.post(
  "/:id/ingredients",
  authenticate,
  validateRecipeId,
  validateCreateIngredientsForRecipe,
  recipeController.replaceIngredients
);

export default router;


