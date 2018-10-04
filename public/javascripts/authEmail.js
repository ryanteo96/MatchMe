let nodemailer = require('nodemailer');

let senderAddress = 'matchme.cs407@gmail.com';
let senderPassword = 'matchme1!';

let authEmail = function(receiver, token){
	let transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth:{
			user: senderAddress,
			pass: senderPassword
		}
	});

	const url = 'http://localhost:3000/confirmation/' + token;
	let mailOptions = {
	  from: senderAddress,
	  to: receiver,
	  subject: 'MatchMe Email Confirmation',
	  html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
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