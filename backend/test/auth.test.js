import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.js";
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

test("AUTH: Valid user can log in with correct credentials", async () => {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "admin-a@test.com", password: "Test1234!" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, "admin-a@test.com");
  assert.equal(res.body.user.role, "society_admin");
  assert.equal(String(res.body.user.societyId), String(fixtures.societyA._id));

  const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
  assert.equal(decoded.sub, String(fixtures.users.societyAdminA._id));
  assert.equal(decoded.role, "society_admin");
  assert.equal(decoded.societyId, String(fixtures.societyA._id));
});

test("AUTH: Invalid password is rejected with 401", async () => {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "admin-a@test.com", password: "WrongPassword999!" });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /incorrect/i);
});

test("AUTH: Unknown user email is rejected with 401", async () => {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "nonexistent-user@test.com", password: "Test1234!" });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test("AUTH: Deactivated user cannot log in", async () => {
  await User.updateOne({ _id: fixtures.users.societyAdminA._id }, { active: false });

  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "admin-a@test.com", password: "Test1234!" });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test("AUTH: Missing credentials fail validation with 400", async () => {
  const missingPass = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "admin-a@test.com" });
  assert.equal(missingPass.status, 400);

  const missingEmail = await request(app)
    .post("/api/v1/auth/login")
    .send({ password: "Test1234!" });
  assert.equal(missingEmail.status, 400);

  const invalidEmail = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "not-an-email", password: "Test1234!" });
  assert.equal(invalidEmail.status, 400);
});

test("AUTH: Protected endpoint rejects request without Authorization header with 401", async () => {
  const res = await request(app)
    .get(`/api/v1/buildings/${fixtures.societyA._id}`);
  assert.equal(res.status, 401);
});

test("AUTH: Protected endpoint rejects malformed token with 401", async () => {
  const res = await request(app)
    .get(`/api/v1/buildings/${fixtures.societyA._id}`)
    .set("Authorization", "Bearer invalid-garbage-token");
  assert.equal(res.status, 401);
});

test("AUTH: Protected endpoint rejects token signed with wrong secret with 401", async () => {
  const wrongSecretToken = jwt.sign(
    { sub: String(fixtures.users.societyAdminA._id), role: "society_admin" },
    "completely-wrong-secret"
  );
  const res = await request(app)
    .get(`/api/v1/buildings/${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${wrongSecretToken}`);
  assert.equal(res.status, 401);
});

test("AUTH: Protected endpoint rejects expired token with 401", async () => {
  const expiredToken = jwt.sign(
    { sub: String(fixtures.users.societyAdminA._id), role: "society_admin" },
    process.env.JWT_SECRET,
    { expiresIn: -10 }
  );
  const res = await request(app)
    .get(`/api/v1/buildings/${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${expiredToken}`);
  assert.equal(res.status, 401);
});

test("AUTH: Zombie session regression - deactivated user with valid JWT is denied with 403", async () => {
  const validToken = fixtures.tokens.residentA;

  // Verify valid token works initially
  const beforeDeactivation = await request(app)
    .get(`/api/v1/maintenance?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${validToken}`);
  assert.equal(beforeDeactivation.status, 200);

  // Deactivate user in database
  await User.updateOne({ _id: fixtures.users.residentA._id }, { active: false });

  // Use the same valid JWT token
  const afterDeactivation = await request(app)
    .get(`/api/v1/maintenance?societyId=${fixtures.societyA._id}`)
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(afterDeactivation.status, 403);
  assert.match(afterDeactivation.body.message, /deactivated/i);
});

test("AUTH: Role escalation in token is overridden by DB lookup in requireActiveUser", async () => {
  // Attacker crafts a token claiming to be platform_admin, but DB record is resident
  const forgedToken = generateToken({
    sub: fixtures.users.residentA._id,
    role: "platform_admin"
  });

  // Attempt to call platform_admin-only endpoint (create society)
  const res = await request(app)
    .post("/api/v1/societies")
    .set("Authorization", `Bearer ${forgedToken}`)
    .send({ name: "Malicious Society" });

  assert.equal(res.status, 403);
  assert.match(res.body.message, /insufficient permissions/i);
});

test("AUTH: Society ID tampering in token is overridden by DB lookup", async () => {
  // Attacker crafts a token claiming to belong to Society B, but DB record belongs to Society A
  const forgedToken = generateToken({
    sub: fixtures.users.residentA._id,
    role: "resident",
    societyId: fixtures.societyB._id
  });

  // Attempt to access Society B
  const res = await request(app)
    .get(`/api/v1/maintenance?societyId=${fixtures.societyB._id}`)
    .set("Authorization", `Bearer ${forgedToken}`);

  assert.equal(res.status, 403);
  assert.match(res.body.message, /cannot access this society/i);
});

test("AUTH: Health endpoint is public and indicates database status", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.database.connected, true);
});

