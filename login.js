document.addEventListener("DOMContentLoaded", function () {
	var form = document.getElementById("login-form");
	var usernameInput = document.getElementById("username");
	var passwordInput = document.getElementById("password");
	var rememberMeCheckbox = document.getElementById("remember-me");
	var forgotToggleButton = document.getElementById("forgot-password-toggle");
	var forgotPanel = document.getElementById("forgot-password-panel");
	var forgotSubmitButton = document.getElementById("forgot-password-submit");
	var forgotUsernameInput = document.getElementById("forgot-username");
	var forgotNewPasswordInput = document.getElementById("forgot-new-password");
	var forgotConfirmPasswordInput = document.getElementById("forgot-confirm-password");

	function initPasswordToggles() {
		document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
			button.addEventListener("click", function () {
				var inputId = button.getAttribute("data-toggle-password");
				var input = inputId ? document.getElementById(inputId) : null;
				if (!input) return;

				var isHidden = input.type === "password";
				input.type = isHidden ? "text" : "password";
				button.textContent = isHidden ? "Hide" : "Show";
			});
		});
	}

	// Testing: 10 minutes | Production: 3 * 7 * 24 * 60 * 60 * 1000 (3 weeks)
	var THREE_WEEKS_MS = 3 * 7 * 24 * 60 * 60 * 1000;

	function getDatabase() {
		if (typeof mockDatabase !== "undefined") {
			return mockDatabase;
		}
		try {
			var raw = localStorage.getItem("mockDatabase");
			return raw ? JSON.parse(raw) : null;
		} catch (error) {
			return null;
		}
	}

	function findUserByUsername(db, username) {
		if (!db || !Array.isArray(db.users)) {
			return null;
		}
		return db.users.find(function (user) {
			return user && user.username === username;
		}) || null;
	}

	function getRememberMeToken() {
		try {
			var token = localStorage.getItem("rememberMeToken");
			if (!token) return null;
			return JSON.parse(token);
		} catch (error) {
			return null;
		}
	}

	function saveRememberMeToken(username, password) {
		var token = {
			username: username,
			password: password,
			expiresAt: Date.now() + THREE_WEEKS_MS
		};
		localStorage.setItem("rememberMeToken", JSON.stringify(token));
	}

	function clearRememberMeToken() {
		localStorage.removeItem("rememberMeToken");
	}

	function updateRememberMeExpiration() {
		var token = getRememberMeToken();
		if (token) {
			token.expiresAt = Date.now() + THREE_WEEKS_MS;
			localStorage.setItem("rememberMeToken", JSON.stringify(token));
		}
	}

	function isRememberMeValid() {
		var token = getRememberMeToken();
		if (!token) return false;
		return Date.now() < token.expiresAt;
	}

	function performLogin(username, password) {
		var db = getDatabase();
		var user = findUserByUsername(db, username);
		if (!user) {
			return false;
		}

		if (!password || user.password !== password) {
			return false;
		}

		localStorage.setItem("currentUserId", user.id);
		return true;
	}

	function findUserByIdentifier(db, usernameOrEmail) {
		if (!db || !Array.isArray(db.users)) {
			return null;
		}

		var key = String(usernameOrEmail || "").trim().toLowerCase();
		return db.users.find(function (user) {
			if (!user) return false;
			var username = String(user.username || "").trim().toLowerCase();
			var email = String(user.email || "").trim().toLowerCase();
			return username === key || email === key;
		}) || null;
	}

	function persistDatabase(db) {
		if (typeof mockDatabase !== "undefined") {
			mockDatabase = db;
		}
		localStorage.setItem("mockDatabase", JSON.stringify(db));
	}

	function resetPasswordLocally(usernameOrEmail, newPassword, confirmNewPassword) {
		if (!usernameOrEmail || !newPassword || !confirmNewPassword) {
			throw new Error("usernameOrEmail, newPassword, and confirmNewPassword are required");
		}

		if (String(newPassword).length < 6) {
			throw new Error("Password must be at least 6 characters");
		}

		if (String(newPassword) !== String(confirmNewPassword)) {
			throw new Error("Password confirmation does not match");
		}

		var db = getDatabase() || { users: [] };
		var user = findUserByIdentifier(db, usernameOrEmail);
		if (!user) {
			throw new Error("Account not found");
		}

		user.password = String(newPassword);
		persistDatabase(db);
	}

	function clearForgotPasswordInputs() {
		if (forgotUsernameInput) forgotUsernameInput.value = "";
		if (forgotNewPasswordInput) forgotNewPasswordInput.value = "";
		if (forgotConfirmPasswordInput) forgotConfirmPasswordInput.value = "";
	}

	function autoLoginWithRememberMe() {
		if (!isRememberMeValid()) {
			clearRememberMeToken();
			return false;
		}

		var token = getRememberMeToken();
		if (performLogin(token.username, token.password)) {
			updateRememberMeExpiration();
			return true;
		} else {
			clearRememberMeToken();
			return false;
		}
	}

	// Check for valid remember me token on page load
	if (form && autoLoginWithRememberMe()) {
		window.location.href = "home.html";
		return;
	}

	if (!form) {
		return;
	}

	initPasswordToggles();

	if (forgotToggleButton && forgotPanel) {
		forgotToggleButton.addEventListener("click", function () {
			var isOpen = forgotPanel.style.display !== "none";
			forgotPanel.style.display = isOpen ? "none" : "flex";
			forgotToggleButton.textContent = isOpen ? "Forgot password?" : "Cancel password reset";

			if (!isOpen && forgotUsernameInput && usernameInput && usernameInput.value.trim()) {
				forgotUsernameInput.value = usernameInput.value.trim();
			}

			if (isOpen) {
				clearForgotPasswordInputs();
			}
		});
	}

	if (forgotSubmitButton) {
		forgotSubmitButton.addEventListener("click", function () {
			var usernameOrEmail = forgotUsernameInput ? forgotUsernameInput.value.trim() : "";
			var newPassword = forgotNewPasswordInput ? forgotNewPasswordInput.value : "";
			var confirmPassword = forgotConfirmPasswordInput ? forgotConfirmPasswordInput.value : "";

			if (!usernameOrEmail) {
				AlertModal.show("Please enter your username or email.", "error");
				return;
			}

			if (!newPassword) {
				AlertModal.show("Please enter a new password.", "error");
				return;
			}

			if (newPassword.length < 6) {
				AlertModal.show("New password must be at least 6 characters.", "error");
				return;
			}

			if (newPassword !== confirmPassword) {
				AlertModal.show("Password confirmation does not match.", "error");
				return;
			}

			try {
				resetPasswordLocally(usernameOrEmail, newPassword, confirmPassword);
				localStorage.removeItem("rememberMeToken");
				clearForgotPasswordInputs();
				if (forgotPanel) forgotPanel.style.display = "none";
				if (forgotToggleButton) forgotToggleButton.textContent = "Forgot password?";
				AlertModal.show("Password reset successful. You can now log in.", "success");
			} catch (error) {
				AlertModal.show(error.message || "Failed to reset password.", "error");
			}
		});
	}

	form.addEventListener("submit", function (event) {
		event.preventDefault();

		var username = usernameInput ? usernameInput.value.trim() : "";
		if (!username) {
			AlertModal.show("Please enter a username.", "error");
			return;
		}

		var password = passwordInput ? passwordInput.value : "";
		if (!performLogin(username, password)) {
			AlertModal.show("Invalid credentials. Please check your username and/or password. If you don't have an account, please sign up first.", "error");
			return;
		}

		var rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
		if (rememberMe) {
			saveRememberMeToken(username, password);
		} else {
			clearRememberMeToken();
		}

		if (passwordInput) {
			passwordInput.value = "";
		}
		window.location.href = "home.html";
	});
});
