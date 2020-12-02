const db = require("mongoose");

db.set("useNewUrlParser", true);
db.set("useUnifiedTopology", true);
db.connect(process.env.DB_CONNECTION);

db.connection.once("open", () => console.log("conectado"));

module.exports = db;
