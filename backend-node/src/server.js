const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase, waitForDatabase } = require('./config/database');
const { seedDemoData } = require('./seed/seedData');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = Number(process.env.PORT || 8080);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'online', database: 'online' });
  } catch (error) {
    const dbError = new Error('Database unavailable');
    dbError.status = 503;
    next(dbError);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    detail: error.message || 'Internal server error',
    message: error.message || 'Internal server error'
  });
});

async function start() {
  await waitForDatabase();
  await initializeDatabase();
  await seedDemoData();
  app.listen(PORT, () => console.log(`Node.js API listening on ${PORT}`));
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
