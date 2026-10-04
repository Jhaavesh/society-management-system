import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import Society from "../models/society.js";
import User from "../models/user.js";

async function seed() {
  await connectDatabase();
  
  // Find the society created by the main seed
  const society = await Society.findOne({ name: "Greenfield Heights" });
  if (!society) {
    console.log("Society 'Greenfield Heights' not found. Please create it first.");
    process.exit(1);
  }

  const email = "manager@greenfield.com";
  const password = "password123";
  
  const user = await User.findOneAndUpdate(
    { email },
    { 
      name: "Society Manager", 
      email, 
      passwordHash: await bcrypt.hash(password, 12), 
      role: "society_admin", 
      active: true,
      societyId: society._id
    },
    { upsert: true, new: true }
  );

  console.log("==================================================");
  console.log("✅ Society Admin created successfully!");
  console.log(`➡️  Email: ${email}`);
  console.log(`➡️  Password: ${password}`);
  console.log("==================================================");
  process.exit(0);
}

seed().catch(console.error);
