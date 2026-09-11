require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.local') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('Running migrations...');
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Executing: ${file}`);
      await pool.query(sql);
    }

    console.log('Migrations completed');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

async function query(text, params) {
  return pool.query(text, params);
}

async function close() {
  return pool.end();
}

module.exports = {
  db: { query },
  migrate,
  close,
};
