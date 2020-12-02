const express = require("express");
const router = express.Router();
const product = require("./controllers/product");
const authController = require("./controllers/authController");
const checkJwt = require("express-jwt");
const seeder = require("./seeder");

router.get("/data", seeder.data);
router.get("/productos", product.all);
router.get("/productos/:slug", product.show);

router.post("/token/login/admin", authController.adminLogin);
router.patch("/token/logout/admin", authController.adminLogout);

router.use(checkJwt({ secret: process.env.SECRET, algorithms: ["HS256"] }));

router.post("/admin/productos", product.store);
router.patch("/admin/productos", product.update);
router.put("/admin/productos", product.updateImg);

module.exports = router;
