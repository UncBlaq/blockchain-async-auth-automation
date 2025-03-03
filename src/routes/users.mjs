import { Router } from "express";
import { checkSchema, body} from 'express-validator';

import { createUserValidationSchema } from "../schemas/users.mjs";
import { checkExistingEmail } from "../utils/users.mjs";
import { loginUserValidationSchema } from "../schemas/users.mjs";
import { requestPasswordReset, resetPassword} from "../utils/authControler.mjs";
import { setup2FA, verify2FA } from "../utils/authControler.mjs";
import { authenticateUser } from "../utils/jwt.mjs";
import { checkErrors } from "../utils/users.mjs";
import { createUser, loginUser } from "../handlers/userControler.mjs";


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
  checkErrors,
  createUser,
//  async (req, res) => {
//   await prisma.user.deleteMany()
//  }
);
  
userRouter.post(
  "/api/users/login",
  checkSchema(loginUserValidationSchema),
  checkErrors,
  loginUser
)


userRouter.post("/forgot-password", 
  checkErrors,
  requestPasswordReset);
  
userRouter.post("/reset-password/:token", 
  resetPassword
);

userRouter.post("/setup-2fa", authenticateUser, setup2FA);
userRouter.post("/verify-2fa", authenticateUser, verify2FA);

export default userRouter;