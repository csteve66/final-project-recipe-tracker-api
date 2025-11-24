import { body, param } from 'express-validator';
import handleValidationErrors from './handleValidationErrors.js';

export const validateRecipeId = [
  param('recipeId')
    .isInt({ min: 1 })
    .withMessage('Recipe ID must be a positive integer'),
  handleValidationErrors
];

export const validateReviewId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Review ID must be a positive integer'),
  handleValidationErrors
];

export const validateCreateReview = [
  param('recipeId')
    .isInt({ min: 1 })
    .withMessage('Recipe ID must be a positive integer'),
  body('rating')
    .exists({ checkFalsy: true })
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  handleValidationErrors
];

export const validateUpdateReview = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Review ID must be a positive integer'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  handleValidationErrors
];