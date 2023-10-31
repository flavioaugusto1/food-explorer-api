const AppError = require("../utils/AppError");
const knex = require("../database/knex/index.js");

class DishesController {
  async create(request, response) {
    const { name, description, image, price, category, ingredients } =
      request.body;

    const [dishes_id] = await knex("dishes").insert({
      name,
      description,
      price,
      category,
    });

    const insertIngredients = ingredients.map((ingredient) => {
      return {
        name: ingredient,
        dishes_id,
      };
    });

    await knex("ingredients").insert(insertIngredients);

    return response.status(201).json({ message: "Prato criado com sucesso!" });
  }

  async index(request, response) {
    const { search } = request.query;

    let searchDishes = await knex("dishes").select([
      "dishes.id",
      "dishes.name",
      "dishes.description",
      "dishes.price",
      "dishes.category",
      "dishes.image",
    ]);

    if (search) {
      searchDishes = await knex("dishes")
        .select("dishes.*")
        .where("ingredients.name", "like", `%${search}%`)
        .orWhere("dishes.name", "like", `%${search}%`)
        .join("ingredients", "dishes.id", "ingredients.dishes_id")
        .distinct();
    }

    return response.json({ searchDishes });
  }

  async show(request, response) {
    const { id } = request.params;

    const dish = await knex("dishes").where({ id }).first();
    const ingredients = await knex("ingredients")
      .where({ dishes_id: id })
      .orderBy("name");

    return response.json({
      ...dish,
      ingredients,
    });
  }

  async update(request, response) {
    const { name, description, category, ingredients, price, image } =
      request.body;
    const dishes_id = request.params.id;

    await knex("dishes").where({ id: dishes_id }).update({
      name: name,
      description: description,
      category: category,
      price: price,
      image: image
    });

    await knex("ingredients").where({ dishes_id }).del();

    const newIngredients = ingredients.map((ingredient) => {
      return {
        dishes_id,
        name: ingredient,
      };
    });

    await knex("ingredients").insert(newIngredients);

    return response.json({ message: "Sucesso" });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("dishes").where({ id }).delete();

    return response.json({ message: "Prato deletado com sucesso" });
  }
}

module.exports = DishesController;
