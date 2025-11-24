import express from 'express';
import { authenticate } from '../middleware/auth.js';

import {
  validateRecipeId,
  validateReviewId,
  validateCreateReview,
  validateUpdateReview
} from '../middleware/reviewValidators.js';

import {
  listReviewsForRecipe,
  createReviewForRecipe,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.get(
  '/recipes/:recipeId/reviews',
  validateRecipeId,
  listReviewsForRecipe
);

router.post(
  '/recipes/:recipeId/reviews',
  authenticate,
  validateCreateReview,
  createReviewForRecipe
);

router.put(
  '/reviews/:id',
  authenticate,
  validateReviewId,
  validateUpdateReview,
  updateReview
);

router.delete(
  '/reviews/:id',
  authenticate,
  validateReviewId,
  deleteReview
);

export default router;
