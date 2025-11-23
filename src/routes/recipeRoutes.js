import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { authorizeOwnership } from '../middleware/authorizeOwnership.js';
import { getRecipeById } from '../services/recipeService.js';
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
  authorizeRoles('ADMIN', 'CREATOR'),
  validateCreateRecipe,    
  recipeController.createRecipe
);


router.put(
  "/:id",
  authenticate,
  authorizeOwnership(getRecipeById),
  validateRecipeId,
  validateUpdateRecipe,          
  recipeController.updateRecipe
);


router.delete(
  "/:id",
  authenticate,
  authorizeOwnership(getRecipeById),
  validateRecipeId,
  recipeController.deleteRecipe
);


router.put(
  "/:id/visibility",
  authenticate,
  authorizeOwnership(getRecipeById),
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

