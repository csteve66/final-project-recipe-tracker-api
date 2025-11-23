import { param, query, body } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateIngredientId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Ingredient ID must be a positive integer'),
    handleValidationErrors
];

export const validateIngredientQuery = [
    query('q')
        .optional()
        .trim()
        .isString()
        .withMessage('Query must be a string')
        .bail()
        .isLength({ min: 1 })
        .withMessage('Query cannot be empty')
        .bail()
        .escape(),
    handleValidationErrors
];

export const validateCreateIngredient = [
    body('name')
        .exists({ values: 'falsy' })
        .withMessage('Name is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Name must be a string')
        .bail()
        .isLength({ min: 3, max: 100 })
        .withMessage('Name must be between 3 and 100 characters')
        .bail()
        .escape(),
    handleValidationErrors
];

export const validateUpdateIngredient = [
    body('name')
        .exists({ values: 'falsy' })
        .withMessage('Name is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Name must be a string')
        .bail()
        .isLength({ min: 3, max: 100 })
        .withMessage('Name must be between 3 and 100 characters')
        .bail()
        .escape(),
    handleValidationErrors
];