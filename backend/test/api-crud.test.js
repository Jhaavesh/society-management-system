import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app.js";
import Flat from "../src/models/flat.js";
import MaintenanceBill from "../src/models/maintenancebill.js";
import Payment from "../src/models/payment.js";
import User from "../src/models/user.js";
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

test("CRUD: Buildings module complete lifecycle and validation", async () => {
  const socId = fixtures.societyA._id;
  const token = fixtures.tokens.societyAdminA;

  // 1. Create Building
  const createRes = await request(app)
    .post(`/api/v1/buildings/${socId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Tower Omega", floors: 15 });
  assert.equal(createRes.status, 201);
  const buildingId = createRes.body._id;
  assert.equal(createRes.body.name, "Tower Omega");
  assert.equal(createRes.body.floors, 15);

  // Validation: Missing name
  const invalidCreate = await request(app)
    .post(`/api/v1/buildings/${socId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ floors: 15 });
  assert.equal(invalidCreate.status, 400);

  // 2. Get Building
  const getRes = await request(app)
    .get(`/api/v1/buildings/${socId}/${buildingId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.name, "Tower Omega");

  // 3. Update Building
  const updateRes = await request(app)
    .patch(`/api/v1/buildings/${socId}/${buildingId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ floors: 18 });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.floors, 18);

  // 4. List Buildings with pagination
  const listRes = await request(app)
    .get(`/api/v1/buildings/${socId}?page=1&limit=10`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.data.length >= 2);
  assert.equal(listRes.body.pagination.page, 1);
  assert.ok(listRes.body.pagination.total >= 2);

  // 5. Delete Building
  const deleteRes = await request(app)
    .delete(`/api/v1/buildings/${socId}/${buildingId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(deleteRes.status, 200);

  // Verify deleted
  const getDeleted = await request(app)
    .get(`/api/v1/buildings/${socId}/${buildingId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(getDeleted.status, 404);
});

test("CRUD: Flats module complete lifecycle and unique constraint", async () => {
  const socId = fixtures.societyA._id;
  const token = fixtures.tokens.societyAdminA;

  // 1. Create Flat
  const createRes = await request(app)
    .post("/api/v1/flats")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      buildingId: fixtures.buildingA._id,
      flatNumber: "A-501",
      floor: 5,
      wing: "A"
    });
  assert.equal(createRes.status, 201);
  const flatId = createRes.body._id;

  // 2. Duplicate Flat in same building should be rejected with 409
  const duplicateRes = await request(app)
    .post("/api/v1/flats")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      buildingId: fixtures.buildingA._id,
      flatNumber: "A-501",
      floor: 5,
      wing: "A"
    });
  assert.equal(duplicateRes.status, 409);
  assert.match(duplicateRes.body.message, /already exists/i);

  // 3. Update Flat
  const updateRes = await request(app)
    .patch(`/api/v1/flats/${flatId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "occupied" });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.status, "occupied");

  // 4. Delete Flat
  const deleteRes = await request(app)
    .delete(`/api/v1/flats/${flatId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(deleteRes.status, 200);
});

test("CRUD: Residents lifecycle, password complexity, flat assignment and removal", async () => {
  const socId = fixtures.societyA._id;
  const token = fixtures.tokens.societyAdminA;

  // 1. Password complexity rejection: missing uppercase or number
  const weakPassRes = await request(app)
    .post("/api/v1/residents")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      flatId: fixtures.flatA2._id,
      name: "New Resident",
      email: "newres@test.com",
      password: "weakpassword"
    });
  assert.equal(weakPassRes.status, 400);

  // 2. Valid Resident Creation
  const createRes = await request(app)
    .post("/api/v1/residents")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      flatId: fixtures.flatA2._id,
      name: "John Resident",
      email: "john.resident@test.com",
      password: "SecurePassword123!",
      phone: "9876543210"
    });
  assert.equal(createRes.status, 201);
  const residentId = createRes.body.data?.id || createRes.body.id;

  // Verify flat is now occupied
  const flatAfterAssign = await Flat.findById(fixtures.flatA2._id).lean();
  assert.equal(flatAfterAssign.status, "occupied");
  assert.ok(flatAfterAssign.residentIds.map(String).includes(String(residentId)));

  // 3. Duplicate Email Rejection
  const dupEmailRes = await request(app)
    .post("/api/v1/residents")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      flatId: fixtures.flatA2._id,
      name: "Duplicate User",
      email: "john.resident@test.com",
      password: "SecurePassword123!"
    });
  assert.equal(dupEmailRes.status, 409);

  // 4. Update Resident
  const updateRes = await request(app)
    .patch(`/api/v1/residents/${residentId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ phone: "9998887776" });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.phone, "9998887776");

  // 5. Remove Resident frees up flat
  const removeRes = await request(app)
    .delete(`/api/v1/residents/${residentId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(removeRes.status, 200);

  const flatAfterRemove = await Flat.findById(fixtures.flatA2._id).lean();
  assert.equal(flatAfterRemove.status, "vacant");
  assert.equal(flatAfterRemove.residentIds.length, 0);
});

test("CRUD: Maintenance Bills and Payments ACID transaction and partial payoff", async () => {
  const socId = fixtures.societyA._id;
  const token = fixtures.tokens.accountantA;

  // 1. Create Maintenance Bill
  const billRes = await request(app)
    .post("/api/v1/maintenance")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      flatId: fixtures.flatA1._id,
      month: 12,
      year: 2026,
      amount: 4000,
      dueDate: new Date("2026-12-15").toISOString()
    });
  assert.equal(billRes.status, 201);
  const billId = billRes.body._id;

  // Duplicate bill for same month/year/flat/society should fail with 11000
  const dupBill = await request(app)
    .post("/api/v1/maintenance")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      flatId: fixtures.flatA1._id,
      month: 12,
      year: 2026,
      amount: 4000,
      dueDate: new Date("2026-12-15").toISOString()
    });
  assert.ok(dupBill.status >= 400);

  // 2. Partial Payment 1: 1500 of 4000
  const pay1 = await request(app)
    .post("/api/v1/payments")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      billId,
      flatId: fixtures.flatA1._id,
      amountPaid: 1500,
      method: "online",
      transactionRef: "TXN-E2E-001"
    });
  assert.equal(pay1.status, 201);

  let billInDb = await MaintenanceBill.findById(billId).lean();
  assert.equal(billInDb.amountPaid, 1500);
  assert.equal(billInDb.status, "pending");

  // 3. Duplicate Transaction Ref rejection with 409
  const dupPayRef = await request(app)
    .post("/api/v1/payments")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      billId,
      flatId: fixtures.flatA1._id,
      amountPaid: 500,
      method: "online",
      transactionRef: "TXN-E2E-001"
    });
  assert.equal(dupPayRef.status, 409);

  // 4. Overpayment Rejection: remaining balance is 2500, trying to pay 2501
  const overpay = await request(app)
    .post("/api/v1/payments")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      billId,
      flatId: fixtures.flatA1._id,
      amountPaid: 2501,
      method: "cash"
    });
  assert.equal(overpay.status, 400);
  assert.match(overpay.body.message, /exceeds remaining balance/i);

  // 5. Final Payment of remainder 2500
  const pay2 = await request(app)
    .post("/api/v1/payments")
    .set("Authorization", `Bearer ${token}`)
    .send({
      societyId: socId,
      billId,
      flatId: fixtures.flatA1._id,
      amountPaid: 2500,
      method: "online",
      transactionRef: "TXN-E2E-002"
    });
  assert.equal(pay2.status, 201);

  billInDb = await MaintenanceBill.findById(billId).lean();
  assert.equal(billInDb.amountPaid, 4000);
  assert.equal(billInDb.status, "paid");

  // 6. Delete Payment restores bill status and balance
  const deletePayRes = await request(app)
    .delete(`/api/v1/payments/${pay2.body._id}?societyId=${socId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(deletePayRes.status, 200);

  billInDb = await MaintenanceBill.findById(billId).lean();
  assert.equal(billInDb.amountPaid, 1500);
  assert.equal(billInDb.status, "pending");
});

test("CRUD: Complaints, Notices, and Visitors lifecycle and validation", async () => {
  const socId = fixtures.societyA._id;
  const adminToken = fixtures.tokens.societyAdminA;
  const resToken = fixtures.tokens.residentA;
  const secToken = fixtures.tokens.securityA;

  // --- Complaints ---
  // Resident creates complaint
  const complaintRes = await request(app)
    .post("/api/v1/complaints")
    .set("Authorization", `Bearer ${resToken}`)
    .send({
      societyId: socId,
      category: "Elevator",
      description: "Lift stuck on floor 3",
      priority: "high"
    });
  assert.equal(complaintRes.status, 201);
  assert.equal(String(complaintRes.body.flatId), String(fixtures.flatA1._id));
  const complaintId = complaintRes.body._id;

  // Manager updates complaint
  const updateComplaint = await request(app)
    .patch(`/api/v1/complaints/${complaintId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "in_progress" });
  assert.equal(updateComplaint.status, 200);
  assert.equal(updateComplaint.body.status, "in_progress");

  // Manager deletes complaint
  const deleteComplaint = await request(app)
    .delete(`/api/v1/complaints/${complaintId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(deleteComplaint.status, 200);

  // --- Notices ---
  // Admin creates notice
  const noticeRes = await request(app)
    .post("/api/v1/notices")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      societyId: socId,
      title: "Annual General Meeting",
      content: "AGM scheduled for upcoming Sunday at 10 AM.",
      validTill: new Date("2026-11-30").toISOString()
    });
  assert.equal(noticeRes.status, 201);
  const noticeId = noticeRes.body._id;

  // Resident reads notice
  const readNotice = await request(app)
    .get(`/api/v1/notices/${noticeId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${resToken}`);
  assert.equal(readNotice.status, 200);
  assert.equal(readNotice.body.title, "Annual General Meeting");

  // Admin deletes notice
  const deleteNotice = await request(app)
    .delete(`/api/v1/notices/${noticeId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(deleteNotice.status, 200);

  // --- Visitors ---
  // Resident creates visitor request
  const visitorRes = await request(app)
    .post("/api/v1/visitors")
    .set("Authorization", `Bearer ${resToken}`)
    .send({
      societyId: socId,
      visitorName: "Electrician Mike",
      visitorMobile: "9123456780",
      visitDate: new Date().toISOString()
    });
  assert.equal(visitorRes.status, 201);
  assert.equal(String(visitorRes.body.flatId), String(fixtures.flatA1._id));
  const visitorId = visitorRes.body._id;

  // Security checks in visitor
  const secCheckIn = await request(app)
    .patch(`/api/v1/visitors/${visitorId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${secToken}`)
    .send({ status: "checked_in" });
  assert.equal(secCheckIn.status, 200);
  assert.equal(secCheckIn.body.status, "checked_in");

  // Security checks out visitor
  const secCheckOut = await request(app)
    .patch(`/api/v1/visitors/${visitorId}?societyId=${socId}`)
    .set("Authorization", `Bearer ${secToken}`)
    .send({ status: "checked_out" });
  assert.equal(secCheckOut.status, 200);
  assert.equal(secCheckOut.body.status, "checked_out");
});

test("VALIDATION: Malformed ObjectIds return 400 ValidationError across all parameter schemas", async () => {
  const token = fixtures.tokens.societyAdminA;
  const invalidId = "not-a-valid-24-char-hex-id";

  const bRes = await request(app)
    .get(`/api/v1/buildings/${fixtures.societyA._id}/${invalidId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(bRes.status, 400);

  const fRes = await request(app)
    .get(`/api/v1/flats/${invalidId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(fRes.status, 400);

  const mRes = await request(app)
    .get(`/api/v1/maintenance/${invalidId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(mRes.status, 400);

  const cRes = await request(app)
    .get(`/api/v1/complaints/${invalidId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(cRes.status, 400);

  const vRes = await request(app)
    .get(`/api/v1/visitors/${invalidId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(vRes.status, 400);
});
