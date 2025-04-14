// import { execSync } from 'child_process';
// import {prisma, app} from "../src/server.mjs";
// import dotenv from 'dotenv';

// dotenv.config({ path: '.env.test' });

// global.prisma = new prisma();

// beforeAll(async () => {
//   // Reset database before all tests
//   execSync('npx prisma migrate reset --force --skip-generate --skip-seed', {
//     stdio: 'inherit',
//     env: {
//       ...process.env,
//       DATABASE_URL: process.env.DATABASE_URL, // this will be the test DB
//     },
//   });
// });

// beforeAll(() => {
//   app;
// });

// afterAll(async () => {
//   await global.prisma.$disconnect();
// });
