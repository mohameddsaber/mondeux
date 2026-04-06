// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    // 1️⃣ Check if JWT cookie exists
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
