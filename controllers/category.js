const Category = require("../models/Category");

module.exports = {
  store: async (req, res) => {
    const sercheadCategory = await Category.findOne({ name: req.body.name });
    if (!sercheadCategory) {
      let category = new Category({
        name: req.body.name,
      });
      category.save();
      res.json({
        message: "Categoria creada correctamente.",
        category: category,
      });
    } else {
      res.json({ message: "La categoría ingresada ya existe." });
    }
  },
  show: async (req, res) => {
    const categories = await Category.find({});
    return res.json(categories);
  },
  delete: async (req, res) => {
    await Category.deleteOne({ name: req.body.name });
    res.json({ message: "Categoría eliminada." });
  },
  update: async (req, res) => {
    const searchedCategory = await Category.findOne({
      name: req.body.newCategoryName,
    });
    if (!searchedCategory) {
      await Category.findOneAndUpdate(
        { name: req.body.nameToSearch },
        {
          name: req.body.newCategoryName,
        }
      );

      res.json({ message: "Categoría actualizada." });
    } else {
      res.json({
        message: "El nombre indroducido ya existe, no se puede actualizar la categoría.",
      });
    }
  },
};
