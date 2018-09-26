var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://matchers:matchme1!@ds113703.mlab.com:13703/match-me')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

var index = require('./routes/index');
var users = require('./routes/users');

var cors = require('cors')
var app = express();

app.use(cors())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// passport configuration
// file user.js has the configuration for login and register
var User = require('./models/User');


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




module.exports = app;
