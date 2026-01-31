
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  posesCompleted: [{
    poseName: String,
    duration: Number, // seconds held
    accuracy: Number, // percentage
    bestHold: Number // best time in seconds
  }],
  totalPoses: {
    type: Number,
    default: 0
  },
  averageAccuracy: {
    type: Number,
    default: 0
  }
});

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
  
  // NEW: Session history
  sessions: [sessionSchema],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);