import prisma from '../config/db.js';

export async function listCollections(req, res, next) {
  try {
    const userId = req.user.userid;
    const role = req.user.role;
    const ownerIdParam = req.query.ownerId;

    let where = { user_id: userId };

    if (role === 'ADMIN' && ownerIdParam) {
      where = { user_id: Number(ownerIdParam) };
    }

    const collections = await prisma.collection.findMany({
      where,
      orderBy: { collection_id: 'desc' },
    });

    res.json(collections);
  } catch (err) {
    next(err);
  }
}

export async function getCollection(req, res, next) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.userid;
    const role = req.user.role;

    const collection = await prisma.collection.findUnique({
      where: { collection_id: id },
      include: {
        items: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(collection);
  } catch (err) {
    next(err);
  }
}

export async function createCollection(req, res, next) {
  try {
    const userId = req.user.userid;
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        user_id: userId,
      },
    });

    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
}

export async function updateCollection(req, res, next) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.userid;
    const role = req.user.role;
    const { name } = req.body;

    const collection = await prisma.collection.findUnique({
      where: { collection_id: id },
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.collection.update({
      where: { collection_id: id },
      data: {
        name: name ?? collection.name,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteCollection(req, res, next) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.userid;
    const role = req.user.role;

    const collection = await prisma.collection.findUnique({
      where: { collection_id: id },
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.collection.delete({
      where: { collection_id: id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function addCollectionItem(req, res, next) {
  try {
    const collectionId = Number(req.params.id);
    const userId = req.user.userid;
    const role = req.user.role;
    const { recipeId, note } = req.body;

    const collection = await prisma.collection.findUnique({
      where: { collection_id: collectionId },
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const recipeIdNum = Number(recipeId);
    if (!recipeIdNum) {
      return res.status(400).json({ message: 'recipeId is required' });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { recipe_id: recipeIdNum },
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const existing = await prisma.collectionItem.findFirst({
      where: {
        collection_id: collectionId,
        recipe_id: recipeIdNum,
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Recipe already in collection' });
    }

    const item = await prisma.collectionItem.create({
      data: {
        collection_id: collectionId,
        recipe_id: recipeIdNum,
        note: note || null,
      },
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function removeCollectionItem(req, res, next) {
  try {
    const collectionId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    const userId = req.user.userid;
    const role = req.user.role;

    const collection = await prisma.collection.findUnique({
      where: { collection_id: collectionId },
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user_id !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const item = await prisma.collectionItem.findUnique({
      where: { collection_item_id: itemId },
    });

    if (!item || item.collection_id !== collectionId) {
      return res.status(404).json({ message: 'Collection item not found' });
    }

    await prisma.collectionItem.delete({
      where: { collection_item_id: itemId },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
