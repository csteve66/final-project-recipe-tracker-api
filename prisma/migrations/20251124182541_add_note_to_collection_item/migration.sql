/*
  Warnings:

  - You are about to drop the `CollectionItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CollectionItem" DROP CONSTRAINT "CollectionItem_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CollectionItem" DROP CONSTRAINT "CollectionItem_recipe_id_fkey";

-- DropTable
DROP TABLE "public"."CollectionItem";

-- CreateTable
CREATE TABLE "collection_items" (
    "collection_item_id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("collection_item_id")
);

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Collection"("collection_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;
