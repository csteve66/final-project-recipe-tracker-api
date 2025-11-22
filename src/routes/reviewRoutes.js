import express from 'express';
import {
  listReviewsForRecipe,
  createReviewForRecipe,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/recipes/:recipeId/reviews', listReviewsForRecipe);
router.post('/recipes/:recipeId/reviews', requireAuth, createReviewForRecipe);
router.put('/reviews/:id', requireAuth, updateReview);
router.delete('/reviews/:id', requireAuth, deleteReview);

export default router;
