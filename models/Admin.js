const mongoose = require("mongoose");
const Schema = mongoose.Schema;
bcrypt = require("bcryptjs");
SALT_WORK_FACTOR = 10;

const adminSchema = new Schema(
  {
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    active: Boolean,
    tokens: [],
  },
  { timestamps: true }
);

adminSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.hashPassword = async function (password) {
  return bcrypt.hashSync(password, 10);
};

adminSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
