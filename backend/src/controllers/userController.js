/**
 * ### `src/controllers/userController.js`
 * - User profile retrieval/update logic.
 * - `getMe`: returns authenticated user with derived stats.
 * - `updateMe`: allows updates for selected profile fields only; blocks email changes.
 * - `getUserById`: public fetch with not-found handling.
 * - Uses `enrichUserWithStats` to compute post count and reputation from posts.
 */

// Import necessary modules and models
import Post from "../model/Post.js";
import User from "../model/User.js";
import HttpError from "../utils/httpError.js";

// Helper function to enrich a user document with post count and reputation stats
async function enrichUserWithStats(userDoc) {
  const posts = await Post.find({ authorId: userDoc._id }).select("upvotes downvotes");

  const stats = posts.reduce(
    (acc, post) => {
      acc.posts += 1;
      acc.reputation += (Number(post.upvotes) || 0) - (Number(post.downvotes) || 0);
      return acc;
    },
    { posts: 0, reputation: 0 }
  );

  return {
    ...userDoc.toJSON(),
    stats
  };
}

// Controller function to get the authenticated user's profile with stats
export async function getMe(req, res, next) {
  try {
    const userWithStats = await enrichUserWithStats(req.user);
    res.json({ success: true, user: userWithStats });
  } catch (error) {
    next(error);
  }
}

// Controller function to update the authenticated user's profile with restrictions on editable fields
export async function updateMe(req, res, next) {
  try {
    const editable = ["photo", "year", "pronouns", "major", "bio", "tags", "username"];
    for (const key of editable) {
      if (key in req.body) {
        req.user[key] = req.body[key];
      }
    }

    if ("email" in req.body) {
      throw new HttpError(400, "Email updates are not allowed in this endpoint");
    }

    await req.user.save();

    const updated = await User.findById(req.user._id).select("-passwordHash");
    const userWithStats = await enrichUserWithStats(updated);
    res.json({ success: true, user: userWithStats });
  } catch (error) {
    next(error);
  }
}

// Controller function to get a user's profile by their ID, with not-found handling
export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.userId).select("-passwordHash");
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const userWithStats = await enrichUserWithStats(user);
    res.json({ success: true, user: userWithStats });
  } catch (error) {
    next(error);
  }
}
