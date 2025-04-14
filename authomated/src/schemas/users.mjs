import { z } from "zod";

const userSchema = z.object({
    email: z.string().min(3).max(32),
    password: z.string()
  }).strict();


const loginUserSchema = z.object({
    email: z
      .string({ required_error: "email must not be empty" })
      .min(3, "email must be between 3 and 32 characters")
      .max(32, "email must be between 3 and 32 characters")
      .email("email must be a valid email"),
  
    password: z
      .string({ required_error: "password is required" })
      .min(1, "password must not be empty")
  }).strict();

// Define a Zod schema for filtering response data
const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  isVerified: z.boolean()
});

const emailSchema = z.object({
    email: z.string().email("Invalid email format").trim().toLowerCase(),
  }).strict();

const getNounceSchema = z.object({
    email: z.string("Invalid address").trim().toLowerCase(),
  }).strict();

export { loginUserSchema, userSchema, UserResponseSchema, emailSchema, getNounceSchema}