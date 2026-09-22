import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import Society from "../models/society.js";
import User from "../models/user.js";

await connectDatabase();
const email = String(process.env.ADMIN_EMAIL || "").toLowerCase();
if (!email) throw new Error("ADMIN_EMAIL is missing");
const password = process.env.ADMIN_PASSWORD || "change-this-password";
const user = await User.findOneAndUpdate(
  { email },
  { name: "Platform Admin", email, passwordHash: await bcrypt.hash(password, 12), role: "platform_admin", active: true },
  { upsert: true, new: true }
);
const society = await Society.findOneAndUpdate(
  { name: "Greenfield Heights" },
  { name: "Greenfield Heights", city: "Gurugram", state: "Haryana", createdBy: user._id },
  { upsert: true, new: true }
);
console.log(`Seeded ${email} and ${society.name}. Set ADMIN_PASSWORD in .env before production.`);
process.exit(0);
