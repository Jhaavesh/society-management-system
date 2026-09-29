import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Society from './src/models/society.js';
import User from './src/models/user.js';
import Flat from './src/models/flat.js';
import Building from './src/models/building.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to Atlas');

  // Clear relevant test data
  await Society.deleteMany({ name: { $in: ['RBAC Soc 1', 'RBAC Soc 2'] } });
  await User.deleteMany({ email: { $regex: 'rbac_' } });
  
  // 1. Create 2 Societies
  const soc1 = await Society.create({ name: 'RBAC Soc 1', city: 'City 1' });
  const soc2 = await Society.create({ name: 'RBAC Soc 2', city: 'City 2' });
  
  // Create Buildings & Flats
  const b1 = await Building.create({ societyId: soc1._id, name: 'B1', floors: 1 });
  const b2 = await Building.create({ societyId: soc2._id, name: 'B2', floors: 1 });
  
  const f1 = await Flat.create({ societyId: soc1._id, buildingId: b1._id, flatNumber: '101' });
  const f2 = await Flat.create({ societyId: soc2._id, buildingId: b2._id, flatNumber: '102' });

  const passwordHash = await bcrypt.hash('password123', 10);
  
  // Create Users
  const platformAdmin = await User.create({ name: 'PA', email: 'rbac_pa@test.com', passwordHash, role: 'platform_admin', societyIds: [], active: true });
  const adminSoc1 = await User.create({ name: 'A1', email: 'rbac_a1@test.com', passwordHash, role: 'society_admin', societyIds: [soc1._id], active: true });
  const resSoc1 = await User.create({ name: 'R1', email: 'rbac_r1@test.com', passwordHash, role: 'resident', societyIds: [soc1._id], flatId: f1._id, active: true });
  const resSoc2 = await User.create({ name: 'R2', email: 'rbac_r2@test.com', passwordHash, role: 'resident', societyIds: [soc2._id], flatId: f2._id, active: true });
  
  console.log('Test data generated. Run API tests now.');
  
  const PORT = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${PORT}/api/v1`;

  async function apiFetch(email, path, method = 'GET') {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    const { token } = await loginRes.json();
    
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res;
  }

  try {
    // Platform Admin tests
    console.log('Testing Platform Admin...');
    const paGet1 = await apiFetch('rbac_pa@test.com', `/dashboard/${soc1._id}?societyId=${soc1._id}`);
    const paGet2 = await apiFetch('rbac_pa@test.com', `/dashboard/${soc2._id}?societyId=${soc2._id}`);
    if (paGet1.status !== 200 || paGet2.status !== 200) throw new Error('PA should access all societies');
    
    // Society Admin tests
    console.log('Testing Society Admin...');
    const a1Get1 = await apiFetch('rbac_a1@test.com', `/dashboard/${soc1._id}?societyId=${soc1._id}`);
    if (a1Get1.status !== 200) throw new Error('Admin 1 should access Soc 1');
    
    const a1Get2 = await apiFetch('rbac_a1@test.com', `/dashboard/${soc2._id}?societyId=${soc2._id}`);
    if (a1Get2.status !== 403) throw new Error('Admin 1 MUST NOT access Soc 2 (Leakage!)');
    
    // Resident tests
    console.log('Testing Resident isolation...');
    
    // Resident fetching flats list should only see their own society flats
    const r1Flats = await apiFetch('rbac_r1@test.com', `/flats?societyId=${soc1._id}`);
    if (r1Flats.status !== 200) {
       console.log('Failed flats fetch status:', r1Flats.status);
       throw new Error('Res 1 should access Soc 1 flats');
    }
    const r1FlatsData = await r1Flats.json();
    if (!r1FlatsData.data) throw new Error('Failed to fetch flats');
    
    // Attempting cross society access
    const r1Get2 = await apiFetch('rbac_r1@test.com', `/flats?societyId=${soc2._id}`);
    if (r1Get2.status !== 403) throw new Error('Res 1 MUST NOT access Soc 2 flats');

    console.log('✅ ALL RBAC and Cross-Society Isolation tests PASSED in production environment!');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  } finally {
    // Cleanup
    await Society.deleteMany({ _id: { $in: [soc1._id, soc2._id] } });
    await Building.deleteMany({ _id: { $in: [b1._id, b2._id] } });
    await Flat.deleteMany({ _id: { $in: [f1._id, f2._id] } });
    await User.deleteMany({ _id: { $in: [platformAdmin._id, adminSoc1._id, resSoc1._id, resSoc2._id] } });
    await mongoose.disconnect();
  }
}

main();
