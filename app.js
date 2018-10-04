var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");
var User = require("./models/User");
var authEmail = require('./public/javascripts/authEmail');
var resetPwEmail = require('./public/javascripts/resetPwEmail');
var nodemailer = require("nodemailer");
var generatePassword = require("password-generator");
var app = express();
app.use(flash());

mongoose
	.connect(
		"mongodb://matchers:matchme1!@ds113703.mlab.com:13703/match-me",
		{
			useNewUrlParser: true,
		},
	)
	.then(() => console.log("connection succesful"))
	.catch(err => console.error(err));

app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);
app.use(
	require("express-session")({
		secret: "matchme is awesome",
		resave: false,
		saveUninitialized: false,
	}),
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
	if(!req.user) {
        res.render("login");
    }
    else {
        res.redirect('/index');
    }
});

app.get("/index", isLoggedIn, function(req, res) {
	if(!req.user.verified){
		res.redirect('/needVerification');
	} else if(req.user.needResetPW){
		//redirect to reset password page
	} else {
		res.render("index",{ "user": req.user });
	}
});

app.get("/needVerification", function(req, res) {
	if(req.user){
		if(!req.user.verified) {
			req.session.destroy(function (err) {
				res.render("needVerification");
			});
		}
	} else {
        res.redirect('/index');
    }
});

app.get('/confirmation/:token', function (req, res) {
	User.findOne({ _id: req.params.token }, function(err, user) {
		user.verified = true;
		user.save();
		req.flash("verifySuccess", "Verified, please login");
		return res.render('login', {
                messages: req.flash('verifySuccess')
        });
	});
});

app.get("/register", function(req, res) {
    if(!req.user) {
        res.render("register");
    }
    else {
        res.redirect('/index');
    }
});

app.post("/register", function(req, res) {
    User.register(
        new User({
            username: req.body.username,
            name: req.body.name,
			needResetPW: false,
			verified: false,
			admin: false,
			status: 1,
        }),
        req.body.password,
        function(err, user) {
            if (err) {
                req.flash("regWarn", "Please Use Different Email Address");
                return res.render("register", {
                    messages: req.flash("regWarn"),
                });
            }
            passport.authenticate("local")(req, res, function() {
				authEmail(user.username, user._id);
                res.redirect("/index");
            });
        },
    );
});

app.get("/login", function(req, res) {
    if(!req.user) {
        res.render("login");
    }
    else {
        res.redirect('/index');
    }
});

app.post("/login", function(req, res, next) {
	passport.authenticate("local", function(err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			req.flash("logWarn", "Invalid Username or Password");
			return res.render("login", {
				messages: req.flash("logWarn"),
			});
        }
        if(user.status < 0 ) {
            req.flash('logWarn', "You are Banned. Contact a System Administrator for help.");
            return res.render('login', {
                messages: req.flash('logWarn')
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
			return res.redirect('index');
        })
    })(req, res, next);
});


app.get("/logout", function(req, res) {
	req.session.destroy(function (err) {
        res.redirect('/login');
    });
});

app.get("/forgotPassword", function(req, res) {
	res.render("forgotPassword");
});

app.post("/forgotPassword", function(req, res) {
	User.findOne({ username: req.body.username }, function(err, user) {
		if (!user) {
			req.flash("forgotPwWarn", "User does not exist.");
			return res.render("forgotPassword", {
				messages: req.flash("forgotPwWarn"),
			});
		}

		if (user) {
			var newPassword = generatePassword();

			User.findOne({ username: req.body.username }, function(err, user) {
				if (err) return next(err);

				user.setPassword(newPassword, function() {
					user.save();
				});
			});

			resetPwEmail(user.username, newPassword);

			res.redirect("login");

		}
	});
});

app.get("/profile", isLoggedIn, function(req, res) {
	res.render("profile", { user: req.user });
});

app.post("/profile/update", function(req, res, next) {
	User.updateOne(
		{ _id: req.user._id },
		{
			name: req.body.name,
			username: req.body.username,
		},
		function(err, user) {
			if (err) {
				req.flash(
					"profileSaveErrorWarn",
					"Email has been taken. Please enter a  different email address.",
				);
				return res.render("profile", {
					error: req.flash("profileSaveErrorWarn"),
					user: req.user,
				});
			}

			User.findOne({ _id: req.user._id }, function(err, user) {
				if (err) return next(err);

				user.setPassword(req.body.password, function() {
					user.save();
				});

				req.flash(
					"profileSaveSuccessWarn",
					"User information has been successfully saved.",
				);

				req.logIn(user, function(err) {
					if (err) {
						return next(err);
					}
					return res.render("profile", {
						success: req.flash("profileSaveSuccessWarn"),
						user: user,
					});
				});
			});
		},
	);
});


app.get("/admin", isAdmin,  function (req, res) {
   User.find({}).exec(function (err, users) {
       if(err) throw err;
       console.log(users);
       res.render("admin", { "users": users });
   })
})


app.post("/profile/delete", function(req, res, next) {
	User.remove(
		{ _id: req.user._id }, function(err, user) {
			if (err)
				return console.error(err);
			console.log('Successfully deleted');
			res.status(200).send();
            res.redirect('/');
		}
		);
});

app.post("/admin/delete", function(req, res, next) {
	var username = req.body.username;
	User.deleteOne(
		{ username: username }, function(err, user) {
			if(err){
                return console.error(err);
            }
			console.log('Successfully deleted by admin');
			res.redirect('/admin');
		}
		);
	console.log(username);
});

app.post("/admin/ban", function(req, res, next) {
	var username = req.body.username;
	User.updateOne(
		{ username: username },
		{
			status: -1,
		},
		function(err, user) {
			if (err) {
				req.flash(
					"BanWarn",
					"Failed to Ban",
				);
			}
			res.redirect("/admin");
			User.findOne({ username: username }, function(err, user) {
				if (err) return next(err);
			});
		},

	);
});

app.post("/admin/resetAllPw", function(req, res, next){
	User.find({}).exec(function (err, users) {
       if(err) throw err;
       users.forEach(function(user){
			if(!user.admin){
				var newPassword = generatePassword();

				User.findOne({ username: user.username }, function(err, user) {
					if (err) return next(err);

					user.setPassword(newPassword, function() {
						user.save();
					});
				});

				resetPwEmail(user.username, newPassword);
			}
	   });
	   
	   res.redirect("/admin");
   })
});

function isAdmin(req, res, next){
    if(req.isAuthenticated()) {
        if(req.user.admin) {
            return next();
        }
    }
    res.redirect("/index");
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

module.exports = app;