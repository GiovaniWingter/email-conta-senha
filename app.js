const express = require("express");
const app = express();
const env = require("dotenv").config();

var session = require("express-session");
app.use(
  session({
    secret: "HELLo nODE",
    resave: false,
    saveUninitialized: false,
}));

app.use(express.static("./app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var rotas = require("./app/routes/router");
app.use("/", rotas);

app.listen(process.env.APP_PORT, () => {
  console.log(`Servidor online...\nhttp://localhost:${process.env.APP_PORT}`);
}); 