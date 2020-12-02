const Admin = require("../models/Admin");

module.exports = {
  isAdmin: async (req, res, next) => {
    if (req.user.id) {
      const admin = await Admin.findById(req.user.id);

      if (admin.active) {
        next();
      } else {
        res.status(404).json("Error");
      }
    }
  },
};
