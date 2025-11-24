import prisma from '../config/db.js';

export const reviewService = {
  async listReviews(recipeId) {
    return prisma.review.findMany({
      where: { recipe_id: recipeId },
      orderBy: { created_at: 'desc' },
    });
  },

  async findRecipe(recipeId) {
    return prisma.recipe.findUnique({
      where: { recipe_id: recipeId },
    });
  },

  async findExistingUserReview(recipeId, userId) {
    return prisma.review.findFirst({
      where: { recipe_id: recipeId, user_id: userId },
    });
  },

  async createReview(recipeId, userId, rating, comment) {
    return prisma.review.create({
      data: {
        recipe_id: recipeId,
        user_id: userId,
        rating,
        comment: comment || null,
      },
    });
  },

  async findReviewById(reviewId) {
    return prisma.review.findUnique({
      where: { review_id: reviewId },
    });
  },

  async updateReview(reviewId, data) {
    return prisma.review.update({
      where: { review_id: reviewId },
      data,
    });
  },

  async deleteReview(reviewId) {
    return prisma.review.delete({
      where: { review_id: reviewId },
    });
  },

  async updateRecipeAvgRating(recipeId) {
    const reviews = await prisma.review.findMany({
      where: { recipe_id: recipeId },
    });

    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return prisma.recipe.update({
      where: { recipe_id: recipeId },
      data: { avg_rating: avg },
    });
  }
};
