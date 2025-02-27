import express from 'express';
import userRouter from './routes/users.mjs';
import { setupSwagger } from './swagger.mjs';

const app = express();
app.use(express.json());
app.use(userRouter);

setupSwagger(app); // Enable Swagger UI

const loggingMiddleware = (request, res, next) => {
    console.log(`Request received at ${new Date().toISOString()} with method ${request.method} and path ${request.path}`);
    next();
};

// app.use(loggingMiddleware);

app.get('/', (req, res, ) => {
    res.send('Hello, Aye!');
});


app.listen(
    process.env.PORT || 3000,
    () => console.log('Server is running on port 3000')
)

