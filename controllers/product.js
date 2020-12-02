const db = require("../models/db");
const Product = require("../models/Product");
const axios = require("axios");
var slugify = require("slugify");
const formidable = require("formidable");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_ACCESS_SECRET,
});

var readOnlyAnonUserPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "AddPerm",
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject"],
      Resource: [""],
    },
  ],
};

module.exports = {
  all: async (req, res) => {
    res.json(await Product.find({}).populate("category"));
  },
  show: async (req, res) => {
    if (req.params.slug) {
      let product = await Product.findOne({ slug: req.params.slug }).populate("category");
      if (product) {
        res.json(product);
      } else {
        es.status(400).json({ status: 400, messagge: "el producto no existe" });
      }
    }
    res.status(404).json({ status: 400, messagge: "La url es invalida" });
  },
  update: async (req, res) => {
    let product = await Product.findOne({ slug: req.params.slug }).populate("category");
    if (product) {
      product.name = req.params.name;
      product.description = req.params.description;
      product.price = req.params.price;
      product.pictures = req.params.pictures;
      product.materials = req.params.materials;
      product.colors = req.params.colors;
      product.size = req.params.size;
      product.category = req.params.category;
      product.outstanding = req.params.outstanding;
      product.slug = slugify(req.params.slug);
      product.save();
      res
        .status(200)
        .json({ status: 200, messagge: "producto modificado correctamente" });
    } else {
      res.status(400).json({ status: 400, messagge: "el producto no existe" });
    }
  },
  store: async (req, res) => {
    let bucketResource = "arn:aws:s3:::" + process.env.AWS_BUCKET_NAME + "/*";
    readOnlyAnonUserPolicy.Statement[0].Resource[0] = bucketResource;
    let bucketPolicyParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Policy: JSON.stringify(readOnlyAnonUserPolicy),
    };
    s3.putBucketPolicy(bucketPolicyParams, function (err, data) {
      if (err) {
        res.status(500).json({ message: "Internal server error" + err });
      } else {
        console.log("Success");
      }
    });
    s3.createBucket({ Bucket: process.env.AWS_BUCKET_NAME }, function (err, data) {
      if (err) res.status(500).json({ message: "Internal server error" + err });
      else console.log("Bucket Created Successfully", data.Location);
    });

    const form = formidable({
      multiples: true,
      keepExtensions: true,
    });
    form.parse(req, async (err, fields, files) => {
      if (files) {
        console.log(files);
        const ext = path.extname(files.avatar.path);
        const newFileName = `image_${Date.now()}${ext}`;
        const params = {
          ACL: "public-read",
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `pictures/${newFileName}`,
          ContentType: files.picture.type,
          Body: fs.createReadStream(files.avatar.path),
        };
        s3.upload(params, async function (err, data) {
          const product = new Product({
            name: req.params.name,
            description: req.params.description,
            price: req.params.price,
            pictures: [data.Location],
            stock: req.params.stock,
            colors: req.params.colorss,
            materials: req.params.materials,
            size: req.params.size,
            category: req.params.category,
            outstanding: req.params.outstanding,
            slug: slugify(req.params.name),
          });
          products_list.push(product);
          await product.save();
          return res.json({ status: 200, data: data.location, product: product });
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    });
  },

  updateImg: async (req, res) => {
    let bucketResource = "arn:aws:s3:::" + process.env.AWS_BUCKET_NAME + "/*";
    readOnlyAnonUserPolicy.Statement[0].Resource[0] = bucketResource;
    let bucketPolicyParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Policy: JSON.stringify(readOnlyAnonUserPolicy),
    };
    s3.putBucketPolicy(bucketPolicyParams, function (err, data) {
      if (err) {
        res.status(500).json({ message: "Internal server error" + err });
      } else {
        console.log("Success");
      }
    });
    s3.createBucket({ Bucket: process.env.AWS_BUCKET_NAME }, function (err, data) {
      if (err) res.status(500).json({ message: "Internal server error" + err });
      else console.log("Bucket Created Successfully", data.Location);
    });

    const form = formidable({
      multiples: true,
      keepExtensions: true,
    });
    form.parse(req, async (err, fields, files) => {
      if (files) {
        console.log(files);
        const ext = path.extname(files.avatar.path);
        const newFileName = `image_${Date.now()}${ext}`;
        const params = {
          ACL: "public-read",
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `pictures/${newFileName}`,
          ContentType: files.picture.type,
          Body: fs.createReadStream(files.avatar.path),
        };
        s3.upload(params, async function (err, data) {
          const product = await Product.find({ slug: req.params.id });
          product.picture = [data.Location];
          product.sava();
          return res.json({ status: 200, data: data.location });
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    });
  },
};
