#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const dataDir = path.join(process.cwd(), '.data');
const dbFile = path.join(dataDir, 'alsouq_database.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@alsouq.community';

const cleanDatabase = {
  users: [
    {
      id: 'admin-1',
      email: adminEmail,
      phone: '+919820000001',
      fullName: 'Community Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      itsNumber: '10000001',
      verificationStatus: 'VERIFIED',
      cityId: 'mumbai',
      cityName: 'Mumbai',
      mohallaName: 'Mazgaon (Central Jamaat Desk)',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(adminPassword),
    },
  ],
  businesses: [],
  posts: [],
  stories: [],
  classifieds: [],
  leads: [],
  verifications: [],
};

fs.writeFileSync(dbFile, JSON.stringify(cleanDatabase, null, 2), 'utf-8');

console.log('✅ Al-Souq database has been reset to COMPLETELY EMPTY state!');
console.log('------------------------------------------------------------');
console.log('📁 Database file:', dbFile);
console.log('👑 Admin Account Created:');
console.log(`   Email:    ${adminEmail}`);
console.log(`   Password: ${adminPassword}`);
console.log(`   ITS ID:   10000001`);
console.log('📦 Posts:        0 (Empty - ready for real community drops)');
console.log('🏠 Classifieds:  0 (Empty - ready for real flat rentals & sales)');
console.log('⚡ Stories:      0 (Empty - ready for real 24h pop-up specials)');
console.log('🛡️  Verifications:0 (Empty - awaiting real ITS KYC uploads)');
console.log('------------------------------------------------------------');
