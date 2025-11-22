import prisma from '../config/db.js';

async function updateRecipeAvgRating(recipeId) {
  const id = Number(recipeId);
  const reviews = await prisma.review.findMany({
    where: { recipe_id: id },
  });

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await prisma.recipe.update({
    where: { recipe_id: id },
    data: { avg_rating: avg },
  });
}

export async function listReviewsForRecipe(req, res, next) {
  try {
    const recipeId = Number(req.params.recipeId);

    const reviews = await prisma.review.findMany({
      where: { recipe_id: recipeId },
      orderBy: { created_at: 'desc' },
    });

    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function createReviewForRecipe(req, res, next) {
  try {
    const recipeId = Number(req.params.recipeId);
    const userId = req.user.userid;
    const { rating, comment } = req.body;

    const recipe = await prisma.recipe.findUnique({
      where: { recipe_id: recipeId },
    });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const existing = await prisma.review.findFirst({
      where: { recipe_id: recipeId, user_id: userId },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this recipe' });
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const review = await prisma.review.create({
      data: {
        recipe_id: recipeId,
        user_id: userId,
        rating: parsedRating,
        comment: comment || null,
      },
    });

    await updateRecipeAvgRating(recipeId);

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

export async function updateReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const userId = req.user.userid;
    const role = req.user.role;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { review_id: reviewId },
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const data = {};
    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
      }
      data.rating = parsedRating;
    }
    if (comment !== undefined) {
      data.comment = comment;
    }

    const updated = await prisma.review.update({
      where: { review_id: reviewId },
      data,
    });

    await updateRecipeAvgRating(review.recipe_id);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const userId = req.user.userid;
    const role = req.user.role;

    const review = await prisma.review.findUnique({
      where: { review_id: reviewId },
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.review.delete({
      where: { review_id: reviewId },
    });

    await updateRecipeAvgRating(review.recipe_id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
