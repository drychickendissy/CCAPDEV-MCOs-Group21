/**
 * ### `src/routes/postRoutes.js`
 * - Post/comment route definitions.
 * - Public read routes + protected write/mutate routes.
 * - Applies `requireAuth` to create/edit/delete/vote operations.
 */

// Import necessary modules and controller functions
import { Router } from "express";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getPostById,
  listPosts,
  updateComment,
  updatePost,
  voteComment,
  votePost
} from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", listPosts);
router.get("/:postId", getPostById);

// Protected routes
router.post("/", requireAuth, createPost);
router.patch("/:postId", requireAuth, updatePost);
router.delete("/:postId", requireAuth, deletePost);

// Voting routes
router.post("/:postId/vote", requireAuth, votePost);

// Comment routes
router.post("/:postId/comments", requireAuth, addComment);
router.patch("/:postId/comments/:commentId", requireAuth, updateComment);
router.delete("/:postId/comments/:commentId", requireAuth, deleteComment);
router.post("/:postId/comments/:commentId/vote", requireAuth, voteComment);

export default router;
