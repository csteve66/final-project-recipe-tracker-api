import express from 'express';
import { signUpHandler, logInHandler } from '../controllers/authController.js';
import { validateUser, validateLogin } from '../middleware/userValidators.js';
import loginLimiter from '../middleware/rateLimiter.js';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const router = express.Router();

router.post(
  '/signup',
  validateUser,
  handleValidationErrors,
  signUpHandler
);

router.post(
  '/login',
  loginLimiter,
  validateLogin,
  handleValidationErrors,
  logInHandler
);

export default router;
