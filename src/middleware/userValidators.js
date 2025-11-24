import { body, oneOf } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateUser = [
    body('email')
        .exists({ values: 'falsy' })
        .withMessage('Email is required')
        .bail()
        .isEmail()
        .withMessage('Email is not valid')
        .normalizeEmail(),
    body('username')
        .exists({ values: 'falsy' })
        .withMessage('Username is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Username is required')
        .bail()
        .isLength({ min: 8, max: 32 })
        .withMessage('Username must be between 8 and 32 characters long')
        .bail()
        .escape(),
    body('password')
        .exists({ values: 'falsy' })
        .withMessage('Password is required')
        .bail()
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be between 8 and 64 characters long'),
    handleValidationErrors
];

export const validateUpdateUser = [
    oneOf(
        [
            body('email')
                .exists({ values: 'falsy' }),
            body('username')
                .exists({ values: 'falsy' }),
            body('password')
                .exists({ values: 'falsy' })
        ],
        {
            message: 'At least one field (email, username, password) must be provided'
        }
    ),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email is not valid')
        .normalizeEmail(),
    body('username')
        .optional()
        .trim()
        .isString()
        .withMessage('Username must be a string')
        .bail()
        .isLength({ min: 8, max: 32 })
        .withMessage('Username must be between 8 and 32 characters long')
        .bail()
        .escape(),
    body('password')
        .optional()
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be between 8 and 64 characters long'),
    handleValidationErrors
];

export const validateRoleUpdate = [
    body('role')
        .exists({ values: 'falsy' })
        .withMessage('Role must be provided')
        .bail()
        .isIn(['USER', 'CREATOR', 'ADMIN'])
        .withMessage('Role must be either USER, CREATOR, or ADMIN'),
    handleValidationErrors
];