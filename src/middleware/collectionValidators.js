import { body, param } from 'express-validator';
import handleValidationErrors from './handleValidationErrors.js';

export const validateCollectionId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Collection ID must be a positive integer'),
  handleValidationErrors
];

export const validateItemId = [
  param('itemId')
    .isInt({ min: 1 })
    .withMessage('Collection item ID must be a positive integer'),
  handleValidationErrors
];

export const validateCreateCollection = [
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 255 })
    .withMessage('Name cannot exceed 255 characters'),
  handleValidationErrors
];

export const validateUpdateCollection = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Collection ID must be a positive integer'),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 255 })
    .withMessage('Name cannot exceed 255 characters'),
  handleValidationErrors
];

export const validateAddItemToCollection = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Collection ID must be a positive integer'),
  body('recipeId')
    .exists({ checkFalsy: true })
    .withMessage('recipeId is required')
    .isInt({ min: 1 })
    .withMessage('recipeId must be a positive integer'),
  body('note')
    .optional()
    .isString()
    .withMessage('note must be a string'),
  handleValidationErrors
];