import { collectionService } from '../services/collectionService.js';

// GET /collections
export async function listCollections(req, res, next) {
  try {
    const collections = await collectionService.listCollections(
      req.user.id,
      req.user.role,
      req.query.ownerId
    );

    res.json(collections);
  } catch (err) {
    next(err);
  }
}

// GET /collections/:id
export async function getCollection(req, res, next) {
  try {
    const id = Number(req.params.id);

    const collection = await collectionService.getCollectionById(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(collection);
  } catch (err) {
    next(err);
  }
}

// POST /collections
export async function createCollection(req, res, next) {
  try {
    const collection = await collectionService.createCollection(
      req.user.id,
      req.body.name
    );

    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
}

// PUT /collections/:id
export async function updateCollection(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existingOwner = await collectionService.getCollectionOwner(id);
    if (!existingOwner) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (existingOwner !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await collectionService.updateCollection(id, {
      name: req.body.name
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /collections/:id
export async function deleteCollection(req, res, next) {
  try {
    const id = Number(req.params.id);

    const ownerId = await collectionService.getCollectionOwner(id);
    if (!ownerId) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await collectionService.deleteCollection(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// POST /collections/:id/items
export async function addCollectionItem(req, res, next) {
  try {
    const collectionId = Number(req.params.id);
    const recipeId = Number(req.body.recipeId);

    const ownerId = await collectionService.getCollectionOwner(collectionId);
    if (!ownerId) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const existingItem = await collectionService.findItem(collectionId, recipeId);
    if (existingItem) {
      return res.status(409).json({ message: 'Recipe already in collection' });
    }

    const item = await collectionService.addItem(
      collectionId,
      recipeId,
      req.body.note
    );

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// DELETE /collections/:id/items/:itemId
export async function removeCollectionItem(req, res, next) {
  try {
    const collectionId = Number(req.params.id);
    const itemId = Number(req.params.itemId);

    const ownerId = await collectionService.getCollectionOwner(collectionId);
    if (!ownerId) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const item = await collectionService.findItemById(itemId);
    if (!item || item.collection_id !== collectionId) {
      return res.status(404).json({ message: 'Collection item not found' });
    }

    await collectionService.removeItem(itemId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
