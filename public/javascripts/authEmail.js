let nodemailer = require('nodemailer');

let senderAddress = 'matchme.cs407@gmail.com';
let senderPassword = 'matchme1!';

let authEmail = function(receiver){
	let transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth:{
			user: senderAddress,
			pass: senderPassword
		}
	});

	let mailOptions = {
	  from: senderAddress,
	  to: receiver,
	  subject: 'MatchMe Email Confirmation',
	  html: '<h1>Welcome to MatchMe!</h1>&nbsp<p>Thanks for registering.<br/>MatchMe</p>'
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
		console.log(error);
	  } else {
		console.log('Email sent: ' + info.response);
		console.log('Sent to:' + receiver);
	  }
	});

};

module.exports = authEmail;