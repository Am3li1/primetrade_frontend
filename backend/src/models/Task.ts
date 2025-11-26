import pool from '../database';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export class TaskModel {
  static async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, user_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [task.title, task.description, task.status, task.user_id]
    );
    return result.rows[0];
  }

  static async findByUserId(userId: number): Promise<Task[]> {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findById(id: number, userId: number): Promise<Task | null> {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  static async update(id: number, userId: number, updates: Partial<Task>): Promise<Task | null> {
    const { title, description, status } = updates;
    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [title, description, status, id, userId]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    // FIX: Check if rowCount exists and is greater than 0
    return (result.rowCount && result.rowCount > 0) || false;
  }
}