import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './createTables';
import pool from './database';

// Import routes
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Create tables on startup
createTables();

// Routes - NOW these come AFTER app is declared
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connected successfully!',
      time: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});