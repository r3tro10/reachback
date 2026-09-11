#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '.env.local') });
const { migrate } = require('./src/db');

migrate().then(() => {
  console.log('✅ Migrations completed successfully');
  process.exit(0);
}).catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
