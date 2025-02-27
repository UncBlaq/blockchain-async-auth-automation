import { Router } from "express";
import { checkSchema, validationResult} from 'express-validator';
import { createUserValidationSchema } from "../schemas/users.mjs";
import { signUpUser } from "../cruds/users.mjs";
import { checkExistingEmail } from "../utils/users.mjs";
import { hashPassword } from "../utils/hash.mjs";

import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail} from "../utils/emailService.mjs";
import { loginUserValidationSchema } from "../schemas/users.mjs";
import { comparePassword } from "../utils/hash.mjs";
import { createAccessToken} from "../utils/jwt.mjs";
import { requestPasswordReset, resetPassword} from "../utils/authControler.mjs";

import { setup2FA, verify2FA } from "../utils/authControler.mjs";
import { authenticateUser } from "../utils/jwt.mjs";


export const prisma = new PrismaClient();

const userRouter = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user and return a JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securepassword
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request
 */


userRouter.post(
  "/api/users",
  checkSchema(createUserValidationSchema),
  checkExistingEmail,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

        // Clearing my duplicate mail during dev
    // await prisma.user.deleteMany()

    try {
      const hashedPassword = hashPassword(req.body.password);
      req.body.password = hashedPassword;

      const newUser = await signUpUser(req); 
      await sendVerificationEmail(req.body.email, newUser.id);

      return res.status(201).json({ message: "User created successfully", user: newUser }); 
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

userRouter.post(
  "/api/users/login",
  checkSchema(loginUserValidationSchema),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (!user ||!(await comparePassword(req.body.password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
     // Generate JWT
     const token = createAccessToken({ userId: user.id, email: user.email });

    return res.json({ message: "Logged in successfully", token });
  }
)

// TODO: Add forgot password endpoint and change password endpoint

userRouter.post("/forgot-password", requestPasswordReset);
userRouter.post("/reset-password/:token", resetPassword);

userRouter.post("/setup-2fa", authenticateUser, setup2FA);
userRouter.post("/verify-2fa", authenticateUser, verify2FA);

export default userRouter;