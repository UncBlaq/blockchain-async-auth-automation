import winston from 'winston';
import { hashPassword, comparePassword } from "../utils/hash.mjs";
import { signUpUser } from "../cruds/users.mjs";
import { sendVerificationEmail } from "../utils/emailService.mjs";
import { UserResponseSchema, getNounceSchema} from "../schemas/users.mjs";
import { createAccessToken, createRefreshToken } from "../utils/jwt.mjs";
import { redisClient, connectRedis, prisma } from "../server.mjs";
import { checkNonceAttempts } from "../utils/users.mjs";
import '../logger.mjs'


const logger = winston.loggers.get('loggerSetup')


// export const createUser = async (req, res) => {
//   try {
//     console.log("✅ Step 1: received body", req.body);

//     const hashedPassword = hashPassword(req.body.password);
//     req.body.password = hashedPassword;
//     console.log("✅ Step 2: hashed password", hashedPassword);

//     const newUser = await signUpUser(req);
//     console.log("✅ Step 3: new user returned", newUser);

//     await sendVerificationEmail(req.body.email, newUser.id);
//     console.log("✅ Step 4: email sent");

//     const responseUser = UserResponseSchema.parse(newUser);
//     console.log("✅ Step 5: parsed user", responseUser);

//     const userId = newUser.id;

//     const links = [
//       { rel: "self", href: `http://localhost:8000/api/users/${userId}` },
//       { rel: "login", href: `http://localhost:8000/api/users/login` },
//       { rel: "update", href: `http://localhost:8000/api/users/${userId}/update` },
//       { rel: "delete", href: `http://localhost:8000/api/users/${userId}/delete` }
//     ];

//     return res.status(201).json({
//       message: "User created successfully",
//       user: responseUser,
//       links
//     });

//   } catch (error) {
//     console.error("❌ CREATE USER ERROR:", error); // 👈 show this
//     return res.status(500).json({ message: error.message });
//   }
// };


const createUser = async (req, res) => {
  // logger.info('Creating new user!!')
    try {
      const hashedPassword = hashPassword(req.body.password);
      req.body.password = hashedPassword;
  
      const newUser = await signUpUser(req); 
      await sendVerificationEmail(req.body.email, newUser.id);
        // Validate and filter response
    const responseUser = UserResponseSchema.parse(newUser);
  
 // Dynamic generation of HATEOAS links
 const userId = newUser.id;

 const links = [
   { rel: "self", href: `http://localhost:8000/api/users/${userId}` },
   { rel: "login", href: `http://localhost:8000/api/users/login` },
   { rel: "update", href: `http://localhost:8000/api/users/${userId}/update` },
   { rel: "delete", href: `http://localhost:8000/api/users/${userId}/delete` }
 ];

 res.status(201).json({
   message: "User created successfully",
   user: responseUser,
   links: links // Include dynamic links
 });
} catch (error) {
 res.status(500).json({ message: error.message });
}
  };

const loginUser = async (req, res) => {
    // login logic here
    // Return user and accessToken if successful
        const user = await prisma.user.findUnique({
          where: { email: req.body.email },
        });
        if (!user ||!(await comparePassword(req.body.password, user.password))) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
         // Generate JWT
         const accessToken = createAccessToken({ email: user.email });
         const refreshToken = createRefreshToken({ email: user.email });
    
        return res.json({ message: "Logged in successfully", accessToken, refreshToken });
};


const getNounce = async (req, res) => {
      await connectRedis()   
      const parsed = getNounceSchema.safeParse(req.body);
  
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
      }

      const { address } = req.body;
      if (!address) return res.status(400).json({ error: "Missing address" });
      await checkNonceAttempts(address, req.ip);

      const nonce = `Sign this message to authenticate: ${Math.random() * 100000}`;
      
      // Store nonce in DB (or Redis) linked to the address
      await redisClient.setEx(nonce, 900, address);

      res.json({ nonce });
};

export {getNounce, loginUser, createUser}



  
