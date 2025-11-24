import { reviewService } from '../services/reviewService.js';

// GET /recipes/:recipeId/reviews
export async function listReviewsForRecipe(req, res, next) {
  try {
    const recipeId = Number(req.params.recipeId);

    const reviews = await reviewService.listReviews(recipeId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

// POST /recipes/:recipeId/reviews
export async function createReviewForRecipe(req, res, next) {
  try {
    const recipeId = Number(req.params.recipeId);
    const userId = req.user.id;

    const { rating, comment } = req.body;

    const recipe = await reviewService.findRecipe(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const existing = await reviewService.findExistingUserReview(
      recipeId,
      userId
    );
    if (existing) {
      return res
        .status(409)
        .json({ message: 'You have already reviewed this recipe' });
    }

    const review = await reviewService.createReview(
      recipeId,
      userId,
      Number(rating),
      comment
    );

    await reviewService.updateRecipeAvgRating(recipeId);

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

// PUT /reviews/:id
export async function updateReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;

    const existing = await reviewService.findReviewById(reviewId);
    if (!existing) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (existing.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await reviewService.updateReview(reviewId, {
      rating:
        req.body.rating !== undefined ? Number(req.body.rating) : undefined,
      comment: req.body.comment,
    });

    await reviewService.updateRecipeAvgRating(existing.recipe_id);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;

    const existing = await reviewService.findReviewById(reviewId);
    if (!existing) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (existing.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await reviewService.deleteReview(reviewId);

    await reviewService.updateRecipeAvgRating(existing.recipe_id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

