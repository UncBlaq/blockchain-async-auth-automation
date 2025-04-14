import { Router } from "express";
import passport from "passport";

import { validateWithZod } from "../utils/validateWithZod.mjs";
import { checkExistingEmail } from "../utils/users.mjs";
import { loginUserSchema, userSchema } from "../schemas/users.mjs";
import { requestPasswordReset, resetPassword, verify2FAToken} from "../utils/authControler.mjs";
import { setup2FA, verify2FA } from "../utils/authControler.mjs";
import { authenticateUser } from "../utils/jwt.mjs";
import { createUser, loginUser } from "../handlers/userControler.mjs";
import { getNounce } from "../handlers/userControler.mjs";
import "../../strategies/discordStrategy.mjs";
import { verifyEmailToken } from "../utils/users.mjs";


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
  validateWithZod(userSchema),
  checkExistingEmail,
  createUser
);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticate user credentials and return a JWT token
 *     tags: [Auth]
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
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized – Invalid credentials
 *       400:
 *         description: Bad request
 */


  
userRouter.post(
  "/api/users/login",
  validateWithZod(loginUserSchema),
  loginUser
)

userRouter.post(
  "/api/users/authenticate",
  authenticateUser
)

userRouter.get(
  '/api/users/verify/:token',
  verifyEmailToken
);


// NOTE: This is a temporary solution for the Discord authentication.
userRouter.get('/api/auth/discord', passport.authenticate('discord'))
userRouter.get('/api/auth/discord/redirect', passport.authenticate('discord', 
  (req, res) => {
    console.log("Session data:", req.session);
    console.log("User data:", req.user);
  // Successful authentication, redirect home.
  res.status(200).json({ message: "Logged in successfully", user: req.user });
  res.redirect('/');
}));



// userRouter.post("/api/users/refresh_token",
//   generateAccessToken,
//   (req, res) => {
//     const refreshToken = req.body.token;
//     // Store in redis and make rotate to delete it later
//     // redisClient.setex(refreshToken, 3600, req.user.id);
//     //create send back the new access token
//   }
// )


// userRouter.post("/logout", authenticateUser, (req, res) => {
// // Remove the refresh token from the client side
//   // Invalidate the token on the server side and delete from the redis store
//   res.status(200).json({ message: "Logged out successfully" });
// });


// userRouter.post("/api/users/logOut", )

userRouter.post("/forgot-password", 
  requestPasswordReset);
  
userRouter.post("/reset-password/:token", 
  resetPassword
);


userRouter.post("/api/auth/nonce", 
  getNounce
);







userRouter.post("/setup-2fa", authenticateUser, setup2FA);
userRouter.post("/verify-2fa", authenticateUser, verify2FA);

export default userRouter;