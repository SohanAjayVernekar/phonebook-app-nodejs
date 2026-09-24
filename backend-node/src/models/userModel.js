const { pool } = require('../config/database');

async function findByEmail(email) {
  return (await pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0] || null;
}

async function findById(id) {
  return (await pool.query('SELECT * FROM users WHERE id=$1', [id])).rows[0] || null;
}

async function createUser(name, email, passwordHash) {
  return (await pool.query(
    'INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING *',
    [name, email, passwordHash]
  )).rows[0];
}

async function updateName(id, name) {
  return (await pool.query('UPDATE users SET name=$1 WHERE id=$2 RETURNING *', [name, id])).rows[0];
}

async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [passwordHash, id]);
}

module.exports = { findByEmail, findById, createUser, updateName, updatePassword };
