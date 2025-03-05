import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { redisClient, connectRedis } from "../index.mjs";

const prisma = new PrismaClient();

export const checkExistingEmail = async (req, res, next) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    next(); // Proceed if email does not exist
  } catch (error) {
    return res.status(500).json({ message: "Server error while checking email" });
  }
};


export const checkErrors = async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
};

export const checkAttempts = async (email) => {
  await connectRedis();
  const emailKey = `reset_attempts:${email}`;
  const maxRequests = 5; // Allow up to 5 reset requests
  const expireTime = 3600; // 1 hour (in seconds)

  // Check existing request count
  const attempts = await redisClient.get(emailKey);
  
  if (attempts && parseInt(attempts) >= maxRequests) {
    throw new Error("Too many password reset requests. Please try again later.");
  }

  // Increment request count and set expiry
  await redisClient.incr(emailKey);
  if (!attempts) {
    await redisClient.expire(emailKey, expireTime);
  }
}
