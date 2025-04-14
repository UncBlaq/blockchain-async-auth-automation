import { redisClient, connectRedis, prisma} from "../server.mjs";

const markUserAsVerified = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error('User not found');

  return await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });
};

const checkExistingEmail = async (req, res, next) => {
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

const saveTokenToRedis = async (userId, token) => {
  await connectRedis();

  const redisKey = token;
  const expiresIn = 900; // 15 minutes

  await redisClient.setEx(redisKey, expiresIn, userId); // auto-expiry
};

const verifyEmailToken = async (req, res) => {
  const token = req.params.token;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  await connectRedis();
  let userId;
  try {
    const userId = await redisClient.get(`${token}`);
    await redisClient.del(`${token}`); //  Always delete the token once fetched
  } catch (error) {
    console.log(error)
  }

  if (!userId) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Proceed to mark user as verified
  await markUserAsVerified(userId);
  await redisClient.del(`verify_token:${token}`);

  res.status(200).json({ message: 'Email verified successfully' });
};




const checkAttempts = async (email, ip) => {
  await connectRedis();
  
  const emailKey = `reset_attempts:${email}`;
  const ipKey = `reset_attempts_ip:${ip}`; 
  
  const maxRequests = 5; // Allow up to 5 reset requests
  const expireTime = 3600; // 1 hour 

  // Check existing request count
  const attempts = await redisClient.get(emailKey);
  const ipAttempts = await redisClient.get(ipKey);
  
  if ((attempts && parseInt(attempts) >= maxRequests) || 
      (ipAttempts && parseInt(ipAttempts) >= maxRequests)) {
        throw new Error(JSON.stringify({
          message: "Too many nonce requests.",
          retryAfter: expireTime, // Provide retry time in response
        }));
        
  }

  // Increment request count and set expiry if first attempt
  await redisClient.incr(emailKey);
  await redisClient.incr(ipKey);

  if (!attempts) {
    await redisClient.expire(emailKey, expireTime);
  }
  if (!ipAttempts) { 
    await redisClient.expire(ipKey, expireTime);
  }
};

const checkNonceAttempts = async (walletAddress, ip) => {
  await connectRedis(); // Ensure Redis is connected

  const walletKey = `nonce_attempts:${walletAddress}`;
  const ipKey = `nonce_attempts_ip:${ip}`; // Corrected key

  const maxRequests = 5; // Allow up to 5 requests
  const expireTime = 300; // 5 minutes (in seconds)

  // Check existing request count
  const attempts = await redisClient.get(walletKey);
  const ipAttempts = await redisClient.get(ipKey);

  if ((attempts && parseInt(attempts) >= maxRequests) || 
      (ipAttempts && parseInt(ipAttempts) >= maxRequests)) {
        throw new Error(JSON.stringify({
          message: "Too many nonce requests.",
          retryAfter: expireTime, // Provide retry time in response
        }));
        
  }

  // Increment request count and set expiry for the first request
  const currentWalletAttempts = await redisClient.incr(walletKey);
  const currentIpAttempts = await redisClient.incr(ipKey);

  if (currentWalletAttempts === 1) {
    await redisClient.expire(walletKey, expireTime);
  }
  if (currentIpAttempts === 1) {
    await redisClient.expire(ipKey, expireTime);
  }
};

export {checkExistingEmail, checkAttempts, checkNonceAttempts, saveTokenToRedis, verifyEmailToken}

