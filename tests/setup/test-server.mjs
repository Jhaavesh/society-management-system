import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import app from "../../backend/src/app.js";
import Society from "../../backend/src/models/society.js";
import User from "../../backend/src/models/user.js";
import Building from "../../backend/src/models/building.js";
import Flat from "../../backend/src/models/flat.js";
import MaintenanceBill from "../../backend/src/models/maintenancebill.js";
import Notice from "../../backend/src/models/notice.js";
import Visitor from "../../backend/src/models/visitor.js";

process.env.JWT_SECRET = "test-super-secret-jwt-key-minimum-32-chars-for-tests";
process.env.NODE_ENV = "test";
process.env.PORT = "5000";

console.log("Starting MongoMemoryReplSet for E2E tests...");
const mongoServer = await MongoMemoryReplSet.create({
  replSet: { count: 1 },
  instanceOpts: [{ launchTimeout: 60000 }]
});

const uri = mongoServer.getUri();
console.log(`MongoMemoryReplSet started at: ${uri}`);

// Save to .test-env.json for Playwright tests
fs.writeFileSync(
  path.resolve(".test-env.json"),
  JSON.stringify({ MONGODB_URI: uri }, null, 2),
  "utf8"
);

await mongoose.connect(uri);
console.log("Connected Mongoose to test memory database");

// Seed database for E2E tests
const hashedPassword = await bcrypt.hash("Test1234!", 10);

const society = await Society.findOneAndUpdate(
  { name: "Greenfield Heights" },
  {
    name: "Greenfield Heights",
    city: "Gurugram",
    state: "Haryana",
    address: "Sector 45",
    pincode: "122003",
    active: true
  },
  { upsert: true, returnDocument: "after" }
);

const building = await Building.findOneAndUpdate(
  { societyId: society._id, name: "Main Building" },
  { societyId: society._id, name: "Main Building", floors: 10, active: true },
  { upsert: true, returnDocument: "after" }
);

const flat = await Flat.findOneAndUpdate(
  { societyId: society._id, flatNumber: "A-101" },
  {
    societyId: society._id,
    buildingId: building._id,
    flatNumber: "A-101",
    floor: 1,
    wing: "A",
    status: "occupied"
  },
  { upsert: true, returnDocument: "after" }
);

// Platform Admin
await User.findOneAndUpdate(
  { email: "jhaavesh@gmail.com" },
  {
    name: "Platform Admin",
    email: "jhaavesh@gmail.com",
    passwordHash: hashedPassword,
    role: "platform_admin",
    active: true,
    societyId: society._id
  },
  { upsert: true }
);

// Society Admin
await User.findOneAndUpdate(
  { email: "admin@example.com" },
  {
    name: "Society Admin",
    email: "admin@example.com",
    passwordHash: hashedPassword,
    role: "society_admin",
    active: true,
    societyId: society._id
  },
  { upsert: true }
);

// Resident User
const resident = await User.findOneAndUpdate(
  { email: "resident@mobile.test" },
  {
    name: "Mobile Resident",
    email: "resident@mobile.test",
    passwordHash: hashedPassword,
    role: "resident",
    active: true,
    societyId: society._id,
    flatId: flat._id
  },
  { upsert: true, returnDocument: "after" }
);

await Flat.updateOne({ _id: flat._id }, { $addToSet: { residentIds: resident._id } });

// Accountant User
await User.findOneAndUpdate(
  { email: "accountant@mobile.test" },
  {
    name: "Mobile Accountant",
    email: "accountant@mobile.test",
    passwordHash: hashedPassword,
    role: "accountant",
    active: true,
    societyId: society._id
  },
  { upsert: true }
);

// Seed Maintenance Bill for the flat
await MaintenanceBill.findOneAndUpdate(
  { societyId: society._id, flatId: flat._id, month: 10, year: 2026 },
  {
    societyId: society._id,
    flatId: flat._id,
    month: 10,
    year: 2026,
    amount: 3500,
    amountPaid: 0,
    status: "pending",
    dueDate: new Date("2026-11-15")
  },
  { upsert: true }
);

// Seed Notice
await Notice.findOneAndUpdate(
  { societyId: society._id, title: "Welcome to Greenfield Heights" },
  {
    societyId: society._id,
    title: "Welcome to Greenfield Heights",
    content: "Maintenance is due by the 15th of each month.",
    validTill: new Date("2026-12-31"),
    publishedBy: resident._id
  },
  { upsert: true }
);

console.log("Database seeded successfully with all roles and test data!");

const server = app.listen(5000, () => {
  console.log("Backend API listening on http://localhost:5000");
});

const cleanup = async () => {
  console.log("Shutting down test backend server...");
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  if (fs.existsSync(path.resolve(".test-env.json"))) {
    fs.unlinkSync(path.resolve(".test-env.json"));
  }
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
