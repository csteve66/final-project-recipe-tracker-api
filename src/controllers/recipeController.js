const prisma = require("../config/db");


function isAdmin(req) {
  return req.user && req.user.role === "ADMIN";
}
function isOwner(req, ownerId) {
  return req.user && req.user.id === ownerId;
}
function notFound(res) {
  return res.status(404).json({ error: "Not found" });
}
function forbidden(res) {
  return res.status(403).json({ error: "Forbidden" });
}
function badReq(res, msg) {
  return res.status(400).json({ error: msg });
}


async function listRecipes(req, res) {
  const q = (req.query.q || "").toString();
  const tag = (req.query.tag || "").toString();
  const page = parseInt(req.query.page || "1", 10);
  const pageSize = parseInt(req.query.pageSize || "20", 10);
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;

  const p = Math.max(page, 1);
  const ps = Math.max(Math.min(pageSize, 100), 1);

  const where = { isPublic: true };

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }
  if (tag) {
    where.tags = {
      some: {
        tag: { name: { equals: tag, mode: "insensitive" } },
      },
    };
  }
  if (!isNaN(minRating)) {
    where.avgRating = { gte: minRating };
  }

  const [total, recipes] = await Promise.all([
    prisma.recipe.count({ where }),
    prisma.recipe.findMany({
      where,
      select: { id: true, title: true, isPublic: true, avgRating: true },
      orderBy: { updatedAt: "desc" },
      skip: (p - 1) * ps,
      take: ps,
    }),
  ]);

  res.json({
    data: recipes,
    meta: {
      page: p,
      pageSize: ps,
      total,
      hasNext: p * ps < total,
    },
  });
}


async function getRecipe(req, res) {
  const id = req.params.id;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      ingredients: { include: { ingredient: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) return notFound(res);

  if (
    !recipe.isPublic &&
    !(req.user && (isAdmin(req) || isOwner(req, recipe.ownerId)))
  ) {
   
    return notFound(res);
  }

  res.json({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    isPublic: recipe.isPublic,
    ownerId: recipe.ownerId,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    steps: recipe.steps.map((s) => ({ order: s.order, text: s.text })),
    ingredients: recipe.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      name: ri.ingredient.name,
      quantity: ri.quantity,
      unit: ri.unit,
    })),
    tags: recipe.tags.map((t) => t.tag.name),
    avgRating: recipe.avgRating,
  });
}


async function createRecipe(req, res) {
  if (!req.user) return forbidden(res);
  if (req.user.role !== "ADMIN" && req.user.role !== "CREATOR") {
    return forbidden(res);
  }

  const body = req.body || {};
  const {
    title,
    description,
    isPublic = true,
    servings,
    prepMinutes,
    cookMinutes,
    steps = [],
    ingredients = [],
    tags = [],
  } = body;

  if (!title || typeof title !== "string") {
    return badReq(res, "title is required");
  }

  const stepCreates = steps.map((s) => ({
    order: Number(s.order),
    text: String(s.text || ""),
  }));


  const ingredientCreates = [];
  for (const i of ingredients) {
    let ingredientId = i.ingredientId;

    if (!ingredientId && i.name) {
      const name = i.name.trim().toLowerCase();
      const ing = await prisma.ingredient.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      ingredientId = ing.id;
    }

    if (!ingredientId) {
      return badReq(res, "Each ingredient needs ingredientId or name");
    }

    ingredientCreates.push({
      ingredientId,
      quantity: Number(i.quantity),
      unit: String(i.unit || ""),
    });
  }


  const tagCreates = [];
  for (const t of tags) {
    const name = String(t).trim().toLowerCase();
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tagCreates.push({ tagId: tag.id });
  }

  const created = await prisma.recipe.create({
    data: {
      ownerId: req.user.id,
      title,
      description,
      isPublic,
      servings: servings ?? null,
      prepMinutes: prepMinutes ?? null,
      cookMinutes: cookMinutes ?? null,
      steps: stepCreates.length ? { create: stepCreates } : undefined,
      ingredients: ingredientCreates.length
        ? { create: ingredientCreates }
        : undefined,
      tags: tagCreates.length ? { create: tagCreates } : undefined,
    },
    select: { id: true, title: true, isPublic: true },
  });

  res.status(201).json(created);
}


async function updateRecipe(req, res) {
  const id = req.params.id;
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!existing) return notFound(res);
  if (!(req.user && (isAdmin(req) || isOwner(req, existing.ownerId)))) {
    return forbidden(res);
  }

  const { title, description, isPublic, servings, prepMinutes, cookMinutes } =
    req.body || {};

  const updated = await prisma.recipe.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic: !!isPublic }),
      ...(servings !== undefined && { servings }),
      ...(prepMinutes !== undefined && { prepMinutes }),
      ...(cookMinutes !== undefined && { cookMinutes }),
    },
    select: { id: true, title: true, isPublic: true },
  });

  res.json(updated);
}


async function deleteRecipe(req, res) {
  const id = req.params.id;
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!existing) return notFound(res);
  if (!(req.user && (isAdmin(req) || isOwner(req, existing.ownerId)))) {
    return forbidden(res);
  }

  await prisma.recipe.delete({ where: { id } });
  res.status(204).send();
}


async function setVisibility(req, res) {
  const id = req.params.id;
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!existing) return notFound(res);
  if (!(req.user && (isAdmin(req) || isOwner(req, existing.ownerId)))) {
    return forbidden(res);
  }

  const isPublic = req.body && req.body.isPublic;
  if (typeof isPublic !== "boolean") {
    return badReq(res, "isPublic must be boolean");
  }

  const updated = await prisma.recipe.update({
    where: { id },
    data: { isPublic },
    select: { id: true, isPublic: true },
  });

  res.json(updated);
}


async function replaceSteps(req, res) {
  const id = req.params.id;
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!existing) return notFound(res);
  if (!(req.user && (isAdmin(req) || isOwner(req, existing.ownerId)))) {
    return forbidden(res);
  }

  const steps = (req.body && req.body.steps) || [];
  const payload = steps.map((s) => ({
    order: Number(s.order),
    text: String(s.text || ""),
  }));

  await prisma.$transaction([
    prisma.step.deleteMany({ where: { recipeId: id } }),
    prisma.step.createMany({
      data: payload.map((s) => ({ ...s, recipeId: id })),
    }),
  ]);

  const updated = await prisma.step.findMany({
    where: { recipeId: id },
    orderBy: { order: "asc" },
  });

  res.json({
    steps: updated.map((s) => ({ order: s.order, text: s.text })),
  });
}


async function replaceIngredients(req, res) {
  const id = req.params.id;
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!existing) return notFound(res);
  if (!(req.user && (isAdmin(req) || isOwner(req, existing.ownerId)))) {
    return forbidden(res);
  }

  const ingredients = (req.body && req.body.ingredients) || [];
  if (!Array.isArray(ingredients)) {
    return badReq(res, "ingredients must be an array");
  }

  const resolved = [];
  for (const i of ingredients) {
    let ingredientId = i.ingredientId;

    if (!ingredientId && i.name) {
      const name = i.name.trim().toLowerCase();
      const ing = await prisma.ingredient.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      ingredientId = ing.id;
    }

    if (!ingredientId) {
      return badReq(res, "Each ingredient needs ingredientId or name");
    }

    resolved.push({
      ingredientId,
      quantity: Number(i.quantity),
      unit: String(i.unit || ""),
    });
  }

  await prisma.$transaction([
    prisma.recipeIngredient.deleteMany({ where: { recipeId: id } }),
    prisma.recipe.update({
      where: { id },
      data: {
        ingredients: {
          create: resolved.map((r) => ({
            ingredientId: r.ingredientId,
            quantity: r.quantity,
            unit: r.unit,
          })),
        },
      },
    }),
  ]);

  const after = await prisma.recipe.findUnique({
    where: { id },
    include: { ingredients: { include: { ingredient: true } } },
  });

  res.json({
    ingredients: after.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      name: ri.ingredient.name,
      quantity: ri.quantity,
      unit: ri.unit,
    })),
  });
}

module.exports = {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  setVisibility,
  replaceSteps,
  replaceIngredients,
};

export default recipeController;
