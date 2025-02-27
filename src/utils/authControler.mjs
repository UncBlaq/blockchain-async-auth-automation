import speakeasy from "speakeasy";
import QRCode from "qrcode";

import { verifyResetToken } from "./jwt.mjs";
import { sendPasswordResetEmail } from "./emailService.mjs";

/**
 * Initiate password reset (send email with token)
 */
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await sendPasswordResetEmail(user.email, user.id);
    res.json({ message: "Password reset email sent!" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
};

/**
 * Handle resetting the password
 */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = verifyResetToken(token);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};


/**
 * Generates a secret key for 2FA.
 */
export const generate2FASecret = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  return { secret: secret.base32, otpauth_url: secret.otpauth_url };
};

/**
 * Verifies a 2FA token
 * @param {string} token - The OTP provided by the user.
 * @param {string} secret - The user's stored secret.
 */
export const verify2FAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // Allow slight time drift
  });
};

/**
 * Generate QR code for user
 * @param {string} otpauth_url - OTP Auth URL.
 */
export const generateQRCode = async (otpauth_url) => {
  return await QRCode.toDataURL(otpauth_url);
};

/**
 * Setup 2FA for a user
 */
export const setup2FA = async (req, res) => {
  const userId = req.user.id; // Assume user is authenticated
  const { secret, otpauth_url } = generate2FASecret();

  // Save secret in database
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  // Send QR Code to frontend
  const qrCode = await generateQRCode(otpauth_url);
  res.json({ qrCode });
};

/**
 * Verify 2FA OTP
 */
export const verify2FA = async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id; // Assume user is authenticated

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret) return res.status(400).json({ message: "2FA not enabled" });

  const isValid = verify2FAToken(token, user.twoFactorSecret);
  if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

  res.json({ message: "2FA verification successful" });
};

