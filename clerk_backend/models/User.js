import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profileImageUrl: {
    type: String,
    default: ""
  },

  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  goals: [{
    type: String,
    enum: ['flexibility', 'stress', 'strength', 'balance', 'meditation']
  }],
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  timePerDay: {
    type: String,
    enum: ['15-30', '30-45', '45-60'],
    default: '15-30'
  },
  // Yoga stats
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    lastSessionDate: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);