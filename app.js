require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const ejs = require('ejs');
const express = require('express');

// Google Oauth startegy constant

const GoogleStrategy = require('passport-google-oauth20').Strategy;

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
const LocalStrategy = require("passport-local");


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
    password: String,
    googleId: String,
});

// passport-mongoose initialize

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Secret initialize

// userSchema.plugin(encrypt, {secret: process.env.SECRET_MESSAGE, encryptedFields: ['password']});

const secret = mongoose.model('secret', secretSchema);
const user = mongoose.model('user', userSchema);

// passport global strategy
passport.use(user.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    user.findById(id, function (err, user) {
        done(err, user);
    });
});

// GOOGLE Oauth strategy

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    user.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// Routes

app.get("/", function(req, res){
    res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login", function(req, res){
    res.render("login");
});

// GET login page and Log-in 

app.post("/login", passport.authenticate("local",{
    successRedirect: "/secrets",
    failureRedirect: "/login",
}), function(req, res){
    res.redirect("/login")
});

// GET register page and register user

app.get("/register", function(req, res){
    res.render("register");
});

// check if isLoggedIn and redirect

app.get("/secrets", function(req, res){
    if (req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});
 
app.post("/register", function (req, res) {
    user.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            console.log(req.body.username)
            res.redirect("/register")
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
      });
});

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