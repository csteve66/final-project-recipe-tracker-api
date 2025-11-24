import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import ingredientController from "../controllers/ingredientController.js";

import {
  validateIngredientId,
  validateIngredientQuery,
  validateCreateIngredient,
  validateUpdateIngredient,
} from "../middleware/ingredientValidators.js"; 

const router = express.Router();


router.get(
  "/",
  validateIngredientQuery,               
  ingredientController.searchIngredients
);


router.get(
  "/:id",
  validateIngredientId,                  
  ingredientController.getIngredient
);


router.post(
  "/",
  authenticate,                           
  authorizeRoles('CREATOR', 'ADMIN'),
  validateCreateIngredient,              
  ingredientController.createIngredient
);


router.put(
  "/:id",
  authenticate,
  authorizeRoles('ADMIN'),
  validateIngredientId,
  validateUpdateIngredient,
  ingredientController.updateIngredient
);


router.delete(
  "/:id",
  authenticate,
  authorizeRoles('ADMIN'),
  validateIngredientId,
  ingredientController.deleteIngredient
);

export default router;