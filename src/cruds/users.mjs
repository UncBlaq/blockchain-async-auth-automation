import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const signUpUser = async (req) => {
    try {
        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                password: req.body.password
            }
        });
        return user; 
    } catch (error) {
        console.error(error);
        throw new Error("Failed to create user"); 
    }
};




