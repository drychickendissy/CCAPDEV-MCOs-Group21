/**
 * ### `src/routes/userRoutes.js`
 * - User route definitions.
 * - `GET /me` and `PATCH /me` are protected by `requireAuth`.
 * - `GET /:userId` is public profile lookup.
 */

// Import necessary modules and controller functions
import { Router } from "express";
import { getMe, getUserById, updateMe } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
router.get("/:userId", getUserById);

export default router;
