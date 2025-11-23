import { param, body } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';
import { exists } from '../repositories/recipeRepo.js';


export const validateCollectionId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Collection ID must be a positive integer'),
    handleValidationErrors
];

export const validateCreateCollection = [
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

export const validateUpdateCollection = [
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

export const validateItemId = [
    param('itemId')
        .isInt({ min: 1 })
        .withMessage('Collection Item ID must be a positive integer'),
    handleValidationErrors
];

export const validateCreateItem = [
    body('recipe_id')
        .exists({ values: 'falsy' })
        .withMessage('Recipe ID is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Recipe ID must be a string')
        .bail()
        .matches(/^rec_\d+$/)
        .withMessage('Recipe ID must follow the format rec_#')
        .bail()
        .escape()
        .custom(async (value) => {
            if (value && !(await exists(value))) {
                throw new Error(`Invalid recipe_id: ${value}`);
            }
            return true;
        }),
    handleValidationErrors
];