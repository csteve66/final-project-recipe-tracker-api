import express from 'express';
import { updateProfileHandler, deleteProfileHandler, updateUserRoleHandler } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validateUpdateUser, validateRoleUpdate } from '../middleware/userValidators.js';

const router = express.Router();

router.put('/me', authenticate, validateUpdateUser, updateProfileHandler);
router.delete('/me', authenticate, deleteProfileHandler);
router.patch('/:id/role', authenticate, authorizeRoles('ADMIN'), validateRoleUpdate, updateUserRoleHandler);

export default router;