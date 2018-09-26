var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/User');

var app = express();

mongoose.connect('mongodb://matchers:matchme1!@ds113703.mlab.com:13703/match-me')
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(require("express-session")({
    secret: "matchme is awesome",
    resave: false,
    saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.render("login");
});

app.get("/index", isLoggedIn, function (req, res) {
    res.render("index");
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    User.register(new User({
        username: req.body.username,
        name: req.body.name
    }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/index");
        });
    });
});

app.get("/login", function (req, res) {
    res.render("login");
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/index",
    failureRedirect: "/login"
}), function (req, res) {
    res.send("User is " + req.user.id);
});
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect('/');

})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = app;