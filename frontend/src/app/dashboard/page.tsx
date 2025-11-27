'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { tasksAPI } from '@/lib/api';

// Interfaces MUST be outside the component
interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  icon: string;
  completed: boolean;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug authentication
  useEffect(() => {
    console.log("Dashboard - User data:", user);
    console.log("Dashboard - Is authenticated:", isAuthenticated);
    console.log("Dashboard - LocalStorage user:", localStorage.getItem("user"));
  }, [user, isAuthenticated]);

  // Load tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  // Task statistics
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const totalTasks = tasks.length;

  // Gamification calculations
  const totalPoints = completedTasks * 50 + inProgressTasks * 10;
  const currentLevel = Math.floor(totalPoints / 100) + 1;
  const progressToNextLevel = totalPoints % 100;

  // Achievements
  const achievements: Achievement[] = [
    {
      id: "first-steps",
      title: "First Steps",
      description: "Complete your first task",
      progress: completedTasks > 0 ? 1 : 0,
      target: 1,
      icon: "👣",
      completed: completedTasks > 0,
    },
    {
      id: "point-collector",
      title: "Point Collector",
      description: "Earn 500 points",
      progress: totalPoints,
      target: 500,
      icon: "⭐",
      completed: totalPoints >= 500,
    },
    {
      id: "task-master",
      title: "Task Master",
      description: "Complete 10 tasks",
      progress: completedTasks,
      target: 10,
      icon: "🏆",
      completed: completedTasks >= 10,
    },
    {
      id: "rising-star",
      title: "Rising Star",
      description: "Reach level 5",
      progress: currentLevel,
      target: 5,
      icon: "🚀",
      completed: currentLevel >= 5,
    },
    {
      id: "elite-performer",
      title: "Elite Performer",
      description: "Reach level 10",
      progress: currentLevel,
      target: 10,
      icon: "👑",
      completed: currentLevel >= 10,
    },
    {
      id: "champion",
      title: "Champion",
      description: "Complete 50 tasks",
      progress: completedTasks,
      target: 50,
      icon: "💪",
      completed: completedTasks >= 50,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hello, {user?.name}! 👋
          </h1>
          <p className="text-xl text-gray-600">Keep up the great work!</p>
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Progress to Level {currentLevel + 1}
              </h2>
              <p className="text-gray-600">
                Level {currentLevel} • {totalPoints} points
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">Level {currentLevel}</div>
              <div className="text-sm text-gray-500">{progressToNextLevel}/100 XP</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Tasks" value={totalTasks} color="purple" />
          <StatCard label="Pending" value={pendingTasks} color="yellow" />
          <StatCard label="In Progress" value={inProgressTasks} color="blue" />
          <StatCard label="Completed" value={completedTasks} color="green" />
        </div>

        {/* Quick Actions + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Quick Actions */}
          <QuickActions />

          {/* Achievements */}
          <Achievements achievements={achievements} />

        </div>
      </div>
    </div>
  );
}

/* ————————————————————————————————
   REUSABLE SUB-COMPONENTS
——————————————————————————————— */

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
      <div className={`text-3xl font-bold text-${color}-500 mb-2`}>
        {value}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4">

        <Link
          href="/dashboard/tasks"
          className="group p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
        >
          <ActionItem title="View Tasks" subtitle="Manage your task list" />
        </Link>

        <Link
          href="/dashboard/tasks/create"
          className="group p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
        >
          <ActionItem title="Create New Task" subtitle="Add a new task" />
        </Link>

      </div>
    </div>
  );
}

function ActionItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
        <span className="text-white text-xl">📄</span>
      </div>
      <div className="text-left">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-blue-100 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

function Achievements({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">

        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              achievement.completed
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg"
                : "bg-gray-50 border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`text-2xl ${
                  achievement.completed ? "scale-110" : "opacity-60"
                }`}
              >
                {achievement.icon}
              </div>

              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    achievement.completed ? "text-green-800" : "text-gray-800"
                  }`}
                >
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {achievement.description}
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      achievement.completed
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : "bg-gradient-to-r from-blue-500 to-purple-600"
                    }`}
                    style={{
                      width: `${Math.min(
                        (achievement.progress / achievement.target) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    Progress: {achievement.progress}/{achievement.target}
                  </span>
                  {achievement.completed && (
                    <span className="text-green-600 font-semibold">
                      ✓ Completed
                    </span>
                  )}
                </div>

              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
