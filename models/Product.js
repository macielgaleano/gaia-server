const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var slugify = require("slugify");

const productSchema = new Schema(
  {
    name: String,
    description: String,
    price: Number,
    pictures: [],
    materials: [],
    colors: [],
    size: Number,
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    outstanding: Boolean,
    slug: "",
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  var product = this;
  product.slug = slugify(product.name).toLowerCase();
  product.slug.replace("/,.=+[]{}<>/g", "");
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
