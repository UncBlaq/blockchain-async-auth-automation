import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/hash.mjs";
import { signUpUser } from "../cruds/users.mjs";
import { sendVerificationEmail } from "../utils/emailService.mjs";
import { UserResponseSchema } from "../schemas/users.mjs";
import { createAccessToken } from "../utils/jwt.mjs";

const prisma = new PrismaClient();

export const createUser = async (req, res) => {
    try {
      const hashedPassword = hashPassword(req.body.password);
      req.body.password = hashedPassword;
  
      const newUser = await signUpUser(req); 
      await sendVerificationEmail(req.body.email, newUser.id);
        // Validate and filter response
    const responseUser = UserResponseSchema.parse(newUser);
  
      return res.status(201).json({ message: "User created successfully", user: responseUser }); 
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

export const loginUser = async (req, res) => {
    // login logic here
    // Return user and token if successful
        const user = await prisma.user.findUnique({
          where: { email: req.body.email },
        });
        if (!user ||!(await comparePassword(req.body.password, user.password))) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
         // Generate JWT
         const token = createAccessToken({ userId: user.id, email: user.email });

           // Set the token in an HTTP-only cookie
    res.cookie("jwt", token, {
        httpOnly: true, // Prevents client-side JavaScript access
        secure: process.env.NODE_ENV === "production", // Use secure flag in production
        sameSite: "Strict", // Prevent CSRF
        maxAge: 60 * 60 * 1000, // 1 hour expiration
        });
    
        return res.json({ message: "Logged in successfully", token });
};

  
