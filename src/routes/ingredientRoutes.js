import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import ingredientController from "../controllers/ingredientController.js";

const router = express.Router();

// Public: search ingredients
router.get("/", ingredientController.searchIngredients);

// Public: get ingredient by ID
router.get("/:id", ingredientController.getIngredient);

// Auth: CREATE (CREATOR or ADMIN)
router.post(
  "/",
  requireAuth,
  (req, res, next) => {
    if (req.user.role === "CREATOR" || req.user.role === "ADMIN") return next();
    return res.status(403).json({ error: "Forbidden" });
  },
  ingredientController.createIngredient
);

// Auth: UPDATE (ADMIN only)
router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  ingredientController.updateIngredient
);

// Auth: DELETE (ADMIN only)
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  ingredientController.deleteIngredient
);

// ESM export
export default router;
