const express = require("express");
const router = express.Router();
const product = require("./controllers/product");
const category = require("./controllers/category");
const authController = require("./controllers/authController");
const checkJwt = require("express-jwt");
const seeder = require("./seeder");

router.get("/data", seeder.data);
router.get("/productos", product.all);
router.get("/productos/:slug", product.show);

router.post("/token/login/admin", authController.adminLogin);
router.patch("/token/logout/admin", authController.adminLogout);

router.use(checkJwt({ secret: process.env.SECRET, algorithms: ["HS256"] }));

router.get("/productos/lista/categorias", category.show);
router.post("/admin/categorias", category.store);

router.post("/admin/productos", product.store);
router.patch("/admin/productos", product.update);
router.put("/admin/productos", product.updateImg);
router.delete("/admin/productos/:slug", product.delete);

module.exports = router;
