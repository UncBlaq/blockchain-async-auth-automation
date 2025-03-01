import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createResetToken } from "./jwt.mjs";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: process.env.MAIL_PORT, // Gmail SMTP port
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

/**
 * Send an email
 * @param {string|string[]} recipient - Single email or array of recipients
 * @param {string} subject - Email subject
 * @param {string} htmlBody - Email body in HTML format
 */
export const sendEmail = async (recipient, subject, htmlBody) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: Array.isArray(recipient) ? recipient.join(",") : recipient,
      subject,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${recipient}`);
  } catch (error) {
    console.error(`❌ Email sending failed: ${error.message}`);
    throw new Error("Failed to send email");
  }
};



/**
 * Generate a verification email and send it to the user.
 * @param {string} email - The recipient's email.
 * @param {string} userId - User ID for URL generation.
 */
export const sendVerificationEmail = async (email, userId) => {
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
  const token = createUrlSafeToken({ email }); // Replace with your JWT function
  const verificationLink = `${frontendURL}/verify/${userId}/${token}`;

  const emailBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body>
        <h3>Account Verification</h3>
        <p>Welcome! Click the button below to verify your account:</p>
        <a href="${verificationLink}" 
           style="display:inline-block;margin-top:1rem;padding:1rem;
                  border-radius:0.5rem;font-size:1rem;text-decoration:none;
                  background:#27B55B;color:white;">
          Verify Your Email
        </a>
        <p>If you did not sign up, ignore this email.</p>
    </body>
    </html>
  `;

  await sendEmail(email, "Email Verification", emailBody);
};

/**
 * Sends a password reset email to the user.
 * @param {string} email - The user's email.
 * @param {string} userId - The user's ID.
 */
export const sendPasswordResetEmail = async (email, userId) => {
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
  const token = createResetToken({ email });
  const resetLink = `${frontendURL}/reset-password/${token}`;

  const emailBody = `
    <h3>Password Reset Request</h3>
    <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
    <a href="${resetLink}" style="padding:1rem;border-radius:0.5rem;
        background:#ff4757;color:white;text-decoration:none;">
      Reset Password
    </a>
    <p>If you did not request this, ignore this email.</p>
  `;

  await sendEmail(email, "Password Reset Request", emailBody);
};

