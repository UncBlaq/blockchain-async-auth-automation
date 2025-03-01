import { z } from "zod";

export const createUserValidationSchema = {
    email : {
        isLength : {
            options : { min : 3, max : 32 },
            errorMessage : 'email must be between 3 and 32 characters'
        },
        notEmpty : {
            errorMessage : 'email must not be empty'
        },
        isString : {
            errorMessage : 'email must be a string'
        }  
    },
    password : {
        notEmpty : true
    }
} 

export const loginUserValidationSchema = {
    email : {
        isLength : {
            options : { min : 3, max : 32 },
            errorMessage : 'email must be between 3 and 32 characters'
        },
        notEmpty : {
            errorMessage : 'email must not be empty'
        },
        isString : {
            errorMessage : 'email must be a string'
        }  
    },
    password : {
        notEmpty : true
    }
}

// Define a Zod schema for filtering response data
export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  isVerified: z.boolean()
});

export const emailSchema = z.object({
    email: z.string().email("Invalid email format").trim().toLowerCase(),
  }).strict();