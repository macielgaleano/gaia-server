const db = require("../models/db");
const Product = require("../models/Product");
const axios = require("axios");
var slugify = require("slugify");
const formidable = require("formidable");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { deleteOne } = require("../models/Product");

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
        res.status(400).json({ status: 400, messagge: "el producto no existe" });
      }
    }
    res.status(404).json({ status: 400, messagge: "La url es invalida" });
  },

  delete: async (req, res) => {
    if (req.params.slug) {
      await deleteOne({ slug: slug }, (err, res) => {
        if (err) {
          res
            .status(404)
            .json({ status: 500, messagge: "Error interno o producto invalido" });
        } else {
          res
            .status(200)
            .json({ status: 200, messagge: "producto elminado correctamente" });
        }
      });
    } else {
      res.status(404).json({ status: 400, messagge: "Producto invalido" });
    }
  },

  update: async (req, res) => {
    let product = await Product.findOne({ slug: req.params.slug }).populate("category");
    if (product) {
      product.name = req.params.name;
      product.description = req.params.description;
      product.price = req.params.price;
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
        const ext = path.extname(files.avatar.path);
        const newFileName = `image_${Date.now()}${ext}`;
        const params = {
          ACL: "public-read",
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `pictures/${newFileName}`,
          ContentType: files.avatar.type,
          Body: fs.createReadStream(files.avatar.path),
        };
        s3.upload(params, async function (err, data) {
          console.log(fields);
          const product = new Product({
            name: fields.name,
            description: fields.description,
            price: fields.price,
            pictures: [data.location],
            stock: fields.stock,
            colors: fields.colorss,
            materials: fields.materials,
            size: fields.size,
            category: fields.category,
            outstanding: fields.outstanding,
          });
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
          const product = await Product.find({ slug: fields.slug });
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
