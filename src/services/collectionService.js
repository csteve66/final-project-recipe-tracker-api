import prisma from '../config/db.js';

export const collectionService = {
  async listCollections(userId, role, ownerIdParam) {
    let where = { user_id: userId };

    if (role === 'ADMIN' && ownerIdParam) {
      where = { user_id: Number(ownerIdParam) };
    }

    return prisma.collection.findMany({
      where,
      orderBy: { collection_id: 'desc' },
    });
  },

  async getCollectionById(id) {
    return prisma.collection.findUnique({
      where: { collection_id: id },
      include: {
        items: {
          include: {
            recipe: true,
          },
        },
      },
    });
  },

  async createCollection(userId, name) {
    return prisma.collection.create({
      data: {
        name,
        user_id: userId,
      },
    });
  },

  async updateCollection(id, updatedData) {
    return prisma.collection.update({
      where: { collection_id: id },
      data: updatedData,
    });
  },

  async deleteCollection(id) {
    // delete children first
    await prisma.collectionItem.deleteMany({
      where: { collection_id: id },
    });

    return prisma.collection.delete({
      where: { collection_id: id },
    });
  },

  async getCollectionOwner(id) {
    const col = await prisma.collection.findUnique({
      where: { collection_id: id },
      select: { user_id: true },
    });
    return col?.user_id;
  },

  async addItem(collectionId, recipeId, note) {
    return prisma.collectionItem.create({
      data: {
        collection_id: collectionId,
        recipe_id: recipeId,
        note: note || null,
      },
    });
  },

  async findItem(collectionId, recipeId) {
    return prisma.collectionItem.findFirst({
      where: {
        collection_id: collectionId,
        recipe_id: recipeId,
      },
    });
  },

  async findItemById(itemId) {
    return prisma.collectionItem.findUnique({
      where: { collection_item_id: itemId },
    });
  },

  async removeItem(itemId) {
    return prisma.collectionItem.delete({
      where: { collection_item_id: itemId },
    });
  }
};
