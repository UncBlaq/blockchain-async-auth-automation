import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "1h"; // Set token expiry
const ALGORITHM = process.env.ALGORITHM 
const SALT = process.env.SALT

export const createAccessToken = (data) => {
    return jwt.sign(data, SECRET_KEY, { algorithm: ALGORITHM });
};


/**
 * Middleware to authenticate users using JWT
 */
export const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from Bearer scheme

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Verify token
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};


