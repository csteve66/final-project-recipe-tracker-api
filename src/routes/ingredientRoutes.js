const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const ingredientController = require("../controllers/ingredientController");

router.get("/", ingredientController.searchIngredients);


router.get("/:id", ingredientController.getIngredient);


router.post(
  "/",
  requireAuth,
  (req, res, next) => {
    if (req.user.role === "CREATOR" || req.user.role === "ADMIN") return next();
    return res.status(403).json({ error: "Forbidden" });
  },
  ingredientController.createIngredient
);


router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  ingredientController.updateIngredient
);


router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  ingredientController.deleteIngredient
);

module.exports = router;