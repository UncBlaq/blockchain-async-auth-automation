import express from 'express';
import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import userRouter from './routes/users.mjs';
// import { setupSwagger } from './swagger.mjs';

import cors from 'cors'

const app = express();

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My Express API',
    version: '1.0.0',
    description: 'This is the API documentation for my Express app',
  },
  servers: [
    {
      url: 'http://localhost:8000',
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ['./index.js', './src/routes/users.mjs']
};

// Generate the Swagger spec
const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger docs at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.listen(3000, () => {
  console.log('Server is running at http://localhost:8000');
  console.log('Swagger docs available at http://localhost:8000/api-docs');
});

// app accept json payload
app.use(express.json());
app.use(userRouter);


const prisma = new PrismaClient();
// setupSwagger(app); // Enable Swagger UI
const redisClient = createClient();

redisClient.on("error", (err) => console.error("Redis error:", err));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};


// const loggingMiddleware = (request, res, next) => {
//     console.log(`Request received at ${new Date().toISOString()} with method ${request.method} and path ${request.path}`);
//     next();
// };

// app.use(loggingMiddleware);

const corsOptions = {
  origin: 'https://my-frontend-domain.com', // or use an array
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));


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



export { redisClient, connectRedis, prisma, app };


let PORT = 8000;
app.listen(
    PORT,'0.0.0.0',
    () => console.log(`Server is running on port ${PORT}`)
)

