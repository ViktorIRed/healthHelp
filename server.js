const mongoose = require('mongoose');
const mongooseURL = "mongodb://localhost:27017/"
mongoose.connect(mongooseURL);
const express = require("express");
const { router } = require("./router");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser('secret-key'));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/", router);

app.listen(3000);