import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import Society from "../src/models/society.js";
import User from "../src/models/user.js";
import Building from "../src/models/building.js";
import Flat from "../src/models/flat.js";
import MaintenanceBill from "../src/models/maintenancebill.js";
import Payment from "../src/models/payment.js";
import Complaint from "../src/models/complaint.js";
import Notice from "../src/models/notice.js";
import Visitor from "../src/models/visitor.js";

process.env.JWT_SECRET = "test-super-secret-jwt-key-minimum-32-chars-for-tests";
process.env.NODE_ENV = "test";

let mongoServer = null;

export async function initDb() {
  if (!mongoServer) {
    mongoServer = await MongoMemoryReplSet.create({
      replSet: { count: 1 },
      instanceOpts: [{ launchTimeout: 60000 }]
    });
    await mongoose.connect(mongoServer.getUri());
    await Promise.all([
      MaintenanceBill.init(),
      Payment.init(),
      Flat.init(),
      User.init(),
      Society.init(),
      Building.init(),
      Complaint.init(),
      Notice.init(),
      Visitor.init()
    ]);
  }
  return mongoServer;
}

export async function cleanDb() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await Promise.all([
      MaintenanceBill.createIndexes(),
      Payment.createIndexes(),
      Flat.createIndexes(),
      User.createIndexes(),
      Society.createIndexes(),
      Building.createIndexes(),
      Complaint.createIndexes(),
      Notice.createIndexes(),
      Visitor.createIndexes()
    ]);
  }
}

export async function closeDb() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

export function generateToken(payload) {
  return jwt.sign(
    {
      sub: String(payload.sub),
      name: payload.name || "Test User",
      role: payload.role,
      societyId: payload.societyId ? String(payload.societyId) : null,
      flatId: payload.flatId ? String(payload.flatId) : null,
      ...payload
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

export async function createFixtures() {
  const passwordHash = await bcrypt.hash("Test1234!", 4);

  // Society A
  const societyA = await Society.create({
    name: "Greenfield Heights",
    city: "Gurugram",
    state: "Haryana",
    address: "Sector 45",
    pincode: "122003"
  });

  // Society B (for multi-tenant isolation testing)
  const societyB = await Society.create({
    name: "Silver Oaks",
    city: "Bengaluru",
    state: "Karnataka",
    address: "Indiranagar",
    pincode: "560038"
  });

  // Buildings
  const buildingA = await Building.create({ societyId: societyA._id, name: "Tower A", floors: 10 });
  const buildingB = await Building.create({ societyId: societyB._id, name: "Block 1", floors: 5 });

  // Flats
  const flatA1 = await Flat.create({ societyId: societyA._id, buildingId: buildingA._id, flatNumber: "101", wing: "A", floor: 1 });
  const flatA2 = await Flat.create({ societyId: societyA._id, buildingId: buildingA._id, flatNumber: "102", wing: "A", floor: 1 });
  const flatB1 = await Flat.create({ societyId: societyB._id, buildingId: buildingB._id, flatNumber: "201", wing: "B", floor: 2 });

  // Users in Society A
  const platformAdmin = await User.create({
    name: "Platform Admin",
    email: "platform@test.com",
    passwordHash,
    role: "platform_admin",
    active: true
  });

  const societyAdminA = await User.create({
    name: "Admin Society A",
    email: "admin-a@test.com",
    passwordHash,
    role: "society_admin",
    societyId: societyA._id,
    active: true
  });

  const accountantA = await User.create({
    name: "Accountant Society A",
    email: "accountant-a@test.com",
    passwordHash,
    role: "accountant",
    societyId: societyA._id,
    active: true
  });

  const securityA = await User.create({
    name: "Security Society A",
    email: "security-a@test.com",
    passwordHash,
    role: "security",
    societyId: societyA._id,
    active: true
  });

  const residentA = await User.create({
    name: "Resident Society A",
    email: "resident-a@test.com",
    passwordHash,
    role: "resident",
    societyId: societyA._id,
    flatId: flatA1._id,
    active: true
  });

  // Users in Society B
  const societyAdminB = await User.create({
    name: "Admin Society B",
    email: "admin-b@test.com",
    passwordHash,
    role: "society_admin",
    societyId: societyB._id,
    active: true
  });

  const residentB = await User.create({
    name: "Resident Society B",
    email: "resident-b@test.com",
    passwordHash,
    role: "resident",
    societyId: societyB._id,
    flatId: flatB1._id,
    active: true
  });

  // Attach resident to flat
  await Flat.updateOne({ _id: flatA1._id }, { status: "occupied", residentIds: [residentA._id] });
  await Flat.updateOne({ _id: flatB1._id }, { status: "occupied", residentIds: [residentB._id] });

  // Tokens
  const tokens = {
    platformAdmin: generateToken({ sub: platformAdmin._id, role: "platform_admin" }),
    societyAdminA: generateToken({ sub: societyAdminA._id, role: "society_admin", societyId: societyA._id }),
    accountantA: generateToken({ sub: accountantA._id, role: "accountant", societyId: societyA._id }),
    securityA: generateToken({ sub: securityA._id, role: "security", societyId: societyA._id }),
    residentA: generateToken({ sub: residentA._id, role: "resident", societyId: societyA._id, flatId: flatA1._id }),
    societyAdminB: generateToken({ sub: societyAdminB._id, role: "society_admin", societyId: societyB._id }),
    residentB: generateToken({ sub: residentB._id, role: "resident", societyId: societyB._id, flatId: flatB1._id }),
  };

  return {
    societyA,
    societyB,
    buildingA,
    buildingB,
    flatA1,
    flatA2,
    flatB1,
    users: { platformAdmin, societyAdminA, accountantA, securityA, residentA, societyAdminB, residentB },
    tokens,
  };
}
