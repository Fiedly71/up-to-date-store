import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";

export function generateTwoFactorSecret() {
  return generateSecret();
}

export async function generateTwoFactorQrCode(email: string, secret: string) {
  const otpauth = generateURI({
    issuer: "UpDate Tech & Digital Solutions",
    label: email,
    secret,
  });
  return QRCode.toDataURL(otpauth);
}

export async function verifyTwoFactorCode(secret: string, code: string) {
  try {
    const result = await verify({ secret, token: code });
    return result.valid;
  } catch {
    return false;
  }
}
