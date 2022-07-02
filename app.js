require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require('ejs');
const express = require('express');

// const encrypt = require('mongoose-encryption');

// const md5 = require('md5');

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);


// Set-up Express
const app = express();

console.log(process.env.API_KEY);
// console.log(md5('123456'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//Set up Data Base connection with local host using mongoose

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/secretsDB');
};

// Settting the initial schema

const secretSchema = new mongoose.Schema({
    title: String,
    content: String
});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
})

// userSchema.plugin(encrypt, {secret: process.env.SECRET_MESSAGE, encryptedFields: ['password']});

const secret = mongoose.model('secret', secretSchema);
const user = mongoose.model('user', userSchema);

// Routes

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

// GET login page and Log-in 

app.post("/login", function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
 
    user.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (bcrypt.compareSync(password, foundUser.password)) {
                    res.render("secrets");
                }
            }
        }
    });
});

// GET register page and register user

app.get("/register", function(req, res){
    res.render("register");
});
 
app.post("/register", function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const hash = bcrypt.hashSync(password, salt);
 
    const newUser = new user({
        email: email,
        password: hash
    });
 
    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
 
});

// Node.js port

app.listen(3000, function() {
  console.log("Server started on port 3000");
});