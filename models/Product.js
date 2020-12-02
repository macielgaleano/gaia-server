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
  var user = this;
  user.slug = slugify(user.name).toLowerCase();
  user.slug.replace("/,.=+[]{}<>/g", "");
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
