import { param, body, oneOf } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateCreateReview = [
    body('rating')
        .exists({ values: 'falsy' })
        .withMessage('Rating is required')
        .bail()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .exists({ values: 'falsy' })
        .withMessage('Comment is required')
        .bail()
        .trim()
        .isString()
        .withMessage('Comment must be a string')
        .bail()
        .isLength({ min: 5 })
        .withMessage('Comment must be at least 5 characters')
        .bail()
        .escape(),
    handleValidationErrors
];

export const validateUpdateReview = [
    oneOf(
        [
            body('rating')
                .exists({ values: 'falsy' }),
            body('comment')
                .exists({ values: 'falsy' })
        ],
        {
            message: 'At least one field (rating, comment) must be provided'
        }
    ),

    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isString()
        .withMessage('Comment must be a string')
        .bail()
        .isLength({ min: 5 })
        .withMessage('Comment must be at least 5 characters')
        .bail()
        .escape(),
    handleValidationErrors
];

export const validateReviewId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Review ID must be a positive integer'),
    handleValidationErrors
];