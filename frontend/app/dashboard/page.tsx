"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";

import { 
  Activity, 
  Clock, 
  Flame, 
  Calendar,
  Play,
  Heart,
  Award,
  Target,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalSessions: number;
  totalMinutes: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface YogaAnalytics {
  totalSessions: number;
  averageDuration: number;
  averageAccuracy: number;
  favoritePose: string | null;
  weeklyProgress: Array<{
    date: string;
    sessions: number;
    minutes: number;
  }>;
}

const Dashboard = () => {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    totalMinutes: 0,
    streak: 0,
    weeklyGoal: 150,
    weeklyProgress: 0
  });

  const [analytics, setAnalytics] = useState<YogaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.error("No auth token found");
          return;
        }

        // Fetch basic stats
        const statsResponse = await fetch("http://localhost:5000/api/user-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch yoga analytics
        const analyticsResponse = await fetch("http://localhost:5000/api/yoga/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getToken]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-xl font-semibold text-gray-700">Loading your dashboard...</div>
      </div>
    );
  }

  // Calculate this week's minutes
  const thisWeekMinutes = analytics?.weeklyProgress.reduce((sum, day) => sum + day.minutes, 0) || 0;
  const weeklyGoalProgress = Math.round((thisWeekMinutes / stats.weeklyGoal) * 100);

  const statCards = [
    {
      title: "Total Sessions",
      value: analytics?.totalSessions || 0,
      subtitle: "yoga practices",
      icon: <Activity className="w-6 h-6" />,
      color: "from-purple-500 to-blue-600",
    },
    {
      title: "Practice Time",
      value: `${analytics?.totalSessions ? Math.round((stats.totalMinutes || 0) / 60) : 0}h ${(stats.totalMinutes || 0) % 60}m`,
      subtitle: "total time",
      icon: <Clock className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Daily Streak",
      value: `${stats.streak || 0}`,
      subtitle: stats.streak === 1 ? "day" : "days",
      icon: <Flame className="w-6 h-6" />,
      color: "from-orange-500 to-red-600",
    },
    {
      title: "Average Accuracy",
      value: `${analytics?.averageAccuracy || 0}%`,
      subtitle: "pose accuracy",
      icon: <Target className="w-6 h-6" />,
      color: "from-cyan-500 to-blue-600",
    },
  ];

  const quickActions = [
    {
      title: "Start Yoga Session",
      description: "Begin your practice now",
      icon: <Play className="w-6 h-6" />,
      href: "/dashboard/yoga-session",
      color: "bg-gradient-to-r from-purple-500 to-blue-600",
    },
    {
      title: "My Progress",
      description: "View detailed analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      href: "/dashboard/progress",
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
    },
    {
      title: "Meditation",
      description: "Calm your mind",
      icon: <Heart className="w-6 h-6" />,
      href: "/meditation",
      color: "bg-gradient-to-r from-orange-500 to-red-600",
    },
  ];

  // Get last 3 sessions for recent activity
  const recentSessions = analytics?.weeklyProgress
    .filter(day => day.sessions > 0)
    .slice(-3)
    .reverse() || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user.firstName || user.username}! 🧘‍♀️
          </h1>
          <p className="text-gray-600 text-lg">
            {stats.streak > 0 
              ? `Amazing! You're on a ${stats.streak}-day streak 🔥` 
              : "Ready to start your wellness journey?"}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Weekly Goal</h3>
              <p className="text-sm text-gray-600">
                {thisWeekMinutes} / {stats.weeklyGoal} minutes
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600">{weeklyGoalProgress}%</p>
              <p className="text-xs text-gray-500">completed</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(weeklyGoalProgress, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-purple-500 to-blue-600 h-full rounded-full"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                onClick={() => router.push(action.href)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${action.color} text-white rounded-2xl p-6 shadow-lg text-left transition-all duration-300 hover:shadow-xl`}
              >
                <div className="mb-4">{action.icon}</div>
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-white/90 text-sm">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
            {analytics && analytics.favoritePose && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Favorite Pose</p>
                <p className="text-sm font-semibold text-purple-600">{analytics.favoritePose}</p>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading activity...</div>
          ) : recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Yoga Session
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.minutes} minutes • {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-purple-600">
                      {session.sessions} session{session.sessions > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No sessions yet</p>
              <Button
                onClick={() => router.push("/dashboard/yoga-session")}
                className="bg-gradient-to-r from-purple-500 to-blue-600"
              >
                Start Your First Session
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;