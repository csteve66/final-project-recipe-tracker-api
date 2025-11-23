import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
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
  requireAuth,                           
  (req, res, next) => {                  
    if (req.user?.role === "CREATOR" || req.user?.role === "ADMIN") {
      return next();
    }
    return res.status(403).json({ error: "Forbidden" });
  },
  validateCreateIngredient,              
  ingredientController.createIngredient
);


router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateIngredientId,
  validateUpdateIngredient,
  ingredientController.updateIngredient
);


router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateIngredientId,
  ingredientController.deleteIngredient
);

export default router;