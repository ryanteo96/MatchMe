let nodemailer = require('nodemailer');

let senderAddress = 'matchme.cs407@gmail.com';
let senderPassword = 'matchme1!';

let resetPwEmail = function(receiver, newPassword){

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
		subject: "MatchMe - Reset Password",
		text: "New Password: " + newPassword,
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

module.exports = resetPwEmail;