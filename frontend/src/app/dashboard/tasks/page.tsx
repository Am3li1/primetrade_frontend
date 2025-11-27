'use client';
import { useState, useEffect } from 'react';
import { tasksAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function TasksPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      fetchTasks();
    }
  }, [isAuthenticated, router]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(id);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task');
        alert('Failed to delete task');
      }
    }
  };

  const updateTaskStatus = async (id: number, newStatus: string) => {
    try {
      await tasksAPI.update(id, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task');
      alert('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    // Added margin-top here
    <div className="mt-8 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and organize your tasks</p>
          </div>
          <Link 
            href="/dashboard/tasks/create"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Task</span>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tasks by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pending Tasks Column */}
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Pending ({pendingTasks.length})
              </h3>
            </div>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={deleteTask} onStatusChange={updateTaskStatus} />
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                  No pending tasks
                </div>
              )}
            </div>
          </div>

          {/* In Progress Tasks Column */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                In Progress ({inProgressTasks.length})
              </h3>
            </div>
            <div className="space-y-4">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={deleteTask} onStatusChange={updateTaskStatus} />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                  No tasks in progress
                </div>
              )}
            </div>
          </div>

          {/* Completed Tasks Column */}
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-green-800 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Completed ({completedTasks.length})
              </h3>
            </div>
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={deleteTask} onStatusChange={updateTaskStatus} />
              ))}
              {completedTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                  No completed tasks
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && !searchTerm && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No tasks yet. Create your first task to get started!</p>
            <Link 
              href="/dashboard/tasks/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Your First Task</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onDelete, onStatusChange }: { 
  task: Task; 
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
          title="Delete task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <span className="text-sm text-gray-500">
          {new Date(task.created_at).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
}