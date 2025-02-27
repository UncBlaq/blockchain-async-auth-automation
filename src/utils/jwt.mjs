import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "1h"; // Set token expiry
const ALGORITHM = process.env.ALGORITHM 

export const createAccessToken = (data) => {
    return jwt.sign(data, SECRET_KEY, { algorithm: ALGORITHM });
};


/**
 * Generates a URL-safe token.
 * @param {Object} data - Payload to encode in the token.
 * @returns {string} - The generated token.
 */
export const createUrlSafeToken = (data) => {
  return jwt.sign(data, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

/**
 * Verifies a URL-safe token.
 * @param {string} token - The token to verify.
 * @returns {Object} - Decoded payload if valid.
 * @throws {Error} - Throws error if token is invalid or expired.
 */
export const verifyUrlSafeToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

const RESET_TOKEN_EXPIRATION = "15m"; // 15 minutes expiration

/**
 * Generates a password reset token
 * @param {Object} data - Payload to encode in the token.
 * @returns {string} - The generated token.
 */
export const createResetToken = (data) => {
  return jwt.sign(data, SECRET_KEY, { expiresIn: RESET_TOKEN_EXPIRATION });
};

/**
 * Verifies a password reset token.
 * @param {string} token - The token to verify.
 * @returns {Object} - Decoded payload if valid.
 * @throws {Error} - Throws error if token is invalid or expired.
 */
export const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
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


