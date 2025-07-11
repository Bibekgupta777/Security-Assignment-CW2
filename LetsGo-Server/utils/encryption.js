const crypto = require("crypto");

const secretKey = process.env.ENCRYPTION_SECRET;

if (!secretKey) {
  throw new Error("ENCRYPTION_SECRET is not defined in .env");
}

if (secretKey.length !== 32) {
  throw new Error("ENCRYPTION_SECRET must be exactly 32 characters long");
}

const algorithm = "aes-256-cbc";
const ivLength = 16; // AES block size

function encrypt(text) {
  if (!text) return text;

  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "utf8"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(data) {
  if (!data) return data;

  const parts = data.split(":");
  if (parts.length !== 2) return data;

  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "utf8"), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encrypt, decrypt };
