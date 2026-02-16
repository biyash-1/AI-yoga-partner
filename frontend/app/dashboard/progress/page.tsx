"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Clock,
  Activity,
  Flame,
  BarChart3,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionHistory {
  date: string;
  duration: number;
  posesCompleted: Array<{
    poseName: string;
    duration: number;
    accuracy: number;
    bestHold: number;
  }>;
  averageAccuracy: number;
}

interface Analytics {
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

interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  streak: number;
}

const ProgressPage = () => {
  const { getToken } = useAuth();
  const router = useRouter();
  
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Fetch session history
        const historyResponse = await fetch(
          "http://localhost:5000/api/yoga/session-history?limit=20",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const historyData = await historyResponse.json();
        setSessions(historyData.sessions);

        // Fetch analytics
        const analyticsResponse = await fetch(
          "http://localhost:5000/api/yoga/analytics",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);

        // Fetch user stats
        const statsResponse = await fetch(
          "http://localhost:5000/api/user-stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const statsData = await statsResponse.json();
        setStats(statsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching progress data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-xl font-semibold text-gray-700">Loading your progress...</div>
      </div>
    );
  }

  const totalHours = stats ? Math.floor(stats.totalMinutes / 60) : 0;
  const totalMinutes = stats ? stats.totalMinutes % 60 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Your Progress 📊
            </h1>
            <p className="text-gray-600 text-lg">
              Track your yoga journey and celebrate achievements
            </p>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg text-white">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-800">
                  {analytics?.totalSessions || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-green-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-3xl font-bold text-gray-800">
                  {totalHours}h {totalMinutes}m
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats?.streak || 0} {stats?.streak === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Accuracy</p>
                <p className="text-3xl font-bold text-gray-800">
                  {analytics?.averageAccuracy || 0}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Last 7 Days Activity
            </h3>
            <div className="space-y-3">
              {analytics?.weeklyProgress.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-600 h-full rounded-full flex items-center justify-end px-2"
                          style={{
                            width: `${day.minutes > 0 ? Math.max((day.minutes / 60) * 100, 10) : 0}%`
                          }}
                        >
                          {day.minutes > 0 && (
                            <span className="text-xs text-white font-medium">
                              {day.minutes}m
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-12 text-sm text-gray-600 text-right">
                        {day.sessions > 0 ? `${day.sessions}x` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Performance Insights
            </h3>
            
            <div className="space-y-6">
              {/* Favorite Pose */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Favorite Pose</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {analytics?.favoritePose || 'Practice more to discover!'}
                </p>
              </div>

              {/* Average Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Avg Session Duration</span>
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {analytics?.averageDuration || 0} minutes
                </p>
              </div>

              {/* Consistency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Consistency</span>
                  <TrendingUp className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(((stats?.streak || 0) / 30) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {Math.min(((stats?.streak || 0) / 30) * 100, 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Keep going! Goal: 30-day streak
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Session History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Session History
          </h3>

          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.duration} minutes • {session.posesCompleted.length} poses
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Average Accuracy</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {session.averageAccuracy}%
                      </p>
                    </div>
                  </div>

                  {/* Poses in this session */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {session.posesCompleted.map((pose, poseIndex) => (
                      <div
                        key={poseIndex}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <p className="font-medium text-gray-800 text-sm mb-2">
                          {pose.poseName}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>⏱️ {pose.duration}s</span>
                          <span>🎯 {pose.accuracy}%</span>
                          <span>🏆 {pose.bestHold}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No session history yet</p>
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

export default ProgressPage;