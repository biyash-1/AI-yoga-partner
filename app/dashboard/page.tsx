
"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";

import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Calendar,
  Play,
  Heart,
  Award,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalSessions: number;
  totalMinutes: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
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

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = await getToken();

      if (!token) {
        console.error("No auth token found");
        return;
      }
      console.log("toen in dashbaord",token)

      const response = await fetch("http://localhost:5000/api/user-stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("stats data:", data);
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (user) {
    fetchStats();
  }
}, [user, getToken]);


  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Sessions",
      value: stats.totalSessions,
      icon: <Activity className="w-6 h-6" />,
      color: "from-purple-500 to-blue-600",
    },
    {
      title: "Total Minutes",
      value: stats.totalMinutes,
      icon: <Clock className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Current Streak",
      value: `${stats.streak} days`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-orange-500 to-red-600",
    },
    {
      title: "Weekly Progress",
      value: `${Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%`,
      icon: <Target className="w-6 h-6" />,
      color: "from-cyan-500 to-blue-600",
    },
  ];

  const quickActions = [
    {
      title: "Start Yoga Session",
      description: "Begin your practice now",
      icon: <Play className="w-6 h-6" />,
      href: "dashboard/yoga-session",
      color: "bg-gradient-to-r from-purple-500 to-blue-600",
    },
    {
      title: "Meditation",
      description: "Calm your mind",
      icon: <Heart className="w-6 h-6" />,
      href: "/meditation",
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
    },
    {
      title: "My Progress",
      description: "View detailed analytics",
      icon: <Award className="w-6 h-6" />,
      href: "/progress",
      color: "bg-gradient-to-r from-orange-500 to-red-600",
    },
  ];

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
            Ready to continue your wellness journey?
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
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Morning Yoga Session
                    </p>
                    <p className="text-sm text-gray-600">30 minutes • 2 days ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;