import express from 'express';
import { TaskModel } from '../models/Task';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all tasks for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const tasks = await TaskModel.findByUserId(req.userId!);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new task
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, status = 'pending' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await TaskModel.create({
      title,
      description,
      status,
      user_id: req.userId!
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, status } = req.body;

    const task = await TaskModel.update(taskId, req.userId!, {
      title,
      description,
      status
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const deleted = await TaskModel.delete(taskId, req.userId!);

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;