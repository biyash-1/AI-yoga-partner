import User from "../models/User.js";

// Save a completed yoga session
export const saveYogaSession = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ message: "Not authenticated" });

    const { duration, posesCompleted, totalPoses, averageAccuracy } = req.body;

    // Validate input
    if (!duration || !posesCompleted || !Array.isArray(posesCompleted)) {
      return res.status(400).json({ message: "Invalid session data" });
    }

    // Find user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new session
    const newSession = {
      date: new Date(),
      duration,
      posesCompleted,
      totalPoses: totalPoses || posesCompleted.length,
      averageAccuracy: averageAccuracy || 0
    };

    // Add session to history
    user.sessions.push(newSession);

    // Update stats
    user.stats.totalSessions += 1;
    user.stats.totalMinutes += duration;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.stats.lastSessionDate) {
      const lastSession = new Date(user.stats.lastSessionDate);
      lastSession.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - lastSession) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, don't change streak
      } else if (daysDiff === 1) {
        // Consecutive day, increase streak
        user.stats.currentStreak += 1;
      } else {
        // Streak broken, reset to 1
        user.stats.currentStreak = 1;
      }
    } else {
      // First session ever
      user.stats.currentStreak = 1;
    }

    user.stats.lastSessionDate = new Date();

    // Save user
    await user.save();

    res.json({
      message: "Session saved successfully",
      session: newSession,
      stats: user.stats
    });

  } catch (err) {
    console.error("Error saving yoga session:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get user's session history
export const getSessionHistory = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ message: "Not authenticated" });

    const { limit = 10 } = req.query;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get recent sessions (sorted by date, newest first)
    const recentSessions = user.sessions
      .sort((a, b) => b.date - a.date)
      .slice(0, parseInt(limit));

    res.json({
      sessions: recentSessions,
      totalSessions: user.sessions.length
    });

  } catch (err) {
    console.error("Error fetching session history:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get session analytics/insights
export const getSessionAnalytics = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate analytics
    const totalSessions = user.sessions.length;
    
    if (totalSessions === 0) {
      return res.json({
        totalSessions: 0,
        averageDuration: 0,
        averageAccuracy: 0,
        favoritePose: null,
        weeklyProgress: []
      });
    }

    // Average duration
    const totalDuration = user.sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageDuration = Math.round(totalDuration / totalSessions);

    // Average accuracy
    const totalAccuracy = user.sessions.reduce((sum, s) => sum + (s.averageAccuracy || 0), 0);
    const averageAccuracy = Math.round(totalAccuracy / totalSessions);

    // Favorite pose (most practiced)
    const poseCount = {};
    user.sessions.forEach(session => {
      session.posesCompleted.forEach(pose => {
        poseCount[pose.poseName] = (poseCount[pose.poseName] || 0) + 1;
      });
    });
    
    const favoritePose = Object.keys(poseCount).length > 0
      ? Object.keys(poseCount).reduce((a, b) => poseCount[a] > poseCount[b] ? a : b)
      : null;

    // Last 7 days progress
    const last7Days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const sessionsOnDay = user.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      });

      const minutesOnDay = sessionsOnDay.reduce((sum, s) => sum + s.duration, 0);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        sessions: sessionsOnDay.length,
        minutes: minutesOnDay
      });
    }

    res.json({
      totalSessions,
      averageDuration,
      averageAccuracy,
      favoritePose,
      weeklyProgress: last7Days
    });

  } catch (err) {
    console.error("Error fetching session analytics:", err);
    res.status(500).json({ message: "Server Error" });
  }
};