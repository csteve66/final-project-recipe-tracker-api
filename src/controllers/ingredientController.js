const prisma = require("../config/db");


async function searchIngredients(req, res) {
  const q = (req.query.q || "").toString().trim();

  if (!q) {
    const all = await prisma.ingredient.findMany({
      take: 50,
      orderBy: { name: "asc" },
    });
    return res.json(all);
  }

  const items = await prisma.ingredient.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    take: 50,
    orderBy: { name: "asc" },
  });

  res.json(items);
}


async function getIngredient(req, res) {
  const id = req.params.id;
  const ing = await prisma.ingredient.findUnique({ where: { id } });
  if (!ing) return res.status(404).json({ error: "Not found" });
  res.json(ing);
}


async function createIngredient(req, res) {
  const name = req.body && req.body.name;
  if (!name) return res.status(400).json({ error: "name is required" });

  try {
    const created = await prisma.ingredient.create({
      data: { name: String(name).trim().toLowerCase() },
    });
    res.status(201).json(created);
  } catch (e) {
    return res.status(409).json({ error: "Ingredient already exists" });
  }
}


async function updateIngredient(req, res) {
  const name = req.body && req.body.name;
  if (!name) return res.status(400).json({ error: "name is required" });

  try {
    const updated = await prisma.ingredient.update({
      where: { id: req.params.id },
      data: { name: String(name).trim().toLowerCase() },
    });
    res.json(updated);
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    if (e.code === "P2002") return res.status(409).json({ error: "Duplicate name" });
    throw e;
  }
}

async function deleteIngredient(req, res) {
  try {
    await prisma.ingredient.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Not found" });
    throw e;
  }
}

module.exports = {
  searchIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};

export default ingredientController;