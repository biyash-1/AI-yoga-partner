import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

export const syncUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId; // requireAuth() ensures this exists
    if (!clerkId) return res.status(401).json({ message: "Not authenticated" });

    
    const clerkUser = await clerkClient.users.getUser(clerkId);


    let dbUser = await User.findOne({ clerkId });
    if (!dbUser) {
      dbUser = await User.create({
        clerkId,
        username:
          clerkUser.username ??
          clerkUser.emailAddresses[0].emailAddress.split("@")[0],
        email: clerkUser.emailAddresses[0].emailAddress,
        profileImageUrl: clerkUser.profileImageUrl || "",
      });
    }
      let isNewUser = false;
    res.json({ 
      user: dbUser, 
      isNewUser,
      needsOnboarding: !dbUser.onboardingCompleted 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const checkOnboarding = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      onboardingCompleted: user.onboardingCompleted,
      hasGoals: user.goals && user.goals.length > 0,
      hasExperience: !!user.experience,
      hasTimeCommitment: !!user.timePerDay
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const saveOnboarding = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ message: "Not authenticated" });

    const { goals, experience, timePerDay } = req.body;

 
    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return res.status(400).json({ message: "Goals are required" });
    }
    if (!experience) {
      return res.status(400).json({ message: "Experience level is required" });
    }
    if (!timePerDay) {
      return res.status(400).json({ message: "Time commitment is required" });
    }

    // Update user with onboarding data
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        goals,
        experience,
        timePerDay,
        onboardingCompleted: true
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Onboarding completed successfully", 
      user: updatedUser 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate weekly progress (example logic)
    const weeklyGoal = parseInt(user.timePerDay.split('-')[0]) * 7; // minutes per week
    const weeklyProgress = user.stats.totalMinutes % weeklyGoal; // simplified

    res.json({
      totalSessions: user.stats.totalSessions,
      totalMinutes: user.stats.totalMinutes,
      streak: user.stats.currentStreak,
      weeklyGoal,
      weeklyProgress
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
