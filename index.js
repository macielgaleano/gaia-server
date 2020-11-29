require("dotenv").config();
const express = require("express");
const router = require("./routes");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(router);

app.listen(process.env.APP_PORT, () => {
  console.log("listening on 8000");
});
