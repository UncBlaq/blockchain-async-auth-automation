import express from 'express';
import userRouter from './routes/users.mjs';
import { setupSwagger } from './swagger.mjs';
import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";


const app = express();
app.use(express.json());
app.use(userRouter);


const prisma = new PrismaClient();
setupSwagger(app); // Enable Swagger UI
const redisClient = createClient();

redisClient.on("error", (err) => console.error("Redis error:", err));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

const loggingMiddleware = (request, res, next) => {
    console.log(`Request received at ${new Date().toISOString()} with method ${request.method} and path ${request.path}`);
    next();
};

// app.use(loggingMiddleware);

// Middleware to catch invalid JSON syntax
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({ error: "Invalid JSON format" });
    }
    next();
  });

app.get('/', (req, res, ) => {
    res.send('Hello, Aye!');
});



export { redisClient, connectRedis, prisma };



app.listen(
    process.env.PORT || 3000,
    () => console.log('Server is running on port 3000')
)

