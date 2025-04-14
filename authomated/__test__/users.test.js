import { checkExistingEmail } from "../src/utils/users.mjs"
import {prisma} from "../src/server.mjs";
import { createUser } from "../src/handlers/userControler.mjs";
import { signUpUser } from "../src/cruds/users.mjs";
import { sendVerificationEmail } from "../src/utils/emailService.mjs";
import { hashPassword } from "../src/utils/hash.mjs";

jest.mock('../src/server.mjs', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));
describe('checkExistingEmail middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
          body: {
            email: 'test@example.com',
            password : 'Testpassword12@'
          }
        };
    
        mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
    
        mockNext = jest.fn();
      });
    

    it('should return 400 if email already exists', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com', password : 'Testpassword12@'});
    
        await checkExistingEmail(mockReq, mockRes, mockNext);
    
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Email already exists' });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should call mockNext() if email does not exist', async () => {
        prisma.user.findUnique.mockResolvedValue(null);
    
        await checkExistingEmail(mockReq, mockRes, mockNext);
    
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });
    
      it('should return 500 if an error occurs', async () => {
        prisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    
        await checkExistingEmail(mockReq, mockRes, mockNext);
    
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error while checking email' });
        expect(mockNext).not.toHaveBeenCalled();
      });

})


jest.mock('../src/server.mjs', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock("../src/cruds/users.mjs", () => ({
  signUpUser: jest.fn()
}));

jest.mock("../src/utils/emailService.mjs", () => ({
  sendVerificationEmail: jest.fn()
}));

jest.mock("../src/utils/hash.mjs", () => ({
  hashPassword: jest.fn()
}));

jest.mock("../src/utils/hash.mjs", () => ({
  hashPassword: jest.fn((plainpassword)=>`hashed_${plainpassword}`)
}));

describe("createUser controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        email: "test@example.com",
        password: "plainpassword"
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(()=>mockRes)

    };

    hashPassword.mockReturnValue("hashedPassword123");
    signUpUser.mockResolvedValue({
      id: "hfdfdkfkgk45566776rfnfffgtkttyy",  
      email: 'test@example.com',
      isVerified: false, 
      name: 'Test User'
    });
    sendVerificationEmail.mockResolvedValue();
  });

  it("should create a user and return 201", async () => {
    await createUser(mockReq, mockRes);

    expect(hashPassword).toHaveBeenCalledWith("plainpassword");
    expect(hashPassword).toHaveReturnedWith("hashedPassword123")
    expect(signUpUser).toHaveBeenCalledWith(mockReq);
    expect(sendVerificationEmail).toHaveBeenCalledWith("test@example.com", 'hfdfdkfkgk45566776rfnfffgtkttyy');
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "User created successfully",
      user: expect.any(Object),
      links: expect.any(Array)
    }));
    expect(mockRes.status).toHaveBeenCalledWith(201);

  });

  it("should return 500 on error", async () => {
    signUpUser.mockRejectedValue(new Error("DB error"));

    await createUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "DB error" });
  });
});
