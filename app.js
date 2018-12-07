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
var Conversation = require("./models/conversation");
var Message = require("./models/message");
var Activity = require("./models/Activity");
var authEmail = require("./public/javascripts/authEmail");
var resetPwEmail = require("./public/javascripts/resetPwEmail");
var nodemailer = require("nodemailer");
var generatePassword = require("password-generator");
var moment = require("moment");
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
	if (!req.user) {
		res.render("login");
	} else {
		res.redirect("/search");
	}
});

app.get("/search", isLoggedIn, function(req, res) {
	let search = req.query.search;
	let sort = req.query.sort;
	let type = req.query.type;
	if (search || sort || type) {
		//console.log(search, sort, type);
		if (sort == "time") {
			Activity.find({})
				.sort({
					datentime: 1,
				})
				.exec(function(err, activities) {
					if (err) throw err;
					keywords = [];
					for (i = 0; i < activities.length; i++) {
						for (
							j = 0;
							j < activities[i].activityKeywords.length;
							j++
						) {
							if (
								!keywords.includes(
									activities[i].activityKeywords[
										j
									].toLowerCase(),
								)
							) {
								keywords.push(
									activities[i].activityKeywords[
										j
									].toLowerCase(),
								);
							}
						}
					}
					activities = activities.filter(word =>
						word.activityName
							.toUpperCase()
							.includes(search.toUpperCase()),
					);
					if (type != "") {
						activities = activities.filter(word =>
							word.activityKeywords
								.map(e => e.toLowerCase())
								.includes(type),
						);
					}
					return res.render("search", {
						user: req.user,
						activities: activities,
						keywords: keywords,
						query: req.query,
						moment: require("moment"),
					});
				});
		} else if (sort == "alphabetical") {
			Activity.find({})
				.sort({
					activityName: "",
				})
				.exec(function(err, activities) {
					if (err) throw err;
					keywords = [];
					for (i = 0; i < activities.length; i++) {
						for (
							j = 0;
							j < activities[i].activityKeywords.length;
							j++
						) {
							if (
								!keywords.includes(
									activities[i].activityKeywords[
										j
									].toLowerCase(),
								)
							) {
								keywords.push(
									activities[i].activityKeywords[
										j
									].toLowerCase(),
								);
							}
						}
					}
					activities = activities.filter(word =>
						word.activityName
							.toUpperCase()
							.includes(search.toUpperCase()),
					);
					if (type != "") {
						activities = activities.filter(word =>
							word.activityKeywords
								.map(e => e.toLowerCase())
								.includes(type),
						);
					}
					return res.render("search", {
						user: req.user,
						activities: activities,
						keywords: keywords,
						query: req.query,
						moment: require("moment"),
					});
				});
		}
	} else {
		Activity.find({})
			.sort({
				datentime: 1,
			})
			.exec(function(err, activities) {
				if (err) throw err;
				keywords = [];
				for (i = 0; i < activities.length; i++) {
					for (
						j = 0;
						j < activities[i].activityKeywords.length;
						j++
					) {
						if (
							!keywords.includes(
								activities[i].activityKeywords[j].toLowerCase(),
							)
						) {
							keywords.push(
								activities[i].activityKeywords[j].toLowerCase(),
							);
						}
					}
				}
				return res.render("search", {
					user: req.user,
					activities: activities,
					keywords: keywords,
					query: req.query,
					moment: require("moment"),
				});
			});
	}
});

app.post("/search/getActivityDetails", function(req, res) {
	Activity.findOne(
		{
			_id: req.body.id,
		},
		function(err, activity) {
			object = {
				user: req.user,
				activity: activity,
			};
			res.send(object);
		},
	);
});

app.get("/needVerification", function(req, res) {
	if (req.user) {
		if (!req.user.verified) {
			req.session.destroy(function(err) {
				res.render("needVerification");
			});
		}
	} else {
		res.redirect("/search");
	}
});

app.get("/confirmation/:token", function(req, res) {
	User.findOne(
		{
			_id: req.params.token,
		},
		function(err, user) {
			user.verified = true;
			user.save();
			req.flash("verifySuccess", "Verified, please login");
			return res.render("login", {
				messages: req.flash("verifySuccess"),
			});
		},
	);
});

app.get("/register", function(req, res) {
	if (!req.user) {
		res.render("register");
	} else {
		res.redirect("/search");
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
				res.redirect("/search");
			});
		},
	);
});

app.get("/login", function(req, res) {
	if (!req.user) {
		res.render("login");
	} else {
		res.redirect("/search");
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
		if (user.status < 0) {
			req.flash(
				"logWarn",
				"You are Banned. Contact a System Administrator for help.",
			);
			return res.render("login", {
				messages: req.flash("logWarn"),
			});
		}
		req.logIn(user, function(err) {
			if (err) {
				return next(err);
			}
			return res.redirect("/search");
		});
	})(req, res, next);
});

app.get("/logout", function(req, res) {
	req.session.destroy(function(err) {
		res.redirect("/login");
	});
});

app.get("/forgotPassword", function(req, res) {
	res.render("forgotPassword");
});

app.post("/forgotPassword", function(req, res) {
	User.findOne(
		{
			username: req.body.username,
		},
		function(err, user) {
			if (!user) {
				req.flash("forgotPwWarn", "User does not exist.");
				return res.render("forgotPassword", {
					messages: req.flash("forgotPwWarn"),
				});
			}

			if (user) {
				var newPassword = generatePassword();

				User.findOne(
					{
						username: req.body.username,
					},
					function(err, user) {
						if (err) return next(err);

						user.setPassword(newPassword, function() {
							user.save();
						});
					},
				);

				resetPwEmail(user.username, newPassword);

				res.redirect("login");
			}
		},
	);
});

app.get("/settings", isLoggedIn, function(req, res) {
	res.render("settings", {
		user: req.user,
		error: req.flash("settingsSaveErrorWarn"),
		success: req.flash("settingsSaveSuccessWarn"),
	});
});

app.get("/messages", isLoggedIn, function(req, res) {
	User.findOne(
		{
			_id: req.user._id,
		},
		function(err, user) {
			res.render("messages", {
				user: req.user,
				moment: require("moment"),
			});
		},
	);
});

app.post("/settings/update", function(req, res, next) {
	if (!req.body.name) {
		req.body.name = req.user.name;
	}

	if (!req.body.username) {
		req.body.username = req.user.username;
	}

	User.updateOne(
		{
			_id: req.user._id,
		},
		{
			name: req.body.name,
			username: req.body.username,
		},
		function(err, user) {
			if (err) {
				req.flash(
					"settingsSaveErrorWarn",
					"Email has been taken. Please enter a  different email address.",
				);
				return res.redirect("/settings");
			}

			User.findOne(
				{
					_id: req.user._id,
				},
				function(err, user) {
					if (err) return next(err);

					user.setPassword(req.body.password, function() {
						user.save();
					});

					req.flash(
						"settingsSaveSuccessWarn",
						"User information has been successfully saved.",
					);

					req.logIn(user, function(err) {
						if (err) {
							return next(err);
						}
						return res.redirect("/settings");
					});
				},
			);
		},
	);
});

app.get("/admin", isAdmin, function(req, res) {
	User.find({}).exec(function(err, users) {
		if (err) throw err;
		console.log(users);
		res.render("admin", {
			users: users,
			user: req.user,
		});
	});
});

app.post("/settings/delete", function(req, res, next) {
	User.remove(
		{
			_id: req.user._id,
		},
		function(err, user) {
			if (err) return console.error(err);
			console.log("Successfully deleted");
			res.status(200).send();
			res.redirect("/");
		},
	);
});

app.post("/admin/delete", function(req, res, next) {
	var username = req.body.username;
	User.deleteOne(
		{
			username: username,
		},
		function(err, user) {
			if (err) {
				return console.error(err);
			}
			console.log("Successfully deleted by admin");
			res.redirect("/admin");
		},
	);
	console.log(username);
});

app.post("/admin/ban", function(req, res, next) {
	var username = req.body.username;
	User.updateOne(
		{
			username: username,
		},
		{
			status: -1,
		},
		function(err, user) {
			if (err) {
				req.flash("BanWarn", "Failed to Ban");
			}
			res.redirect("/admin");
			User.findOne(
				{
					username: username,
				},
				function(err, user) {
					if (err) return next(err);
				},
			);
		},
	);
});

app.post("/admin/unban", function(req, res, next) {
	var username = req.body.username;
	User.updateOne(
		{
			username: username,
		},
		{
			status: 1,
		},
		function(err, user) {
			if (err) {
				req.flash("UnbanWarn", "Failed to UnBan");
			}
			res.redirect("/admin");
			User.findOne(
				{
					username: username,
				},
				function(err, user) {
					if (err) return next(err);
				},
			);
		},
	);
});
app.post("/admin/resetAllPw", function(req, res, next) {
	User.find({}).exec(function(err, users) {
		if (err) throw err;
		users.forEach(function(user) {
			if (!user.admin) {
				var newPassword = generatePassword();

				User.findOne(
					{
						username: user.username,
					},
					function(err, user) {
						if (err) return next(err);

						user.setPassword(newPassword, function() {
							user.save();
						});
					},
				);

				resetPwEmail(user.username, newPassword);
			}
		});

		res.redirect("/admin");
	});
});

app.post("/admin/message", function(req, res, next) {
	var msg = req.body.msg_txt;
	console.log(msg);
	console.log(req.body.msg_txt);
	console.log(req.body.username);
	var username = req.body.username;
	User.findOne(
	{
		username: req.body.username
	},
	function(err, user)
	{
		User.updateOne
        ({
            username: req.body.username,
            }, {
                $push: {
                    admin_messages: req.body.msg_txt
                },
            },
            function (err) {
                    if (err) throw err;
                },
        );
        console.log(username);
        console.log(username.admin_messages);
		res.redirect("/admin");
	}
	);
});

app.get("/create", isLoggedIn, function(req, res) {
	res.render("create", {
		user: req.user,
		success: req.flash("createActivitySuccessWarn"),
		error: req.flash("createActivityErrorWarn"),
	});
});

app.post("/create", function(req, res, next) {
	var today = new Date();
	var datentime = moment(req.body.date + " " + req.body.time);

	if (!datentime.isValid() || datentime.isBefore(today)) {
		req.flash("createActivityErrorWarn", "Enter a valid date and time.");

		return res.redirect("/create");
	}

	Activity.create(
		{
			host: req.user.username,
			host_id: req.user._id,
			activityName: req.body.name,
			activityDescription: req.body.description,
			activityKeywords: req.body.keywords.split(","),
			datentime: moment(req.body.date + " " + req.body.time),
			location: req.body.location,
			maxMembers: req.body.members,
			currentMaxMembers: req.body.members,
		},
		function(err) {
			if (err) throw err;

			req.flash(
				"createActivitySuccessWarn",
				"Activity has been created successfully.",
			);

			return res.redirect("/create");
		},
	);
});

app.get("/profile/:id", isLoggedIn, function(req, res) {
	User.findOne(
		{
			_id: req.params.id,
		},
		function(err, user) {
			Activity.find(
				{
					host_id: req.params.id,
				},
				function(err, activities) {
					if (req.params.id == req.user._id) {
						res.render("profile", {
							user: user,
							currUser: req.user,
							curr: true,
							activities: activities,
							moment: require("moment"),
						});
					} else {
						res.render("profile", {
							user: user,
							currUser: req.user,
							curr: false,
							activities: activities,
							moment: require("moment"),
						});
					}
				},
			);
		},
	);
});

app.get("/joined", isLoggedIn, function(req, res) {
	User.findOne(
		{
			_id: req.user._id,
		},
		function(err, user) {
			res.render("joined", {
				user: req.user,
				activities: user.joined,
				moment: require("moment"),
			});
		},
	);
});

app.get("/editGroup", isLoggedIn, function(req, res) {
	Activity.find(
		{
			host_id: req.user._id,
		},
		function(err, activities) {
			res.render("editGroup", {
				user: req.user,
				activities: activities,
				error: req.flash("editGroupErrorWarn"),
				moment: require("moment"),
			});
		},
	);
});

app.post("/editGroup/edit", function(req, res, next) {
	Activity.findOne(
		{
			_id: req.body._id,
		},
		function(err, activity) {
			if (
				activity.maxMembers - activity.currentMaxMembers >
				req.body.members
			) {
				req.flash("editGroupErrorWarn", "Invalid number of members.");
				return res.redirect("/editGroup");
			}

			console.log(
				req.body.members -
					(activity.maxMembers - activity.currentMaxMembers),
			);

			Activity.updateOne(
				{
					_id: req.body._id,
				},
				{
					activityName: req.body.name,
					activityDescription: req.body.description,
					maxMembers: req.body.members,
					currentMaxMembers:
						req.body.members -
						(activity.maxMembers - activity.currentMaxMembers),
					activityKeywords: req.body.keywords.split(","),
					location: req.body.location,
					datentime: moment(req.body.date + " " + req.body.time),
				},
				function(err, user) {
					res.redirect("/profile");
				},
			);
		},
	);
});

app.post("/delete", function(req, res, next) {
	Activity.deleteOne(
		{
			_id: req.body.id,
		},
		function(err) {
			if (err) return handleError(err);
			res.send("0");
		},
	);
});

app.post("/join", function(req, res, next) {
	console.log(req.user._id);
	console.log(req.body.id);

	User.findOne(
		{
			_id: req.user._id,
		},
		function(err, user) {
			Activity.updateOne(
				{
					_id: req.body.id,
				},
				{
					$push: {
						requestList: user,
					},
				},
				function(err) {
					if (err) throw err;
				},
			);
		},
	);

	Activity.findOne(
		{
			_id: req.body.id,
		},
		function(err, activity) {
			User.updateOne(
				{
					_id: req.user._id,
				},
				{
					$push: {
						requested: activity,
					},
				},
				function(err) {
					if (err) throw err;
				},
			);
		},
	);

	res.redirect("/search");
});

app.post("/deny", function(req, res, next) {
	User.findOne(
		{
			_id: req.body.memberId,
		},
		function(err, user) {
			User.updateOne(
				{
					_id: req.body.memberId,
				},
				{
					requested: user.requested.filter(function(obj) {
						return obj._id != req.body.activityId;
					}),
				},
				function(err) {
					if (err) throw err;
				},
			);
		},
	);

	Activity.findOne(
		{
			_id: req.body.activityId,
		},
		function(err, activity) {
			Activity.updateOne(
				{
					_id: req.body.activityId,
				},
				{
					requestList: activity.requestList.filter(function(obj) {
						return obj._id != req.body.memberId;
					}),
				},
				function(err) {
					if (err) throw err;
				},
			);
		},
	);

	res.send("0");
});

app.post("/accept", function(req, res, next) {
	User.findOne(
		{
			_id: req.body.memberId,
		},
		function(err, user) {
			Activity.findOne(
				{
					_id: req.body.activityId,
				},
				function(err, activity) {
					User.updateOne(
						{
							_id: req.body.memberId,
						},
						{
							requested: user.requested.filter(function(obj) {
								return obj._id != req.body.activityId;
							}),
							$push: {
								joined: activity,
							},
						},
						function(err) {
							if (err) throw err;
						},
					);
				},
			);
		},
	);

	Activity.findOne(
		{
			_id: req.body.activityId,
		},
		function(err, activity) {
			User.findOne(
				{
					_id: req.body.memberId,
				},
				function(err, member) {
					Activity.updateOne(
						{
							_id: req.body.activityId,
						},
						{
							requestList: activity.requestList.filter(function(
								obj,
							) {
								return obj._id != req.body.memberId;
							}),
							$push: {
								memberList: member,
							},
							currentMaxMembers: activity.currentMaxMembers - 1,
						},
						function(err) {
							if (err) throw err;
						},
					);
				},
			);
		},
	);

	res.send("0");
});

app.post("/remove", function(req, res, next) {
	User.findOne(
		{
			_id: req.body.memberId,
		},
		function(err, user) {
			User.updateOne(
				{
					_id: req.body.memberId,
				},
				{
					joined: user.joined.filter(function(obj) {
						return obj._id != req.body.activityId;
					}),
				},
				function(err) {
					if (err) throw err;
				},
			);
		},
	);

	Activity.findOne(
		{
			_id: req.body.activityId,
		},
		function(err, activity) {
			Activity.updateOne(
				{
					_id: req.body.activityId,
				},
				{
					memberList: activity.memberList.filter(function(obj) {
						return obj._id != req.body.memberId;
					}),
					currentMaxMembers: activity.currentMaxMembers + 1,
				},
				function(err) {
					if (err) throw err;
				},
			);
		},
	);

	res.send("0");
});

function isAdmin(req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.admin) {
			return next();
		}
	}
	res.redirect("/search");
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

function getConversations(req, res, next) {
	// Only return one message from each conversation to display as snippet
	Conversation.find({ participants: req.user._id })
		.select("_id")
		.exec((err, conversations) => {
			if (err) {
				res.send({ error: err });
				return next(err);
			}

			// Set up empty array to hold conversations + most recent message
			const fullConversations = [];
			conversations.forEach(conversation => {
				Message.find({ conversationId: conversation._id })
					.sort("-createdAt")
					.limit(1)
					.populate({
						path: "author",
						select: "profile.firstName profile.lastName",
					})
					.exec((err, message) => {
						if (err) {
							res.send({ error: err });
							return next(err);
						}
						fullConversations.push(message);
						if (fullConversations.length === conversations.length) {
							return res
								.status(200)
								.json({ conversations: fullConversations });
						}
					});
			});
		});
}

app.get("/chat", isLoggedIn, function(req, res, next) {
	res.render("chat", {
		user: req.user,
	});
});

// Retrieve single conversation
app.get("/char/:conversationId", isLoggedIn, getConversation, function(
	req,
	res,
	next,
) {});

// Send reply in conversation
app.post("/chat/:conversationId", isLoggedIn, sendReply);

// Start new conversation
app.post("/chat/new/:recipient", isLoggedIn, newConversation);

function getConversations(req, res, next) {
	Conversation.find({ participants: req.user._id })
		.select("_id")
		.exec((err, conversations) => {
			if (err) {
				res.send({ error: err });
				return next(err);
			}
			const fullConversations = [];
			conversations.forEach(conversation => {
				Message.find({ conversationId: conversation._id })
					.sort("-createdAt")
					.limit(1)
					.populate({
						path: "author",
						select: "profile.firstName profile.lastName",
					})
					.exec((err, message) => {
						if (err) {
							res.send({ error: err });
							return next(err);
						}
						fullConversations.push(message);
						if (fullConversations.length === conversations.length) {
							return res
								.status(200)
								.json({ conversations: fullConversations });
						}
					});
			});
		});
}

function getConversation(req, res, next) {
	Message.find({ conversationId: req.params.conversationId })
		.select("createdAt body author")
		.sort("-createdAt")
		.populate({
			path: "author",
			select: "profile.firstName profile.lastName",
		})
		.exec((err, messages) => {
			if (err) {
				res.send({ error: err });
				return next(err);
			}

			return res.status(200).json({ conversation: messages });
		});
}

function newConversation(req, res, next) {
	if (!req.params.recipient) {
		res.status(422).send({
			error: "Please choose a valid recipient for your message.",
		});
		return next();
	}

	if (!req.body.composedMessage) {
		res.status(422).send({ error: "Please enter a message." });
		return next();
	}

	const conversation = new Conversation({
		participants: [req.user._id, req.params.recipient],
	});

	conversation.save((err, newConversation) => {
		if (err) {
			res.send({ error: err });
			return next(err);
		}

		const message = new Message({
			conversationId: newConversation._id,
			body: req.body.composedMessage,
			author: req.user._id,
		});

		message.save((err, newMessage) => {
			if (err) {
				res.send({ error: err });
				return next(err);
			}

			return res.status(200).json({
				message: "Conversation started!",
				conversationId: conversation._id,
			});
		});
	});
}

function sendReply(req, res, next) {
	const reply = new Message({
		conversationId: req.params.conversationId,
		body: req.body.composedMessage,
		author: req.user._id,
	});

	reply.save((err, sentReply) => {
		if (err) {
			res.send({ error: err });
			return next(err);
		}

		return res.status(200).json({ message: "Reply successfully sent!" });
	});
}

module.exports = app;
