import { request } from "supertest";
import {prisma, app} from "../src/server.mjs";

describe("User signup", () => {
    it("should create a user", async () => {
        const response = await request(app).post('/api/users').send
      const user = await global.prisma.user.create({
        data: {
          email: "test@example.com",
          pasword: "Test",
        },
      });
  
      expect(response.statusCode).toBe(201);
    });
  });
  
