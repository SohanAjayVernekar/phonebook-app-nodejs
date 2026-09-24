const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-node',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'phonebook',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255),
      google_id VARCHAR(255) UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(255) UNIQUE,
      address TEXT,
      category VARCHAR(20) NOT NULL DEFAULT 'FRIEND',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS ix_contacts_user_id ON contacts(user_id);
  `);
}

async function waitForDatabase(retries = 30) {
  for (let i = 0; i < retries; i += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

module.exports = { pool, initializeDatabase, waitForDatabase };
