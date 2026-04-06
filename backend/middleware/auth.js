// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { appConfig } from '../config/env.js';

const getRequestToken = (req) =>
  req.signedCookies?.jwt || req.cookies?.jwt || null;

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    // 1️⃣ Check if JWT cookie exists
    const token = getRequestToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, appConfig.jwtSecret);

    // 3️⃣ Get user and attach to request
    req.user = await User.findById(decoded.id).select("_id name email role");

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export const attachUserIfPresent = async (req, res, next) => {
  try {
    const token = getRequestToken(req);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, appConfig.jwtSecret);
    const user = await User.findById(decoded.id).select("_id name email role");

    if (user) {
      req.user = user;
    }
  } catch {
    // Ignore invalid or missing auth for optional tracking.
  }

  next();
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};
