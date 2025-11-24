import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  validateCollectionId,
  validateItemId,
  validateCreateCollection,
  validateUpdateCollection,
  validateAddItemToCollection
} from '../middleware/collectionValidators.js';

import {
  listCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  addCollectionItem,
  removeCollectionItem
} from '../controllers/collectionController.js';

const router = express.Router();

router.get('/', authenticate, listCollections);

router.get('/:id', authenticate, validateCollectionId, getCollection);

router.post('/', authenticate, validateCreateCollection, createCollection);

router.put('/:id', authenticate, validateUpdateCollection, updateCollection);

router.delete('/:id', authenticate, validateCollectionId, deleteCollection);

router.post('/:id/items', authenticate, validateAddItemToCollection, addCollectionItem);

router.delete('/:id/items/:itemId', authenticate, validateCollectionId, validateItemId, removeCollectionItem);

export default router;
