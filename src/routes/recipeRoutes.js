import express from "express";
import { requireAuth } from "../middleware/auth.js";
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
  requireAuth,
  validateCreateRecipe,           
  recipeController.createRecipe
);


router.put(
  "/:id",
  requireAuth,
  validateRecipeId,
  validateUpdateRecipe,          
  recipeController.updateRecipe
);


router.delete(
  "/:id",
  requireAuth,
  validateRecipeId,
  recipeController.deleteRecipe
);


router.put(
  "/:id/visibility",
  requireAuth,
  validateRecipeId,
  validateUpdateRecipeVisibility, 
  recipeController.setVisibility
);


router.post(
  "/:id/steps",
  requireAuth,
  validateRecipeId,
  validateCreateStepsForRecipe,  
  recipeController.replaceSteps
);


router.post(
  "/:id/ingredients",
  requireAuth,
  validateRecipeId,
  validateCreateIngredientsForRecipe, // validates body.ingredients[*]
  recipeController.replaceIngredients
);

export default router;

