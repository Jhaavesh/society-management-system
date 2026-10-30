import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import request from "supertest";
import app from "../src/app.js";
import Building from "../src/models/building.js";
import Flat from "../src/models/flat.js";
import MaintenanceBill from "../src/models/maintenancebill.js";
import Payment from "../src/models/payment.js";
import Complaint from "../src/models/complaint.js";
import Notice from "../src/models/notice.js";
import Visitor from "../src/models/visitor.js";
import { initDb, cleanDb, closeDb, createFixtures, generateToken } from "./setup.js";

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

test("RBAC: Platform Admin has exclusive access to create, update, and delete societies", async () => {
  // Platform admin can create society
  const createRes = await request(app)
    .post("/api/v1/societies")
    .set("Authorization", `Bearer ${fixtures.tokens.platformAdmin}`)
    .send({ name: "Exclusive Society", city: "Delhi" });
  assert.equal(createRes.status, 201);
  const newSocId = createRes.body._id;

  // Society Admin cannot create society
  const deniedSocietyAdmin = await request(app)
    .post("/api/v1/societies")
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ name: "Unauthorized Society" });
  assert.equal(deniedSocietyAdmin.status, 403);

  // Accountant cannot create society
  const deniedAccountant = await request(app)
    .post("/api/v1/societies")
    .set("Authorization", `Bearer ${fixtures.tokens.accountantA}`)
    .send({ name: "Unauthorized Society" });
  assert.equal(deniedAccountant.status, 403);

  // Security cannot create society
  const deniedSecurity = await request(app)
    .post("/api/v1/societies")
    .set("Authorization", `Bearer ${fixtures.tokens.securityA}`)
    .send({ name: "Unauthorized Society" });
  assert.equal(deniedSecurity.status, 403);

  // Resident cannot create society
  const deniedResident = await request(app)
    .post("/api/v1/societies")
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`)
    .send({ name: "Unauthorized Society" });
  assert.equal(deniedResident.status, 403);

  // Platform admin can update society
  const updateRes = await request(app)
    .patch(`/api/v1/societies/${newSocId}`)
    .set("Authorization", `Bearer ${fixtures.tokens.platformAdmin}`)
    .send({ city: "New Delhi" });
  assert.equal(updateRes.status, 200);

  // Non-platform admin cannot update society
  const deniedUpdate = await request(app)
    .patch(`/api/v1/societies/${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ city: "Hacked City" });
  assert.equal(deniedUpdate.status, 403);

  // Platform admin can delete society
  const deleteRes = await request(app)
    .delete(`/api/v1/societies/${newSocId}`)
    .set("Authorization", `Bearer ${fixtures.tokens.platformAdmin}`);
  assert.equal(deleteRes.status, 200);
});

test("RBAC: Buildings management is restricted to managers (platform_admin, society_admin, accountant)", async () => {
  // Society Admin can create building
  const adminRes = await request(app)
    .post(`/api/v1/buildings/${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`)
    .send({ name: "Tower C", floors: 12 });
  assert.equal(adminRes.status, 201);

  // Security cannot create building
  const secRes = await request(app)
    .post(`/api/v1/buildings/${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.securityA}`)
    .send({ name: "Tower D", floors: 8 });
  assert.equal(secRes.status, 403);

  // Resident cannot create building
  const resRes = await request(app)
    .post(`/api/v1/buildings/${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`)
    .send({ name: "Tower E", floors: 8 });
  assert.equal(resRes.status, 403);
});

test("RBAC: Residents directory is accessible only to managers", async () => {
  // Society Admin can list residents
  const adminRes = await request(app)
    .get(`/api/v1/residents?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(adminRes.status, 200);

  // Accountant can list residents
  const accRes = await request(app)
    .get(`/api/v1/residents?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.accountantA}`);
  assert.equal(accRes.status, 200);

  // Security cannot list residents
  const secRes = await request(app)
    .get(`/api/v1/residents?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.securityA}`);
  assert.equal(secRes.status, 403);

  // Resident cannot list residents
  const resRes = await request(app)
    .get(`/api/v1/residents?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`);
  assert.equal(resRes.status, 403);
});

test("RBAC: Billing and Payments permissions are restricted to authorized financial roles", async () => {
  // Accountant can create bill
  const billRes = await request(app)
    .post("/api/v1/maintenance")
    .set("Authorization", `Bearer ${fixtures.tokens.accountantA}`)
    .send({
      societyId: fixtures.societyA._id,
      flatId: fixtures.flatA1._id,
      month: 11,
      year: 2026,
      amount: 2500,
      dueDate: new Date().toISOString()
    });
  assert.equal(billRes.status, 201);
  const billId = billRes.body._id;

  // Security cannot create bill
  const secBillRes = await request(app)
    .post("/api/v1/maintenance")
    .set("Authorization", `Bearer ${fixtures.tokens.securityA}`)
    .send({
      societyId: fixtures.societyA._id,
      flatId: fixtures.flatA2._id,
      month: 11,
      year: 2026,
      amount: 2500,
      dueDate: new Date().toISOString()
    });
  assert.equal(secBillRes.status, 403);

  // Resident cannot create bill
  const resBillRes = await request(app)
    .post("/api/v1/maintenance")
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`)
    .send({
      societyId: fixtures.societyA._id,
      flatId: fixtures.flatA2._id,
      month: 11,
      year: 2026,
      amount: 2500,
      dueDate: new Date().toISOString()
    });
  assert.equal(resBillRes.status, 403);

  // Accountant can record payment
  const payRes = await request(app)
    .post("/api/v1/payments")
    .set("Authorization", `Bearer ${fixtures.tokens.accountantA}`)
    .send({
      societyId: fixtures.societyA._id,
      billId,
      flatId: fixtures.flatA1._id,
      amountPaid: 2500,
      method: "online"
    });
  assert.equal(payRes.status, 201);

  // Security cannot record payment
  const secPayRes = await request(app)
    .post("/api/v1/payments")
    .set("Authorization", `Bearer ${fixtures.tokens.securityA}`)
    .send({
      societyId: fixtures.societyA._id,
      billId,
      flatId: fixtures.flatA1._id,
      amountPaid: 100,
      method: "cash"
    });
  assert.equal(secPayRes.status, 403);

  // Resident cannot record payment via manager API
  const resPayRes = await request(app)
    .post("/api/v1/payments")
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`)
    .send({
      societyId: fixtures.societyA._id,
      billId,
      flatId: fixtures.flatA1._id,
      amountPaid: 100,
      method: "cash"
    });
  assert.equal(resPayRes.status, 403);
});

test("RBAC: Complaints workflow allows residents to file, but only managers/security to update status", async () => {
  // Resident files complaint
  const createRes = await request(app)
    .post("/api/v1/complaints")
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`)
    .send({
      societyId: fixtures.societyA._id,
      category: "Plumbing",
      description: "Leaking pipe in bathroom"
    });
  assert.equal(createRes.status, 201);
  const complaintId = createRes.body._id;

  // Security can update status to in_progress
  const secUpdate = await request(app)
    .patch(`/api/v1/complaints/${complaintId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.securityA}`)
    .send({ status: "in_progress" });
  assert.equal(secUpdate.status, 200);
  assert.equal(secUpdate.body.status, "in_progress");

  // Resident cannot update complaint status
  const resUpdate = await request(app)
    .patch(`/api/v1/complaints/${complaintId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`)
    .send({ status: "closed" });
  assert.equal(resUpdate.status, 403);

  // Resident cannot delete complaint
  const resDelete = await request(app)
    .delete(`/api/v1/complaints/${complaintId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`);
  assert.equal(resDelete.status, 403);
});

test("RBAC: Visitors workflow allows residents and security to register, but only security/managers to approve", async () => {
  // Resident registers visitor
  const createRes = await request(app)
    .post("/api/v1/visitors")
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`)
    .send({
      societyId: fixtures.societyA._id,
      visitorName: "Guest Resident",
      visitorMobile: "9876543210",
      visitDate: new Date().toISOString()
    });
  assert.equal(createRes.status, 201);
  const visitorId = createRes.body._id;

  // Security approves visitor
  const secUpdate = await request(app)
    .patch(`/api/v1/visitors/${visitorId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.securityA}`)
    .send({ status: "approved" });
  assert.equal(secUpdate.status, 200);
  assert.equal(secUpdate.body.status, "approved");

  // Resident cannot approve visitor
  const resUpdate = await request(app)
    .patch(`/api/v1/visitors/${visitorId}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`)
    .send({ status: "checked_in" });
  assert.equal(resUpdate.status, 403);
});

test("RBAC: Dashboard endpoint access allows admin, accountant, security, but denies resident", async () => {
  // Platform Admin allowed
  const pRes = await request(app)
    .get(`/api/v1/dashboard/${fixtures.societyA._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.platformAdmin}`);
  assert.equal(pRes.status, 200);

  // Society Admin allowed
  const aRes = await request(app)
    .get(`/api/v1/dashboard/${fixtures.societyA._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.societyAdminA}`);
  assert.equal(aRes.status, 200);

  // Accountant allowed
  const accRes = await request(app)
    .get(`/api/v1/dashboard/${fixtures.societyA._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.accountantA}`);
  assert.equal(accRes.status, 200);

  // Security allowed
  const secRes = await request(app)
    .get(`/api/v1/dashboard/${fixtures.societyA._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.securityA}`);
  assert.equal(secRes.status, 200);

  // Resident DENIED with 403
  const resRes = await request(app)
    .get(`/api/v1/dashboard/${fixtures.societyA._id}?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${fixtures.tokens.residentA}`);
  assert.equal(resRes.status, 403);
  assert.match(resRes.body.message, /insufficient permissions/i);
});
