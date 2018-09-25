var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/User");

var userController = {};

// You need to be logged in to get to root page
userController.index = function(req, res) {
  res.render('index', { user : req.user });
};
userController.home = function(req, res) {
  res.render('home', { user : req.user });
};
// Go to registration page
userController.register = function(req, res) {
  res.render('register');
};

// Once you register add user and login and have state
userController.doRegister = function(req, res) {
  User.register(new User({ username : req.body.username, name: req.body.name }), req.body.password, function(err, user) {
    if (err) {
      return res.render('register', { user : user });
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
};

// Go to login page
userController.login = function(req, res) {
  res.render('login');
};

// When you login keep state and got to page
userController.doLogin = function(req, res) {
  passport.authenticate('local')(req, res, function () {
    res.redirect('/');
  });
};

// logout
userController.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

module.exports = userController;
