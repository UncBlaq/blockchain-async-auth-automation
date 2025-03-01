import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";

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