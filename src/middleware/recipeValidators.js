import { param, body, oneOf } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateRecipeId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Recipe ID must be a postitive integer'),
    handleValidationErrors
];

export const validateCreateRecipe = [
    body('title')
        .exists({ values: 'falsy' })
        .withMessage('Title is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Title must be a string')
        .bail()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters')
        .bail()
        .escape(),
    body('description')
        .exists({ values: 'falsy' })
        .withMessage('Description is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Description must be a string')
        .bail()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters')
        .bail()
        .escape(),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be true or false'),
    body('servings')
        .exists({ values: 'falsy' })
        .withMessage('Servings is required')
        .bail()
        .isInt({ min: 1})
        .withMessage('Servings must be a postitive integer'),
    body('prepMinutes')
        .exists({ values: 'falsy' })
        .withMessage('prepMinutes is required')
        .bail()
        .isInt({ min: 0})
        .withMessage('prepMinutes must be a non-negative integer'),
    body('cookMinutes')
        .exists({ values: 'falsy' })
        .withMessage('cookMinutes is required')
        .bail()
        .isInt({ min: 0 })
        .withMessage('cookMinutes must be a non-negative integer'),
    body('steps')
        .exists({ values: 'falsy' })
        .withMessage('Steps are required')
        .bail()
        .isArray({ min: 1 })
        .withMessage('Steps must be a non-empty array'),
    body('steps.*.order')
        .exists({ values: 'falsy' })
        .withMessage('Steps order is required')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Steps order must be a positive integer'),
    body('steps.*.text')
        .exists({ values: 'falsy' })
        .withMessage('Steps text is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Steps text must be a string')
        .bail()
        .isLength({ min: 1 })
        .withMessage('Steps text must be at least 1 character')
        .bail()
        .escape(),
    body('ingredients')
        .exists({ values: 'falsy' })
        .withMessage('Ingredient are required')    
        .bail()
        .isArray({ min: 1 })
        .withMessage('Ingredients must be a non-empty array'),
    body('ingredients.*.name')
        .exists({ values: 'falsy'})
        .withMessage('Ingredients name is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Ingredients name must be a string')
        .bail()
        .isLength( { min: 3, max: 100 })
        .withMessage('Ingredients name must be between 3 and 100 characters')
        .bail()
        .escape(),
    body('ingredients.*.unit')
        .exists({ values: 'falsy' })
        .withMessage('Ingredients unit is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Ingredients unit must be a string')
        .bail()
        .isLength( { min: 1 })
        .withMessage('Ingredients unit must be at least 1 character')
        .bail()
        .escape(),
    body('tags')
        .exists({ values: 'falsy' })
        .withMessage('Tags are required')
        .bail()
        .isArray({ min: 1 })
        .withMessage('Tags must be a non-empty array'),
    body('tags.*')
        .trim()
        .isString()
        .withMessage('Each tag must be a string')
        .bail()
        .isLength({ min: 1 })
        .withMessage('Tags cannot be empty')
        .bail()
        .escape(),
    handleValidationErrors
];

export const validateUpdateRecipe = [
    oneOf(
        [
        body('title')
            .exists({ values: 'falsy' }),
        body('isPublic')
            .exists({ values: 'falsy' })
        ], 
        {
            message: 'At least one field (title, isPublic) must be provided'
        }
    ),
    body('title')
        .optional()
        .trim()
        .isString()
        .withMessage('Title must be a string')
        .bail()
        .isLength({ min: 3, max: 100})
        .withMessage('Title must be between 3 and 100 characters')
        .bail()
        .escape(),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be true or false'),
    handleValidationErrors
];

export const validateUpdateRecipeVisibility = [
    body('isPublic')
        .exists({ values: 'falsy' })
        .withMessage('isPublic is required')
        .bail()
        .isBoolean()
        .withMessage('isPublic must be true or false'),
    handleValidationErrors
];

export const validateCreateIngredientsForRecipe = [
    body('ingredients')
        .exists({ values: 'falsy' })
        .withMessage('Ingredients are required')
        .bail()
        .isArray({ min: 1 })
        .withMessage('Ingredients must be a non-empty array'),
    body('ingredients.*')
        .custom((ingredient) => {
            const hasId = !!ingredient.ingredientId;
            const hasName = !!ingredient.name;

            if (!hasId && !hasName) {
                throw new Error('Each ingredient must either have an id or name');
            }

            if (hasId && hasName) {
                throw new Error('Ingredient ID and name cannot both be provided');
            }
            return true;
        }),
    body('ingredients.*.ingredientId')
        .optional()
        .trim()
        .isString()
        .withMessage('Ingredient ID must be a string')
        .bail()
        .matches(/^ing_\d+$/)
        .withMessage('Ingredient ID must follow format ing_#')
        .bail()
        .custom(async(value) => {
            if (value && !(await exists(value))) {
                throw new Error(`Invalid ingredientId: ${value}`);
            }
            return true;
        }),
    body('ingredients.*.name')
        .optional()
        .trim()
        .isString()
        .withMessage('Ingredient name must be a string')
        .bail()
        .isLength({ min: 3, max: 100 })
        .withMessage('Ingredient name must be between 3 and 100 characters')
        .bail()
        .escape(),
    body('ingredients.*.unit')
        .exists({ values: 'falsy' })
        .withMessage('Ingredient unit is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Ingredient unit must be a string')
        .bail()
        .isLength({ min: 1 })
        .withMessage('Ingredient unit must be at least 1 character')
        .bail()
        .escape(),
    handleValidationErrors
];

export const validateCreateStepsForRecipe = [
    body('steps')
        .exists({ values: 'falsy' })
        .withMessage('Steps is required')
        .bail()
        .isArray({ min: 1 })
        .withMessage('Steps must be a non-empty array'),
    body('steps.*.order')
        .exists({ values: 'falsy' })
        .withMessage('Steps order is required')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Steps order must be a positive integer'),
    body('steps.*.text')
        .exists({ values: 'falsy' })
        .withMessage('Steps text is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Steps text must be a string')
        .bail()
        .isLength({ min: 1 })
        .withMessage('Steps text must be at least 1 character')
        .bail()
        .escape(),
    handleValidationErrors
];