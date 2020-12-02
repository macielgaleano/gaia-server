const Product = require("./models/Product");
const Category = require("./models/Category");
const Admin = require("./models/Admin");
const fetch = require("node-fetch");
const faker = require("faker");
faker.locale = "es";
var slugify = require("slugify");
let axios = require("axios");
const productsJson = require("./products.json");
module.exports = {
  data: async (req, res) => {
    Admin.collection.remove();
    const adminUser = new Admin({
      firstname: "root",
      lastname: "root",
      active: true,
      email: "root@gmail.com",
      password: "1234",
    });
    adminUser.save();
    Product.collection.remove();
    Category.collection.remove();
    let products = productsJson;
    let idCategories = [];
    let categories = ["Navidad", "Navidad", "Navidad", "Navidad"];
    for (let g = 0; g < categories.length; g++) {
      const category = await new Category({
        name: categories[g],
      });
      idCategories.push(category._id);
      category.save();
    }

    let users = [];
    let products_list = [];

    if (await products) {
      //Crar productos

      for (let i = 0; i < products.length; i++) {
        const categories = await Category.find({});
        let name = faker.commerce.productName();
        async function category() {
          for (let g = 0; g < categories.length; g++) {
            if (products[i].category === categories[g].name) {
              return categories[g]._id;
            }
          }
        }
        console.log(await category());
        category();

        const product = new Product({
          name: products[i].name,
          description: products[i].description,
          price: products[i].price,
          pictures: products[i].pictures,
          stock: products[i].stock,
          colors: [
            faker.internet.color(),
            faker.internet.color(),
            faker.internet.color(),
          ],
          materials: [
            faker.commerce.productMaterial(),
            faker.commerce.productMaterial(),
            faker.commerce.productMaterial(),
            faker.commerce.productMaterial(),
          ],
          size: faker.random.number(),
          category: await category(),
          outstanding: faker.random.boolean(),
          slug: slugify(name),
        });
        products_list.push(product);
        await product.save();
      }
    }

    //Crar productos

    res.json({ products_list });
  },
};
