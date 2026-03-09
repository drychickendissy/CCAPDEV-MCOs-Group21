document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("login-form");
  var usernameInput = document.getElementById("username");
  var passwordInput = document.getElementById("password");
  var rememberMeCheckbox = document.getElementById("remember-me");

  var THREE_WEEKS_MS = 3 * 7 * 24 * 60 * 60 * 1000;

  function getRememberMeToken() {
    try {
      var token = localStorage.getItem("rememberMeToken");
      if (!token) return null;
      return JSON.parse(token);
    } catch (error) {
      return null;
    }
  }

  function saveRememberMeToken(usernameOrEmail, password) {
    var token = {
      usernameOrEmail: usernameOrEmail,
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

  async function performLogin(usernameOrEmail, password) {
    // POST: submit login credentials and receive auth token/session user
    var payload = await window.apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usernameOrEmail: usernameOrEmail, password: password })
    });

    if (!payload || !payload.user || !payload.token) {
      return false;
    }

    window.setAuthSession(payload.user, payload.token);
    await window.bootstrapMockDatabase();
    return true;
  }

  async function autoLoginWithRememberMe() {
    if (!isRememberMeValid()) {
      clearRememberMeToken();
      return false;
    }

    var token = getRememberMeToken();
    if (!token) return false;

    try {
      var ok = await performLogin(token.usernameOrEmail, token.password);
      if (ok) {
        updateRememberMeExpiration();
        return true;
      }
      clearRememberMeToken();
      return false;
    } catch (error) {
      clearRememberMeToken();
      return false;
    }
  }

  if (!form) return;

  autoLoginWithRememberMe().then(function (didAutoLogin) {
    if (didAutoLogin) {
      window.location.href = "/home";
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    var usernameOrEmail = usernameInput ? usernameInput.value.trim() : "";
    if (!usernameOrEmail) {
      AlertModal.show("Please enter your username or email.", "error");
      return;
    }

    var password = passwordInput ? passwordInput.value : "";
    if (!password) {
      AlertModal.show("Please enter your password.", "error");
      return;
    }

    try {
      var ok = await performLogin(usernameOrEmail, password);
      if (!ok) {
        AlertModal.show("Invalid credentials. Please try again.", "error");
        return;
      }

      var rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
      if (rememberMe) saveRememberMeToken(usernameOrEmail, password);
      else clearRememberMeToken();

      if (passwordInput) passwordInput.value = "";
      window.location.href = "/home";
    } catch (error) {
      AlertModal.show(error.message || "Login failed.", "error");
    }
  });
});
