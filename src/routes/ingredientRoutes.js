const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const ingredientController = require("../controllers/ingredientController");

router.get("/", ingredientController.searchIngredients);
router.get("/:id", ingredientController.getIngredient);
router.post("/", requireAuth, ingredientController.createIngredient);      // you can add role checks here if needed
router.put("/:id", requireAuth, requireRole("ADMIN"), ingredientController.updateIngredient);
router.delete("/:id", requireAuth, requireRole("ADMIN"), ingredientController.deleteIngredient);

module.exports = router;