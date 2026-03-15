/**
 * ### `src/routes/authRoutes.js`
 * - Auth route definitions.
 * - `POST /register` → `register`
 * - `POST /login` → `login`
 */

// Import necessary modules and controller functions
import { Router } from "express";
import { forgotPassword, login, register } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

export default router;
