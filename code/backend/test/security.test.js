import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import app from "../src/app.js";
import Society from "../src/models/society.js";
import User from "../src/models/user.js";
import Flat from "../src/models/flat.js";
import MaintenanceBill from "../src/models/maintenancebill.js";
import Payment from "../src/models/payment.js";
import Complaint from "../src/models/complaint.js";
import Visitor from "../src/models/visitor.js";
import Building from "../src/models/building.js";

process.env.JWT_SECRET = "test-secret";
let mongo;
let fixtures;

before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());
  await Promise.all([MaintenanceBill.init(), Payment.init()]);
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
  fixtures = await createFixtures();
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test("login includes flatId and resident bill reads are flat-scoped", async () => {
  const login = await request(app).post("/api/v1/auth/login").send({ email: "resident@example.com", password: "password" });
  assert.equal(login.status, 200);
  assert.equal(String(login.body.user.flatId), String(fixtures.flat._id));
  assert.equal(jwt.verify(login.body.token, process.env.JWT_SECRET).flatId, String(fixtures.flat._id));

  await MaintenanceBill.create([
    { societyId: fixtures.society._id, flatId: fixtures.flat._id, month: 9, year: 2026, amount: 100, dueDate: new Date() },
    { societyId: fixtures.society._id, flatId: fixtures.otherFlat._id, month: 9, year: 2026, amount: 200, dueDate: new Date() }
  ]);
  const response = await request(app).get(`/api/v1/maintenance?societyId=${fixtures.society._id}`).set("Authorization", `Bearer ${fixtures.residentToken}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 1);
  assert.equal(String(response.body.data[0].flatId._id || response.body.data[0].flatId), String(fixtures.flat._id));

  const noFlatToken = token({ sub: new mongoose.Types.ObjectId(), role: "resident", societyIds: [fixtures.society._id], flatId: null });
  const forbidden = await request(app).get(`/api/v1/maintenance?societyId=${fixtures.society._id}`).set("Authorization", `Bearer ${noFlatToken}`);
  assert.equal(forbidden.status, 403);
});

test("resident complaint and visitor requests cannot choose another flat", async () => {
  const complaint = await request(app).post("/api/v1/complaints").set("Authorization", `Bearer ${fixtures.residentToken}`).send({ societyId: fixtures.society._id, flatId: fixtures.otherFlat._id, category: "Security", description: "Test complaint" });
  assert.equal(complaint.status, 201);
  assert.equal(String(complaint.body.flatId), String(fixtures.flat._id));

  const visitor = await request(app).post("/api/v1/visitors").set("Authorization", `Bearer ${fixtures.residentToken}`).send({ societyId: fixtures.society._id, flatId: fixtures.otherFlat._id, visitorName: "Guest", visitDate: new Date().toISOString() });
  assert.equal(visitor.status, 201);
  assert.equal(String(visitor.body.flatId), String(fixtures.flat._id));
});

test("PATCH routes reject protected fields", async () => {
  const bill = await MaintenanceBill.create({ societyId: fixtures.society._id, flatId: fixtures.flat._id, month: 9, year: 2026, amount: 100, dueDate: new Date() });
  const complaint = await Complaint.create({ societyId: fixtures.society._id, flatId: fixtures.flat._id, userId: fixtures.resident._id, category: "Water", description: "Low pressure" });
  const visitor = await Visitor.create({ societyId: fixtures.society._id, flatId: fixtures.flat._id, visitorName: "Guest", visitDate: new Date() });
  for (const [path, body] of [[`/api/v1/maintenance/${bill._id}`, { societyId: new mongoose.Types.ObjectId() }], [`/api/v1/complaints/${complaint._id}`, { userId: new mongoose.Types.ObjectId() }], [`/api/v1/visitors/${visitor._id}`, { flatId: new mongoose.Types.ObjectId() }]]) {
     const response = await request(app).patch(path).set("Authorization", `Bearer ${fixtures.managerToken}`).query({ societyId: String(fixtures.society._id) }).send(body);
    assert.equal(response.status, 400);
  }
});

test("payments support partial balances and reject overpaying or duplicate references", async () => {
  const bill = await MaintenanceBill.create({ societyId: fixtures.society._id, flatId: fixtures.flat._id, month: 9, year: 2026, amount: 100, dueDate: new Date() });
  const base = { billId: bill._id, flatId: fixtures.flat._id, societyId: fixtures.society._id, method: "online", transactionRef: "txn-1" };
  const first = await request(app).post("/api/v1/payments").set("Authorization", `Bearer ${fixtures.managerToken}`).send({ ...base, amountPaid: 40 });
  assert.equal(first.status, 201);
  let updated = await MaintenanceBill.findById(bill._id).lean();
  assert.equal(updated.amountPaid, 40);
  assert.equal(updated.status, "pending");

  const duplicate = await request(app).post("/api/v1/payments").set("Authorization", `Bearer ${fixtures.managerToken}`).send({ ...base, amountPaid: 40 });
  assert.equal(duplicate.status, 409);
  const overpay = await request(app).post("/api/v1/payments").set("Authorization", `Bearer ${fixtures.managerToken}`).send({ ...base, transactionRef: "txn-2", amountPaid: 61 });
  assert.equal(overpay.status, 400);
  const final = await request(app).post("/api/v1/payments").set("Authorization", `Bearer ${fixtures.managerToken}`).send({ ...base, transactionRef: "txn-2", amountPaid: 60 });
  assert.equal(final.status, 201);
  updated = await MaintenanceBill.findById(bill._id).lean();
  assert.equal(updated.amountPaid, 100);
  assert.equal(updated.status, "paid");
  assert.equal(await Payment.countDocuments({ billId: bill._id }), 2);
});

async function createFixtures() {
  const society = await Society.create({ name: "Test Heights", city: "Test City" });
  const building = await Building.create({ societyId: society._id, name: "Main Building", floors: 2 });
  const flat = await Flat.create({ societyId: society._id, buildingId: building._id, flatNumber: "A-101", wing: "A" });
  const otherFlat = await Flat.create({ societyId: society._id, buildingId: building._id, flatNumber: "B-202", wing: "B" });
  const passwordHash = await bcrypt.hash("password", 4);
  const resident = await User.create({ name: "Test Resident", email: "resident@example.com", passwordHash, role: "resident", societyIds: [society._id], flatId: flat._id });
  const manager = await User.create({ name: "Test Manager", email: "manager@example.com", passwordHash, role: "society_admin", societyIds: [society._id] });
  return { society, flat, otherFlat, resident, residentToken: token({ sub: resident._id, name: resident.name, role: resident.role, societyIds: [society._id], flatId: flat._id }), managerToken: token({ sub: manager._id, name: manager.name, role: manager.role, societyIds: [society._id] }) };
}

function token(payload) { return jwt.sign({ ...payload, sub: String(payload.sub), societyIds: payload.societyIds.map(String), flatId: payload.flatId ? String(payload.flatId) : null }, process.env.JWT_SECRET); }
