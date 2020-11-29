const express = require("express");
const router = express.Router();
const product = require("./controllers/product");

router.get("/productos/listar", product.all);

module.exports = router;
