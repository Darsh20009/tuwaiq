import { MongoClient } from "mongodb";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/twaq";

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  // Delete existing admin to ensure fresh seed with correct password hash
  await db.collection("users").deleteOne({ mobile: "0500000000" });
  
  const hashedPassword = await hashPassword("admin123");
  await db.collection("users").insertOne({
    name: "مدير النظام",
    mobile: "0500000000",
    password: hashedPassword,
    role: "admin",
    isPublicDonor: false,
    totalDonations: "0",
    createdAt: new Date()
  });
  console.log("Admin user created/reset: mobile=0500000000, password=admin123");

  await client.close();
}

seedAdmin().catch(console.error);
