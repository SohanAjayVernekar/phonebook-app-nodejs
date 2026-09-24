const { pool } = require('../config/database');

async function countByUser(userId) {
  return Number((await pool.query('SELECT COUNT(*) FROM contacts WHERE user_id=$1', [userId])).rows[0].count);
}

async function findById(id, userId) {
  return (await pool.query('SELECT * FROM contacts WHERE id=$1 AND user_id=$2', [id, userId])).rows[0] || null;
}

async function create(userId, contact) {
  return (await pool.query(
    'INSERT INTO contacts(user_id,name,phone_number,email,address,category) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [userId, contact.name, contact.phone, contact.email, contact.address, contact.category]
  )).rows[0];
}

async function update(id, contact) {
  return (await pool.query(
    'UPDATE contacts SET name=$1,phone_number=$2,email=$3,address=$4,category=$5 WHERE id=$6 RETURNING *',
    [contact.name, contact.phone, contact.email, contact.address, contact.category, id]
  )).rows[0];
}

async function remove(id, userId) {
  return (await pool.query(
    'DELETE FROM contacts WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]
  )).rows[0] || null;
}

async function bulkRemove(userId, ids) {
  return (await pool.query(
    'DELETE FROM contacts WHERE user_id=$1 AND id=ANY($2::int[])', [userId, ids]
  )).rowCount;
}

async function search(userId, query) {
  const { page, size, sort, searchText, categories, hasEmail, dateFrom, dateTo } = query;
  const args = [userId];
  let sql = 'SELECT * FROM contacts WHERE user_id=$1';

  if (searchText) {
    args.push(`%${searchText.toLowerCase()}%`);
    sql += ` AND (LOWER(name) LIKE $${args.length} OR LOWER(phone_number) LIKE $${args.length})`;
  }
  if (categories.length) {
    args.push(categories);
    sql += ` AND category=ANY($${args.length})`;
  }
  if (hasEmail !== null) sql += hasEmail ? ' AND email IS NOT NULL' : ' AND email IS NULL';
  if (dateFrom) { args.push(dateFrom); sql += ` AND created_at >= $${args.length}::date`; }
  if (dateTo) { args.push(dateTo); sql += ` AND created_at < ($${args.length}::date + INTERVAL '1 day')`; }

  const total = Number((await pool.query(sql.replace('SELECT *', 'SELECT COUNT(*)'), args)).rows[0].count);
  const order = sort === 'oldest' ? 'id ASC' : sort === 'name_asc' ? 'LOWER(name) ASC' : sort === 'name_desc' ? 'LOWER(name) DESC' : 'id DESC';
  const totalPages = Math.max(1, Math.ceil(total / size));
  const offset = (page - 1) * size;
  args.push(size, offset);
  const rows = (await pool.query(`${sql} ORDER BY ${order} LIMIT $${args.length - 1} OFFSET $${args.length}`, args)).rows;

  return { rows, total, page, size, totalPages };
}

module.exports = { countByUser, findById, create, update, remove, bulkRemove, search };
