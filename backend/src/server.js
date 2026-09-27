import "dotenv/config";
import { connectDatabase } from "./config/db.js";
import app from "./app.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
const port = process.env.PORT || 5000;
import { User } from "./models/index.js";
import { Society } from "./models/index.js";
import bcrypt from "bcryptjs";

connectDatabase().then(async () => {
  // Seed logic for test memory server
  const exists = await User.findOne({ email: "admin@example.com" });
  if (!exists) {
    const soc = await Society.create({ name: "Demo Society", active: true });
    const passwordHash = await bcrypt.hash("change-this-password", 10);
    await User.create({
      name: "Platform Admin",
      email: "admin@example.com",
      passwordHash,
      role: "platform_admin",
      societyIds: [soc._id]
    });
    console.log("Seeded default admin and society.");
  }

  app.listen(port, () => console.log(`API listening on ${port}`));
}).catch((error) => {
  console.error("Database connection failed", error);
  process.exit(1);
});
