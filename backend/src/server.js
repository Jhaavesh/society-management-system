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
    const mongoose = await import("mongoose");
    const { Types } = mongoose.default || mongoose;
    const socId = new Types.ObjectId("60b8d295f1d2c72b1c345678");
    const bldId = new Types.ObjectId("60b8d295f1d2c72b1c345679");
    const flatId = new Types.ObjectId("60b8d295f1d2c72b1c34567a");
    const billId = new Types.ObjectId("60b8d295f1d2c72b1c34567b");

    const soc = await Society.create({ _id: socId, name: "Demo Society", active: true });
    
    // Dynamically import models to seed them
    const { Building, Flat, MaintenanceBill } = await import("./models/index.js");
    await Building.create({ _id: bldId, societyId: socId, name: "Block A", floors: 10 });
    await Flat.create({ _id: flatId, societyId: socId, buildingId: bldId, flatNumber: "101", floor: 1, status: "vacant" });
    await MaintenanceBill.create({ _id: billId, societyId: socId, flatId: flatId, month: 1, year: 2024, amount: 5000, dueDate: new Date() });

    const passwordHash = await bcrypt.hash("change-this-password", 10);
    await User.create({
      name: "Platform Admin",
      email: "admin@example.com",
      passwordHash,
      role: "platform_admin",
      societyIds: [soc._id]
    });
    console.log("Seeded default admin, society, building, flat, and bill.");
    console.log(`Test IDs: Society=${socId}, Building=${bldId}, Flat=${flatId}, Bill=${billId}`);
  }

  app.listen(port, () => console.log(`API listening on ${port}`));
}).catch((error) => {
  console.error("Database connection failed", error);
  process.exit(1);
});
