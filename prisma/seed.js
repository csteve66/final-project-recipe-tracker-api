import prisma from '../src/config/db.js';
import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log("Seeding database");

  //USERS
  const admin1 = await prisma.user.create({
    data: {
      username: "Nathalie_Brown",
      email: "nathalie_brown@email.com",
      password_hash: await hashPassword("AdminPassword1!"),
      role: "ADMIN",
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      username: "John_Roese",
      email: "john_roese@email.com",
      password_hash: await hashPassword("AdminPassword2!"),
      role: "ADMIN",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: "Chase_Stevens",
      email: "chase_stevens@email.com",
      password_hash: await hashPassword("UserPassword1!"),
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "Jasmine_Biggs",
      email: "jasmine_biggs@email.com",
      password_hash: await hashPassword("UserPassword2!"),
      role: "USER",
    },
  });


  //Ingredients
  const flour = await prisma.ingredient.create({
    data: { name: "Flour", unit: "grams" }
  });
  const sugar = await prisma.ingredient.create({
    data: { name: "Sugar", unit: "grams" }
  });
  const egg = await prisma.ingredient.create({
    data: { name: "Egg", unit: "piece" }
  });
  const tomato = await prisma.ingredient.create({
    data: { name: "Tomato", unit: "piece" }
  });
  const pasta = await prisma.ingredient.create({
    data: { name: "Pasta", unit: "grams" }
  });


  //Tags
  const breakfastTag = await prisma.tag.create({ data: { name: "Breakfast" } });
  const dessertTag = await prisma.tag.create({ data: { name: "Dessert" } });
  const italianTag = await prisma.tag.create({ data: { name: "Italian" } });


  //Recipes owned by users
  const pancakeRecipe = await prisma.recipe.create({
    data: {
      user_id: user1.userid,
      title: "Fluffy Pancakes",
      description: "A simple pancake recipe",
      is_public: true,
      prep_time: 10,
      cook_time: 5,
      servings: 2,
      steps: {
        create: [
          { step_number: 1, instruction: "Mix ingredients" },
          { step_number: 2, instruction: "Heat the pan" },
          { step_number: 3, instruction: "Cook pancakes" }
        ]
      },
      recipeIngredients: {
        create: [
          { ingredient_id: flour.ingredient_id },
          { ingredient_id: sugar.ingredient_id },
          { ingredient_id: egg.ingredient_id }
        ]
      },
      recipeTags: {
        create: [{ tag_id: breakfastTag.tag_id }]
      }
    }
  });

  const pastaRecipe = await prisma.recipe.create({
    data: {
      user_id: user2.userid,
      title: "Tomato Pasta",
      description: "Easy pasta with tomato sauce",
      is_public: false,
      prep_time: 15,
      cook_time: 20,
      servings: 3,
      steps: {
        create: [
          { step_number: 1, instruction: "Boil pasta" },
          { step_number: 2, instruction: "Cook tomatoes" },
          { step_number: 3, instruction: "Mix together" }
        ]
      },
      recipeIngredients: {
        create: [
          { ingredient_id: pasta.ingredient_id },
          { ingredient_id: tomato.ingredient_id }
        ]
      },
      recipeTags: {
        create: [{ tag_id: italianTag.tag_id }]
      }
    }
  });

  const cookieRecipe = await prisma.recipe.create({
    data: {
      user_id: admin1.userid,
      title: "Simple Sugar Cookies",
      description: "Quick and tasty cookies",
      is_public: true,
      prep_time: 20,
      cook_time: 10,
      servings: 4,
      steps: {
        create: [
          { step_number: 1, instruction: "Mix ingredients" },
          { step_number: 2, instruction: "Pour batter onto pan to create small cookies" },
          { step_number: 3, instruction: "Put pan in oven" }
        ]
      },
      recipeIngredients: {
        create: [
          { ingredient_id: flour.ingredient_id },
          { ingredient_id: sugar.ingredient_id },
          { ingredient_id: egg.ingredient_id }
        ]
      },
      recipeTags: {
        create: [{ tag_id: dessertTag.tag_id }]
      }
    }
  });

  //Collections
  const collection1 = await prisma.collection.create({
    data: {
      user_id: user1.userid,
      name: "Chase's Favorites",
      items: {
        create: [{ recipe_id: cookieRecipe.recipe_id }]
      }
    }
  });

  const collection2 = await prisma.collection.create({
    data: {
      user_id: user2.userid,
      name: "Jasmine's Saved Recipes",
      items: {
        create: [{ recipe_id: pancakeRecipe.recipe_id }]
      }
    }
  });


  //Reviews
//Reviews
await prisma.review.create({
  data: {
    user_id: user2.userid,
    recipe_id: pancakeRecipe.recipe_id,
    rating: 5,
    comment: "Loved these pancakes"
  }
});

await prisma.review.create({
  data: {
    user_id: user1.userid,
    recipe_id: pastaRecipe.recipe_id,
    rating: 4,
    comment: "Tasty pasta"
  }
});


  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });