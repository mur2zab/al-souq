#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), '.data');
const dbFile = path.join(dataDir, 'alsouq_database.json');

// Delete the existing file so ServerDatabaseStore re-seeds from seedData
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
}

console.log('✅ Deleted existing database file. When the server starts, it will re-seed sample demo data.');
console.log('------------------------------------------------------------');
