/**
 * ### `src/routes/authRoutes.js`
 * - Auth route definitions.
 * - `POST /register` → `register`
 * - `POST /login` → `login`
 */

// Import necessary modules and controller functions
import { Router } from "express";
import { login, register } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
