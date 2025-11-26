import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Database URL:', process.env.DATABASE_URL ? 'Exists' : 'Missing');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL with Neon');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;