// data.js

// Sets the current user ID based on localStorage, defaulting to "u1" if not set
var CURRENT_USER_ID = localStorage.getItem("currentUserId") || "";

// Fetches the mock database from localStorage
const savedData = JSON.parse(localStorage.getItem("mockDatabase"));

// Loads the hardcoded default database and merges it with any saved data from localStorage
// (i.e. if a new user was created, it will be added to the default users)
const defaultDatabase = {
  // ✅ Random user accounts (format preserved)
  users: [
   {
            id: "u1",
            username: "CCAPDEV-G21",
            email: "ccapdev.group21@dlsu.edu.ph",
            password: "ccapdevgroup21",
            photo: "assets/placeholder.png",
            year: "2nd Year",
            pronouns: "they/them",
            major: "BS - Computer Science",
            bio: "Hello! We are the developers of Animo Commons! This website is a project for our CCAPDEV class, and we hope it can be a fun and helpful resource for students at DLSU. Feel free to explore and connect with others in the community!",
            tags:["Site Devs", "CCS", "ID 124"],
            stats: { posts: 3, reputation: 50 }
        },
        {
            id: "u2",
            username: "user167",
            email: "user167@dlsu.edu.ph",
            password: "password123",
            photo: "assets/placeholder.png",
            year: "1st Year",
            pronouns: "he/him",
            major: "BS - Biology Major in Medical Biology",
            bio: "Just a regular student trying to navigate college life!",
            tags:["COS", "ID 125"],
            stats: { posts: 2, reputation: 34 }
        },
        {
            id: "u3",
            username: "JaneDoe",
            email: "jane.doe@dlsu.edu.ph",
            password: "securepass",
            photo: "assets/placeholder.png",
            year: "3rd Year",
            pronouns: "she/her",
            major: "BS - Information Technology",
            bio: "Loves coding and coffee! Always up for a good challenge.",
            tags:["CCS", "ID 123", "Friendly"],
            stats: { posts: 5, reputation: 78 }
        },
        {
            id: "u4",
            username: "urmom",
            email: "psychology.student@dlsu.edu.ph",
            password: "password",
            photo: "assets/placeholder.png",
            year: "4th Year",
            pronouns: "he/him",
            major: "BS - Psychology",
            bio: "Passionate about mental health advocacy and understanding the human mind.",
            tags:["CLA", "ID 122", "Helpful"],
            stats: { posts: 8, reputation: 120 }
        },
        {
            id: "u5",
            username: "JohnSmith",
            email: "john.smith@dlsu.edu.ph",
            password: "johnspassword",
            photo: "assets/placeholder.png",
            year: "2nd Year",
            pronouns: "he/him",
            major: "BSMS - Computer Science",
            bio: "Aspiring software engineer with a love for problem-solving and innovation.",
            tags:["CCS", "ID 124", "Tech Enthusiast"],
            stats: { posts: 4, reputation: 60 }
        }
    ],

  // ✅ Keep posts minimal here (Home uses its own 20 demo posts in home.html)
  // These can be used by other pages that rely on mockDatabase.posts.
  posts: [
    { id: "p1", authorId: "u1", title: "CCAPDEV Help", content: "...", date: "Feb 4, 2026", upvotes: 12, downvotes: 1, views: 120, category: "help" },
    { id: "p2", authorId: "u2", title: "Campus Events", content: "...", date: "Feb 5, 2026", upvotes: 4, downvotes: 2, views: 300, category: "news" },
    { id: "p3", authorId: "u1", title: "Study Group", content: "...", date: "Feb 6, 2026", upvotes: 7, downvotes: 0, views: 180, category: "discussion" },
    { id: "p4", authorId: "u3", title: "Project Ideas", content: "...", date: "Feb 7, 2026", upvotes: 15, downvotes: 3, views: 410, category: "discussion" },
    { id: "p5", authorId: "u4", title: "Mental Health Resources", content: "...", date: "Feb 8, 2026", upvotes: 20, downvotes: 1, views: 520, category: "news" },
    { id: "p6", authorId: "u5", title: "Internship Opportunities", content: "...", date: "Feb 9, 2026", upvotes: 10, downvotes: 0, views: 260, category: "news" }
  ]
};

// Function to merge saved data with default data, ensuring that new users are added and
// existing users are updated without losing any information
function mergeWithDefaults(saved, defaults) {
  if (!saved) return defaults;

  // Start with default users merged with saved data
  var mergedUsers = (defaults.users || []).map(function (defaultUser) {
    var savedUser = (saved.users || []).find(function (u) {
      return u && u.id === defaultUser.id;
    });
    return savedUser ? Object.assign({}, defaultUser, savedUser) : defaultUser;
  });

  // Add any new users from saved data that don't exist in defaults
  if (saved.users && Array.isArray(saved.users)) {
    saved.users.forEach(function (savedUser) {
      var existsInDefaults = (defaults.users || []).some(function (u) {
        return u && u.id === savedUser.id;
      });
      if (!existsInDefaults) {
        mergedUsers.push(savedUser);
      }
    });
  }

  // Return the merged database object, ensuring that posts are also included from saved data if available
  return {
    ...defaults,
    users: mergedUsers,
    posts: saved.posts || defaults.posts || []
  };
}

// Create the mock database by merging saved data with defaults, ensuring that any new users or posts are preserved
const mockDatabase = mergeWithDefaults(savedData, defaultDatabase);

// Function to save the current state of the mock database back to localStorage
function saveToLocalDB() {
  localStorage.setItem("mockDatabase", JSON.stringify(mockDatabase));
}

// Logout function to clear current user session and redirect to login page
function logout() {
  localStorage.removeItem("currentUserId");
  localStorage.removeItem("rememberMeToken");
  window.location.href = "login.html";
}

// expose globals for other pages/scripts
window.CURRENT_USER_ID = CURRENT_USER_ID;
window.mockDatabase = mockDatabase;
window.saveToLocalDB = saveToLocalDB;
window.logout = logout;
