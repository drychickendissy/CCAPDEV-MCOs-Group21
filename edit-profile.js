document.addEventListener("DOMContentLoaded", function () {
  // --- Helpers ---
  function parseJson(value) {
    try { return value ? JSON.parse(value) : null; }
    catch (e) { return null; }
  }

  function isLoggedIn() {
    return (localStorage.getItem("currentUserId") || "").trim().length > 0;
  }

  function getCurrentUserId() {
    return (localStorage.getItem("currentUserId") || "").trim();
  }

  function getDatabase() {
    // Prefer global mockDatabase (from data.js), else localStorage copy
    if (typeof mockDatabase !== "undefined" && mockDatabase) return mockDatabase;
    return parseJson(localStorage.getItem("mockDatabase")) || { users: [], posts: [] };
  }

  function persistDatabase(db) {
    // If your data.js exposes saveToLocalDB, use it (best)
    if (typeof saveToLocalDB === "function") {
      saveToLocalDB();
      return;
    }
    // Fallback: write raw localStorage
    localStorage.setItem("mockDatabase", JSON.stringify(db));
  }

  function setSelectValue(selectEl, value) {
    if (!selectEl) return;
    var v = String(value || "").trim();
    if (!v) return;

    var normalized = v.toLowerCase();
    var options = Array.prototype.slice.call(selectEl.options || []);
    var match = options.find(function (opt) {
      return String(opt.value || "").toLowerCase() === normalized;
    });
    selectEl.value = match ? match.value : v;
  }

  function getNormalizedSelectValue(selectEl) {
    if (!selectEl) return "";
    var rawValue = String(selectEl.value || "");
    var normalized = rawValue.toLowerCase();
    var options = Array.prototype.slice.call(selectEl.options || []);
    var match = options.find(function (opt) {
      return String(opt.value || "").toLowerCase() === normalized;
    });
    return match ? match.value : rawValue;
  }

  // --- Guard: must be logged in to edit profile ---
  if (!isLoggedIn()) {
    // Optional: show alert if you want
    if (typeof AlertModal !== "undefined") {
      AlertModal.show("Please login to edit your profile.", "error");
    }
    window.location.href = "login.html";
    return;
  }

  var currentUserId = getCurrentUserId();
  var db = getDatabase();

  if (!db.users || !Array.isArray(db.users)) db.users = [];

  var user = db.users.find(function (u) { return u && u.id === currentUserId; });
  if (!user) {
    // If somehow missing, create a minimal user record
    user = {
      id: currentUserId,
      username: "User",
      bio: "",
      pronouns: "",
      year: "",
      major: "",
      photo: "assets/placeholder.png",
      tags: []
    };
    db.users.push(user);
    persistDatabase(db);
  }

  // --- DOM refs ---
  var saveButton = document.getElementById("save-profile-edits");
  var resetButton = document.getElementById("reset-profile-to-default");

  var nameInput = document.getElementById("edit-name");
  var bioInput = document.getElementById("edit-bio");
  var pronounsInput = document.getElementById("edit-pronouns");
  var yearInput = document.getElementById("edit-year");
  var majorInput = document.getElementById("edit-major");

  var avatarInput = document.getElementById("upload-profile-photo");
  var avatarPreview = document.getElementById("user-profile-photo");

  var tagsEdit = document.getElementById("edit-tags");

  if (!saveButton) return;

  // --- Load existing values into form ---
  if (nameInput) nameInput.value = user.username || "";
  if (bioInput) bioInput.value = user.bio || "";
  if (pronounsInput) setSelectValue(pronounsInput, user.pronouns || "");
  if (yearInput) setSelectValue(yearInput, user.year || "");
  if (majorInput) majorInput.value = user.major || "";
  if (avatarPreview) avatarPreview.src = user.photo || "assets/placeholder.png";

  // --- Tags editor ---
  var defaultTags = ["CCS", "ID 124", "Friendly"];
  var tags = Array.isArray(user.tags) && user.tags.length ? user.tags.slice() : defaultTags.slice();

  function renderEditableTags(container) {
    if (!container) return;

    container.innerHTML = "";

    tags.forEach(function (tag, index) {
      var tagEl = document.createElement("div");
      tagEl.className = "profile-tag";

      var label = document.createElement("span");
      label.className = "poppins-extrabold";
      label.textContent = tag;
      tagEl.appendChild(label);

      var remove = document.createElement("button");
      remove.className = "tag-remove";
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove tag");
      remove.textContent = "x";
      remove.dataset.index = String(index);
      tagEl.appendChild(remove);

      container.appendChild(tagEl);
    });

    var input = document.createElement("input");
    input.type = "text";
    input.className = "tag-input";
    input.id = "newTagInput";
    input.placeholder = "Add a tag...";
    container.appendChild(input);

    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();

      var value = input.value.trim();
      if (!value) return;

      tags.push(value);
      input.value = "";
      renderEditableTags(container);
    });
  }

  renderEditableTags(tagsEdit);

  if (tagsEdit) {
    tagsEdit.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.classList.contains("tag-remove")) return;

      var index = Number(target.dataset.index);
      if (Number.isNaN(index)) return;

      tags.splice(index, 1);
      renderEditableTags(tagsEdit);
    });
  }

  // --- Avatar upload ---
  var pendingAvatarDataUrl = ""; // keep new uploaded avatar here
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener("change", function () {
      var file = avatarInput.files && avatarInput.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function () {
        pendingAvatarDataUrl = String(reader.result);
        avatarPreview.src = pendingAvatarDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  // --- Reset ONLY this user's profile fields (do NOT delete mockDatabase) ---
  function resetToDefaults() {
    user.username = "Username";
    user.bio = "Default bio";
    user.pronouns = "They/them";
    user.year = "2nd Year";
    user.major = "Software Technology";
    user.photo = "assets/placeholder.png";
    user.tags = defaultTags.slice();

    // Update UI
    if (nameInput) nameInput.value = user.username;
    if (bioInput) bioInput.value = user.bio;
    if (pronounsInput) setSelectValue(pronounsInput, user.pronouns);
    if (yearInput) setSelectValue(yearInput, user.year);
    if (majorInput) majorInput.value = user.major;
    if (avatarPreview) avatarPreview.src = user.photo;

    tags = user.tags.slice();
    renderEditableTags(tagsEdit);

    pendingAvatarDataUrl = "";
    persistDatabase(db);

    if (typeof AlertModal !== "undefined") {
      AlertModal.show("Profile reset to default.", "success");
    }
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      resetToDefaults();
    });
  }

  // --- Save ---
  saveButton.addEventListener("click", function () {
    var nextName = nameInput ? nameInput.value.trim() : "";
    var nextBio = bioInput ? bioInput.value.trim() : "";

    user.username = nextName;
    user.bio = nextBio;
    user.pronouns = getNormalizedSelectValue(pronounsInput);
    user.year = getNormalizedSelectValue(yearInput);
    user.major = majorInput ? majorInput.value.trim() : "";
    user.tags = tags.slice();

    if (pendingAvatarDataUrl) {
      user.photo = pendingAvatarDataUrl;
    }

    persistDatabase(db);

    if (typeof AlertModal !== "undefined") {
      AlertModal.show("Profile saved!", "success");
    }

    window.location.href = "profile.html";
  });
});
