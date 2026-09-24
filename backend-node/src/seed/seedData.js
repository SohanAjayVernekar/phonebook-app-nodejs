const argon2 = require('argon2');
const { pool } = require('../config/database');
const userModel = require('../models/userModel');

async function seedDemoData() {
  let user = await userModel.findByEmail('testuser@example.com');
  const passwordHash = await argon2.hash('Test@12345');

  if (!user) {
    user = await userModel.createUser('Test User', 'testuser@example.com', passwordHash);
  } else {
    await pool.query("UPDATE users SET name='Test User', password_hash=$1 WHERE id=$2", [passwordHash, user.id]);
  }

  const count = Number((await pool.query('SELECT COUNT(*) FROM contacts WHERE user_id=$1', [user.id])).rows[0].count);
  if (count < 1000) await seedContacts(user.id, count);
}

async function seedContacts(userId, currentCount) {
  const firstNames = ['Aarav','Vihaan','Aditya','Arjun','Rohan','Rahul','Karan','Kabir','Siddharth','Ananya','Diya','Ishita','Aisha','Priya','Sneha','Meera','Kavya'];
  const lastNames = ['Sharma','Patel','Verma','Mehta','Nair','Joshi','Desai','Kulkarni','Iyer','Rao','Singh','Khan','Gupta','Pawar'];
  const cities = ['Mumbai','Pune','Bengaluru','Delhi','Hyderabad','Chennai','Goa'];
  const categories = ['WORK','FAMILY','FRIEND'];
  const phones = new Set((await pool.query('SELECT phone_number FROM contacts')).rows.map(row => row.phone_number));
  const emails = new Set((await pool.query('SELECT email FROM contacts WHERE email IS NOT NULL')).rows.map(row => row.email));

  for (let i = currentCount; i < 1000; i += 1) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    let phone;
    do { phone = `9${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`; } while (phones.has(phone));
    phones.add(phone);

    let email = null;
    if (Math.random() < 0.85) {
      do { email = `${first}.${last}.${Math.floor(Math.random() * 65536).toString(16)}@example.com`.toLowerCase(); } while (emails.has(email));
      emails.add(email);
    }

    const address = `${Math.floor(Math.random() * 400) + 1} MG Road, ${cities[Math.floor(Math.random() * cities.length)]}, India`;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const createdAt = new Date(Date.now() - Math.random() * 540 * 86400000);

    await pool.query(
      'INSERT INTO contacts(user_id,name,phone_number,email,address,category,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [userId, `${first} ${last}`, phone, email, address, category, createdAt]
    );
  }
}

module.exports = { seedDemoData };
