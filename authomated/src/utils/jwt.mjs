import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;
const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "1h"; // Set token expiry
const ALGORITHM = process.env.ALGORITHM 
const SALT = process.env.SALT


export const createRefreshToken = (data) => jwt.sign(data, JWT_SECRET_REFRESH, { algorithm: ALGORITHM }, { expiresIn: TOKEN_EXPIRATION });
export const createAccessToken = (data) => {
  // serialize data
    return jwt.sign(data, SECRET_KEY, { algorithm: ALGORITHM }, { expiresIn: TOKEN_EXPIRATION });
};

export const refreshToGenerateAccessToken = (user) => {
    // serialize data
    return jwt.sign(data, SECRET_KEY, { algorithm: ALGORITHM }, { expiresIn: TOKEN_EXPIRATION });
}

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


