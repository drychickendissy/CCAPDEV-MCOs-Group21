/**
 * ### `src/middleware/auth.js`
 * - JWT auth gate for protected routes.
 * - Extracts `Authorization: Bearer <token>`, verifies token, loads user, and assigns `req.user`.
 * - Returns 401 errors for missing/invalid/expired tokens.
*/

// Import necessary modules and models
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../model/User.js";
import HttpError from "../utils/httpError.js";

// Middleware function to require authentication on protected routes
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.userId);

    if (!user) {
      return next(new HttpError(401, "Invalid authentication token"));
    }

    req.user = user;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired authentication token"));
  }
}
