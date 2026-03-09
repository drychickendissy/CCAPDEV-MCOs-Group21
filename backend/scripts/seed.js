/**
 * ### `scripts/seed.js`
 * - Seeds MongoDB with initial users and posts.
 * - Creates users with hashed passwords and maps legacy IDs to Mongo `_id` values.
 * - Seeds posts with comments and default interaction metrics (votes/views).
*/

// Import necessary modules
import bcrypt from "bcryptjs";
import env from "../src/config/env.js";
import { connectDatabase } from "../src/config/conn.js";
import User from "../src/model/User.js";
import Post from "../src/model/Post.js";

// Define seed data for users and posts with legacy IDs for mapping
const seedUsers = [
  {
    legacyId: "u1",
    username: "CCAPDEV-G21",
    email: "ccapdev.group21@dlsu.edu.ph",
    password: "ccapdevgroup21",
    photo: "assets/placeholder.png",
    year: "2nd Year",
    pronouns: "they/them",
    major: "BS - Computer Science",
    bio: "Hello! We are the developers of Animo Commons!",
    tags: ["Site Devs", "CCS", "ID 124"]
  },
  {
    legacyId: "u2",
    username: "user167",
    email: "user167@dlsu.edu.ph",
    password: "password123",
    photo: "assets/placeholder.png",
    year: "1st Year",
    pronouns: "he/him",
    major: "BS - Biology"
  },
  {
    legacyId: "u3",
    username: "JaneDoe",
    email: "jane.doe@dlsu.edu.ph",
    password: "securepass",
    photo: "assets/placeholder.png",
    year: "3rd Year",
    pronouns: "she/her",
    major: "BS - IT"
  },
  {
    legacyId: "u4",
    username: "ccsstudent",
    email: "psychology.student@dlsu.edu.ph",
    password: "password",
    photo: "assets/placeholder.png",
    year: "4th Year",
    pronouns: "he/him",
    major: "BS - Psychology"
  },
  {
    legacyId: "u5",
    username: "JohnSmith",
    email: "john.smith@dlsu.edu.ph",
    password: "johnspassword",
    photo: "assets/placeholder.png",
    year: "2nd Year",
    pronouns: "he/him",
    major: "BSMS - CS"
  }
];

// Define seed data for posts with legacy IDs for mapping and default interaction metrics
const seedPosts = [
  {
    legacyId: "p1",
    authorLegacyId: "u1",
    category: "discussion",
    title: "Amazing sunset at the campus",
    content:
      "Just witnessed the most beautiful sunset from the rooftop. The sky was painted in hues of orange and pink. Nature is truly amazing!",
    upvotes: 41,
    downvotes: 2,
    views: 801,
    comments: [
      { userLegacyId: "u2", text: "That sounds incredible! I'll try to catch it next time." },
      { userLegacyId: "u3", text: "Do you have a photo? Would love to see it!" }
    ]
  },
  {
    legacyId: "p2",
    authorLegacyId: "u2",
    category: "discussion",
    title: "New coffee shop in town",
    content:
      "Found this hidden gem of a coffee shop. Their latte art is incredible and the ambiance is perfect for studying.",
    upvotes: 38,
    downvotes: 0,
    views: 799,
    comments: [
      { userLegacyId: "u4", text: "What's the name and location? I need a new study spot!" }
    ]
  },
  {
    legacyId: "p3",
    authorLegacyId: "u3",
    category: "help",
    title: "Group study session tips",
    content:
      "Anyone have tips for effective group study sessions? We're struggling to stay focused and productive.",
    upvotes: 32,
    downvotes: 1,
    views: 609,
    comments: [
      { userLegacyId: "u1", text: "Set clear goals before starting and take regular breaks." },
      { userLegacyId: "u5", text: "Try the 25-5 method. Works well for my group!" }
    ]
  },
  {
    legacyId: "p4",
    authorLegacyId: "u4",
    category: "discussion",
    title: "Best budget meals around campus under ₱120?",
    content:
      "Drop your go-to meals. Preferably something filling and not too oily because I have class after.",
    upvotes: 10,
    downvotes: 3,
    views: 105,
    comments: []
  },
  {
    legacyId: "p5",
    authorLegacyId: "u5",
    category: "news",
    title: "Org recruitment: what to expect",
    content:
      "Most orgs ask for a short interview + one mini task. Don't overthink it — just be genuine.",
    upvotes: 17,
    downvotes: 1,
    views: 512,
    comments: []
  }
];

// Helper function to enrich user data with post count and reputation stats
async function run() {
  await connectDatabase(env.mongoUri);

  await Promise.all([User.deleteMany({}), Post.deleteMany({})]);

  const users = [];
  for (const item of seedUsers) {
    const passwordHash = await bcrypt.hash(item.password, 10);
    const user = await User.create({ ...item, passwordHash });
    users.push(user);
  }

  const usersByLegacyId = users.reduce((acc, user) => {
    acc[user.legacyId] = user;
    return acc;
  }, {});

  for (const postItem of seedPosts) {
    const author = users.find((user) => user.legacyId === postItem.authorLegacyId);
    if (!author) continue;

    const mappedComments = (postItem.comments || [])
      .map((comment) => {
        const commentUser = usersByLegacyId[comment.userLegacyId];
        if (!commentUser) return null;

        return {
          userId: commentUser._id,
          text: comment.text,
          parentId: null,
          editedAt: null,
          votes: {}
        };
      })
      .filter(Boolean);

    await Post.create({
      legacyId: postItem.legacyId,
      authorId: author._id,
      category: postItem.category,
      title: postItem.title,
      content: postItem.content,
      upvotes: postItem.upvotes,
      downvotes: postItem.downvotes,
      views: postItem.views,
      comments: mappedComments,
      lastInteraction: new Date()
    });
  }

  console.log("Seed complete");
  process.exit(0);
}

// Execute the seed function and handle any errors that occur during the seeding process
run().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});

