/**
 * ### `src/controllers/authController.js`
 * - Auth logic for registration and login.
 * - `register`:
 *   - validates required fields
 *   - enforces password length
 *   - checks username/email uniqueness
 *   - stores `passwordHash`
 *   - returns JWT + user payload
 * - `login`:
 *   - accepts `usernameOrEmail`
 *   - verifies password via bcrypt
 *   - returns JWT + user payload
*/

// Import necessary modules and models
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../model/User.js";
import HttpError from "../utils/httpError.js";

// Helper function to sign a JWT token with the user's ID as payload
function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

// Controller function to handle user registration
export async function register(req, res, next) {
  try {
    // Extract username, email, and password from the request body
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new HttpError(400, "username, email, and password are required");
    }

    if (String(password).length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }

    // Check if a user with the same username or email already exists (case-insensitive)
    const existing = await User.findOne({
      $or: [
        { username: String(username).trim() },
        { email: String(email).trim().toLowerCase() }
      ]
    });

    // If a user already exists with the same username or email, throw a 409 Conflict error
    if (existing) {
      throw new HttpError(409, "Username or email is already in use");
    }

    // Hash the password using bcrypt before storing it in the database
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      passwordHash
    });

    // Sign a JWT token for the newly registered user and return it along with the user data (excluding passwordHash)
    const token = signToken(user.id);
    res.status(201).json({ success: true, token, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      throw new HttpError(400, "usernameOrEmail and password are required");
    }

    const key = String(usernameOrEmail).trim();
    const user = await User.findOne({
      $or: [{ username: key }, { email: key.toLowerCase() }]
    });

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = signToken(user.id);
    res.json({ success: true, token, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { usernameOrEmail, newPassword, confirmNewPassword } = req.body;

    if (!usernameOrEmail || !newPassword || !confirmNewPassword) {
      throw new HttpError(400, "usernameOrEmail, newPassword, and confirmNewPassword are required");
    }

    if (String(newPassword).length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }

    if (String(newPassword) !== String(confirmNewPassword)) {
      throw new HttpError(400, "Password confirmation does not match");
    }

    const key = String(usernameOrEmail).trim();
    const user = await User.findOne({
      $or: [{ username: key }, { email: key.toLowerCase() }]
    });

    if (!user) {
      throw new HttpError(404, "Account not found");
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
}
