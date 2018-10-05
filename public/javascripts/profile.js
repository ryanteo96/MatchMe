$(document).ready(function() {
	var password = document.getElementById("password");
	var confirmPassword = document.getElementById("confirmPassword");

	var username = document.getElementById("username");
	var confirmUsername = document.getElementById("confirmUsername");

	function validatePassword() {
		if (password.value != confirmPassword.value) {
			confirmPassword.setCustomValidity("Passwords does not match.");
		} else {
			confirmPassword.setCustomValidity("");
		}
	}

	function validateUsername() {
		if (username.value != confirmUsername.value) {
			confirmUsername.setCustomValidity("Emails do not match.");
		} else {
			confirmUsername.setCustomValidity("");
		}
	}

	password.onchange = validatePassword;
	confirmPassword.onkeyup = validatePassword;
	username.onchange = validateUsername;
	confirmUsername.onkeyup = validateUsername;
});
