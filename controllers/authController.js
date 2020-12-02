const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

module.exports = {
  adminLogin: async (req, res) => {
    let admin = await Admin.findOne({ email: req.body.email });

    if (!admin) {
      res.json({ Error: "Datos incorrectos1" });
    } else {
      const result = await bcrypt.compare(req.body.password, admin.password);

      if (!result) {
        res.json({ Error: "Datos incorrectos2" });
      } else {
        const token = jwt.sign(
          {
            id: admin.id,
            firstname: admin.firstname,
            lastname: admin.lastname,
          },
          process.env.SECRET
        );
        admin.tokens.push(token);
        admin.save();

        res.json({ token });
      }
    }
  },
  adminLogout: async (req, res) => {
    const admin = await Admin.findOne({ email: req.body.email });
    admin.tokens = admin.tokens.filter((token) => req.body.token !== token);
    admin.save();
    res.json({ Exitoso: "Te deslogueaste correctamente" });
  },
};
