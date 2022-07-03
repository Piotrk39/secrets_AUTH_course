require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require('ejs');
const express = require('express');

// Mongoose encryption

// const encrypt = require('mongoose-encryption');

// MD5 encryption

// const md5 = require('md5');

// Bcrypt js encryption

// const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync(10);

// Passport and express-session

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


// Set-up Express
const app = express();

console.log(process.env.API_KEY);
// console.log(md5('123456'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// Set up the Session

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));

// Set up passport

app.use(passport.initialize());
app.use(passport.session());

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
});

// passport-mongoose initialize

userSchema.plugin(passportLocalMongoose);

// Secret initialize

// userSchema.plugin(encrypt, {secret: process.env.SECRET_MESSAGE, encryptedFields: ['password']});

const secret = mongoose.model('secret', secretSchema);
const user = mongoose.model('user', userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// Routes

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

// GET login page and Log-in 

app.post("/login", passport.authenticate("local",{
    successRedirect: "/secrets",
    failureRedirect: "/login"
}), function(req, res){
    
});

// GET register page and register user

app.get("/register", function(req, res){
    res.render("register");
});

// check if isLoggedIn and redirect

app.get("/secrets", function(req, res){
    res.render("secrets");
});
 
app.post("/register", function (req, res) {
    user.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
      });
});

// Logout
// app.get("/logout", function(req,res){
//         req.logout((err)=>{
//             if(err){
//                 console.log(err);
//             }else{
//                 res.redirect("/");
//             }
//         });
//     });

// LOGOUT PART is not really loggin out the user it is just redirecting him to the differetn page

app.get('/logout', function(req, res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });
});

// Node.js port

app.listen(3000, function() {
  console.log("Server started on port 3000");
});