import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app.js";
import Building from "../src/models/building.js";
import Flat from "../src/models/flat.js";
import MaintenanceBill from "../src/models/maintenancebill.js";
import Payment from "../src/models/payment.js";
import Complaint from "../src/models/complaint.js";
import Notice from "../src/models/notice.js";
import Visitor from "../src/models/visitor.js";
import { initDb, cleanDb, closeDb, createFixtures } from "./setup.js";

let fixtures;

before(async () => {
  await initDb();
});

beforeEach(async () => {
  await cleanDb();
  fixtures = await createFixtures();
});

after(async () => {
  await closeDb();
});

test("TENANT: Society Admin A is blocked from accessing Society B via query param with 403", async () => {
  const res = await request(app)
    .get(`/api/v1/flats?societyId=${fixtures.societyB._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);

  assert.equal(res.status, 403);
  assert.match(res.body.message, /cannot access this society/i);
});

test("TENANT: Society Admin A is blocked from accessing Society B via path param with 403", async () => {
  const res = await request(app)
    .get(`/api/v1/buildings/${fixtures.societyB._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);

  assert.equal(res.status, 403);
  assert.match(res.body.message, /cannot access this society/i);
});

test("TENANT: Society Admin A is blocked from creating resources in Society B via body with 403", async () => {
  const res = await request(app)
    .post("/api/v1/flats")
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({
      societyId: fixtures.societyB._id,
      buildingId: fixtures.buildingB._id,
      flatNumber: "HACK-999"
    });

  assert.equal(res.status, 403);
  assert.match(res.body.message, /cannot access this society/i);
});

test("TENANT: Direct ObjectId access to another society's Building returns 404", async () => {
  // Try to GET Society B's building using Society A's scope
  const getRes = await request(app)
    .get(`/api/v1/buildings/${fixtures.societyA._id}/${fixtures.buildingB._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(getRes.status, 404);

  // Try to PATCH Society B's building
  const patchRes = await request(app)
    .patch(`/api/v1/buildings/${fixtures.societyA._id}/${fixtures.buildingB._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ name: "Hacked Building" });
  assert.equal(patchRes.status, 404);

  // Try to DELETE Society B's building
  const deleteRes = await request(app)
    .delete(`/api/v1/buildings/${fixtures.societyA._id}/${fixtures.buildingB._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(deleteRes.status, 404);
});

test("TENANT: Direct ObjectId access to another society's Flat returns 404", async () => {
  const getRes = await request(app)
    .get(`/api/v1/flats/${fixtures.flatB1._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(getRes.status, 404);

  const patchRes = await request(app)
    .patch(`/api/v1/flats/${fixtures.flatB1._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ flatNumber: "Hacked-Flat" });
  assert.equal(patchRes.status, 404);

  const deleteRes = await request(app)
    .delete(`/api/v1/flats/${fixtures.flatB1._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(deleteRes.status, 404);
});

test("TENANT: Direct ObjectId access to another society's Maintenance Bill returns 404", async () => {
  const billB = await MaintenanceBill.create({
    societyId: fixtures.societyB._id,
    flatId: fixtures.flatB1._id,
    month: 10,
    year: 2026,
    amount: 5000,
    dueDate: new Date()
  });

  const getRes = await request(app)
    .get(`/api/v1/maintenance/${billB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(getRes.status, 404);

  const patchRes = await request(app)
    .patch(`/api/v1/maintenance/${billB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ amount: 1 });
  assert.equal(patchRes.status, 404);

  const deleteRes = await request(app)
    .delete(`/api/v1/maintenance/${billB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(deleteRes.status, 404);
});

test("TENANT: Direct ObjectId access to another society's Payment returns 404", async () => {
  const billB = await MaintenanceBill.create({
    societyId: fixtures.societyB._id,
    flatId: fixtures.flatB1._id,
    month: 10,
    year: 2026,
    amount: 5000,
    dueDate: new Date()
  });
  const paymentB = await Payment.create({
    societyId: fixtures.societyB._id,
    billId: billB._id,
    flatId: fixtures.flatB1._id,
    amountPaid: 1000,
    method: "cash"
  });

  const getRes = await request(app)
    .get(`/api/v1/payments/${paymentB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(getRes.status, 404);

  const deleteRes = await request(app)
    .delete(`/api/v1/payments/${paymentB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(deleteRes.status, 404);
});

test("TENANT: Direct ObjectId access to another society's Complaint returns 404", async () => {
  const complaintB = await Complaint.create({
    societyId: fixtures.societyB._id,
    flatId: fixtures.flatB1._id,
    userId: fixtures.users.residentB._id,
    category: "Electrical",
    description: "Power outage in Block B"
  });

  const getRes = await request(app)
    .get(`/api/v1/complaints/${complaintB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(getRes.status, 404);

  const patchRes = await request(app)
    .patch(`/api/v1/complaints/${complaintB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ status: "closed" });
  assert.equal(patchRes.status, 404);

  const deleteRes = await request(app)
    .delete(`/api/v1/complaints/${complaintB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(deleteRes.status, 404);
});

test("TENANT: Direct ObjectId access to another society's Notice returns 404", async () => {
  const noticeB = await Notice.create({
    societyId: fixtures.societyB._id,
    title: "Secret Society B Meeting",
    content: "Confidential agenda for B only",
    publishedBy: fixtures.users.societyAdminB._id
  });

  const getRes = await request(app)
    .get(`/api/v1/notices/${noticeB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(getRes.status, 404);

  const patchRes = await request(app)
    .patch(`/api/v1/notices/${noticeB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ title: "Tampered Notice" });
  assert.equal(patchRes.status, 404);

  const deleteRes = await request(app)
    .delete(`/api/v1/notices/${noticeB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(deleteRes.status, 404);
});

test("TENANT: Direct ObjectId access to another society's Visitor entry returns 404", async () => {
  const visitorB = await Visitor.create({
    societyId: fixtures.societyB._id,
    flatId: fixtures.flatB1._id,
    visitorName: "Secret VIP Visitor B",
    visitDate: new Date()
  });

  const getRes = await request(app)
    .get(`/api/v1/visitors/${visitorB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(getRes.status, 404);

  const patchRes = await request(app)
    .patch(`/api/v1/visitors/${visitorB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ status: "approved" });
  assert.equal(patchRes.status, 404);

  const deleteRes = await request(app)
    .delete(`/api/v1/visitors/${visitorB._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(deleteRes.status, 404);
});

test("TENANT: Cross-society relationship attack - Flat in Society A referencing Building in Society B is rejected with 400", async () => {
  const res = await request(app)
    .post("/api/v1/flats")
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({
      societyId: fixtures.societyA._id,
      buildingId: fixtures.buildingB._id, // cross-society building!
      flatNumber: "303",
      floor: 3
    });

  assert.equal(res.status, 400);
  assert.match(res.body.message, /building does not belong/i);
});

test("TENANT: Cross-society relationship attack - Resident in Society A assigned to Flat in Society B is rejected with 400", async () => {
  const res = await request(app)
    .post("/api/v1/residents")
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({
      societyId: fixtures.societyA._id,
      flatId: fixtures.flatB1._id, // flat belongs to Society B!
      name: "Attacker Resident",
      email: "attacker@test.com",
      password: "Password123!"
    });

  assert.equal(res.status, 400);
  assert.match(res.body.message, /flat does not belong/i);
});

test("TENANT: Cross-society relationship attack - Maintenance Bill in Society A referencing Flat in Society B is rejected with 400", async () => {
  const res = await request(app)
    .post("/api/v1/maintenance")
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({
      societyId: fixtures.societyA._id,
      flatId: fixtures.flatB1._id, // flat in Society B!
      month: 11,
      year: 2026,
      amount: 1500,
      dueDate: new Date().toISOString()
    });

  assert.equal(res.status, 400);
  assert.match(res.body.message, /flat does not belong/i);
});

test("TENANT: Cross-society relationship attack - Payment in Society A referencing Bill in Society B is rejected with 400", async () => {
  const billB = await MaintenanceBill.create({
    societyId: fixtures.societyB._id,
    flatId: fixtures.flatB1._id,
    month: 11,
    year: 2026,
    amount: 2000,
    dueDate: new Date()
  });

  const res = await request(app)
    .post("/api/v1/payments")
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({
      societyId: fixtures.societyA._id,
      billId: billB._id,
      flatId: fixtures.flatA1._id,
      amountPaid: 500,
      method: "online"
    });

  assert.equal(res.status, 400);
  assert.match(res.body.message, /bill does not belong/i);
});

test("TENANT: Dashboard metrics isolation - Society A KPIs do not leak Society B data", async () => {
  // Create extensive data in Society B
  await Flat.create([
    { societyId: fixtures.societyB._id, buildingId: fixtures.buildingB._id, flatNumber: "B-301" },
    { societyId: fixtures.societyB._id, buildingId: fixtures.buildingB._id, flatNumber: "B-302" }
  ]);
  const billB = await MaintenanceBill.create({
    societyId: fixtures.societyB._id,
    flatId: fixtures.flatB1._id,
    month: 10,
    year: 2026,
    amount: 10000,
    amountPaid: 10000,
    status: "paid",
    dueDate: new Date()
  });
  await Payment.create({
    societyId: fixtures.societyB._id,
    billId: billB._id,
    flatId: fixtures.flatB1._id,
    amountPaid: 10000,
    method: "online"
  });
  await Complaint.create({
    societyId: fixtures.societyB._id,
    flatId: fixtures.flatB1._id,
    userId: fixtures.users.residentB._id,
    category: "Water",
    description: "Issue in B",
    status: "open"
  });

  // Now request Society A dashboard as Society Admin A
  const res = await request(app)
    .get(`/api/v1/dashboard/${fixtures.societyA._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  const kpis = res.body.data.kpis;

  // Society A has flatA1 and flatA2 (2 homes), not Society B's 3 homes
  assert.equal(kpis.homes, 2);
  // Society A has 0 payments recorded (10000 was in Society B)
  assert.equal(kpis.collected, 0);
  // Society A has 0 open complaints (the open complaint was in Society B)
  assert.equal(kpis.openRequests, 0);
  // Society A has 1 active resident
  assert.equal(kpis.residents, 1);
});

test("TENANT: Platform Super Admin has valid cross-society access", async () => {
  // Can view Society A dashboard
  const resA = await request(app)
    .get(`/api/v1/dashboard/${fixtures.societyA._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.platformAdmin}`);
  assert.equal(resA.status, 200);

  // Can view Society B dashboard
  const resB = await request(app)
    .get(`/api/v1/dashboard/${fixtures.societyB._id}?societyId=${fixtures.societyB._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.platformAdmin}`);
  assert.equal(resB.status, 200);

  // Can list all societies (sees both A and B)
  const listRes = await request(app)
    .get("/api/v1/societies")
    .set("Authorization", `Bearer ${fixtures.tokens.platformAdmin}`);
  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.data.length >= 2);
});

