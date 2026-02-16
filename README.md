# AI yoga Partner -Complete details

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Component Breakdown](#component-breakdown)
4. [AI Model Workflow](#ai-model-workflow)
5. [Data Flow](#data-flow)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Pose Detection Algorithm](#pose-detection-algorithm)
9. [Session Management](#session-management)
10. [User Journey](#user-journey)

---

## 1. System Overview

### What is this application?
This is a real-time yoga pose detection web application that uses AI to track and validate yoga poses during practice sessions. It provides:
- **Real-time pose detection** using computer vision
- **Accuracy scoring** for each pose
- **Session tracking** with detailed analytics
- **Progress monitoring** over time
- **Audio feedback** when poses are held correctly

### Technology Stack

**Frontend:**
- Next.js 14 (React framework)
- TypeScript
- TailwindCSS + Framer Motion (UI/animations)
- TensorFlow.js (AI models in browser)

**Backend:**
- Node.js + Express
- MongoDB (database)
- Clerk (authentication)

**AI/ML:**
- MoveNet (pose detection model by Google)
- Custom trained pose classifier (7 yoga poses)
- TensorFlow.js for browser-based inference

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Next.js Application (Browser)                 │  │
│  │                                                        │  │
│  │  ┌──────────────┐      ┌──────────────────────────┐  │  │
│  │  │   Camera     │──────▶│   Video Element          │  │  │
│  │  │   Stream     │      │   (640x480)              │  │  │
│  │  └──────────────┘      └──────────────────────────┘  │  │
│  │                                  │                    │  │
│  │                                  ▼                    │  │
│  │                        ┌─────────────────┐            │  │
│  │                        │  MoveNet Model  │            │  │
│  │                        │  (Pose Detection)│           │  │
│  │                        └─────────────────┘            │  │
│  │                                  │                    │  │
│  │                                  ▼                    │  │
│  │                        ┌─────────────────┐            │  │
│  │                        │17 Keypoints     │            │  │
│  │                        │(x, y coordinates)│           │  │
│  │                        └─────────────────┘            │  │
│  │                                  │                    │  │
│  │                                  ▼                    │  │
│  │                        ┌─────────────────┐            │  │
│  │                        │  Normalize &    │            │  │
│  │                        │  Embed (34 dims)│            │  │
│  │                        └─────────────────┘            │  │
│  │                                  │                    │  │
│  │                                  ▼                    │  │
│  │                        ┌─────────────────┐            │  │
│  │                        │ Pose Classifier │            │  │
│  │                        │  (Custom Model) │            │  │
│  │                        └─────────────────┘            │  │
│  │                                  │                    │  │
│  │                                  ▼                    │  │
│  │                        ┌─────────────────┐            │  │
│  │                        │ 8 Predictions   │            │  │
│  │                        │ (pose probabilities)│        │  │
│  │                        └─────────────────┘            │  │
│  │                                  │                    │  │
│  │                                  ▼                    │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │       UI Updates (Real-time Feedback)          │  │  │
│  │  │  • Accuracy percentage                         │  │  │
│  │  │  • Pose time counter                           │  │  │
│  │  │  • Skeleton overlay (green when correct)       │  │  │
│  │  │  • Audio feedback                              │  │  │
│  │  │  • Wrong pose warning                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP/REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER SIDE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Express.js Backend (Node.js)                  │  │
│  │                                                        │  │
│  │  ┌────────────────┐      ┌────────────────────────┐  │  │
│  │  │  Clerk Auth    │──────▶│  Protected Routes      │  │  │
│  │  │  Middleware    │      │  /api/yoga/*           │  │  │
│  │  └────────────────┘      └────────────────────────┘  │  │
│  │                                  │                    │  │
│  │                                  ▼                    │  │
│  │                        ┌─────────────────┐            │  │
│  │                        │   Controllers   │            │  │
│  │                        │  • syncUser     │            │  │
│  │                        │  • saveSession  │            │  │
│  │                        │  • getAnalytics │            │  │
│  │                        └─────────────────┘            │  │
│  │                                  │                    │  │
│  │                                  ▼                    │  │
│  │                        ┌─────────────────┐            │  │
│  │                        │   MongoDB       │            │  │
│  │                        │   Database      │            │  │
│  │                        │                 │            │  │
│  │                        │  Users          │            │  │
│  │                        │  └─ sessions[]  │            │  │
│  │                        │  └─ stats       │            │  │
│  │                        │  └─ goals       │            │  │
│  │                        └─────────────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Breakdown

### Frontend Components

#### 1. **YogaSession Component** (Main)
**File:** `page.tsx`
**Purpose:** Core component managing the entire yoga session

**Key Responsibilities:**
- Camera management
- AI model loading and inference
- Real-time pose detection
- Session state management
- Data accumulation

**State Variables:**
```typescript
// UI State
isCameraOn: boolean                    // Camera on/off
isFullscreen: boolean                  // Fullscreen mode
isRecording: boolean                   // Recording in progress
sessionStarted: boolean                // Session active
isLoading: boolean                     // Models loading
isPoseCorrect: boolean                 // Current pose correctness

// Pose Detection State
currentPoseIndex: number               // Which pose user is on (0-6)
timer: number                          // Total elapsed time (seconds)
poseTime: number                       // Time in current pose hold
bestPerform: number                    // Best hold time for pose
accuracy: number                       // Current accuracy (0-100)
startingTime: number                   // Timestamp when pose started
currentTime: number                    // Current timestamp

// Accumulators (for accurate metrics)
poseAccuracySum: number               // Sum of all accuracy readings
poseAccuracyCount: number             // Count of accuracy readings
accumulatedPoseTime: number           // Total time spent in pose
```

**Refs (Non-reactive data):**
```typescript
videoRef: HTMLVideoElement            // Video stream from camera
canvasRef: HTMLCanvasElement          // Canvas for skeleton overlay
audioRef: HTMLAudioElement            // Audio feedback
detectorRef: MoveNet model            // Pose detection model
poseClassifierRef: Custom model       // Pose classification model
flagRef: boolean                      // Whether pose is held correctly
lastActiveTimeRef: timestamp          // Last time pose was correct
```

#### 2. **Supporting Components**

**YogaHeader**
- Displays app title and model source indicator
- Shows loading state

**StatsCards**
- Shows pose time, best hold, progress indicators

**YogaSidebar**
- Current pose details
- Instructions and benefits
- Pose selection

**SessionControls**
- Start/Pause/Next/Stop buttons

---

## 4. AI Model Workflow

### Step-by-Step AI Processing

#### Step 1: Pose Detection (MoveNet)

**Input:** Video frame (640x480 pixels)
**Output:** 17 keypoints with coordinates and confidence scores

```javascript
// MoveNet detects body keypoints
const poses = await detectorRef.current.estimatePoses(video);

// Each pose contains 17 keypoints:
keypoints = [
  { name: 'nose', x: 320, y: 240, score: 0.95 },
  { name: 'left_eye', x: 305, y: 230, score: 0.92 },
  { name: 'right_eye', x: 335, y: 230, score: 0.93 },
  { name: 'left_shoulder', x: 280, y: 300, score: 0.88 },
  // ... 13 more keypoints
]
```

**Keypoint Indices (used in code):**
```javascript
const POINTS = {
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};
```

#### Step 2: Normalization

**Why normalize?**
- Makes poses scale-invariant (works regardless of distance from camera)
- Centers the pose
- Normalizes by body size

**Process:**
```javascript
// 1. Find hip center
hipsCenter = (leftHip + rightHip) / 2

// 2. Center the pose
centeredLandmarks = landmarks - hipsCenter

// 3. Calculate pose size (torso + max distance)
torsoSize = distance(shouldersCenter, hipsCenter)
maxDist = max(distance(centeredPoint, hipsCenter) for all points)
poseSize = max(torsoSize * 2.5, maxDist)

// 4. Normalize by size
normalizedLandmarks = centeredLandmarks / poseSize

// 5. Flatten to 1D array (17 points × 2 coords = 34 values)
embedding = [x1, y1, x2, y2, ..., x17, y17]
```

**Result:** 34-dimensional vector that represents the pose geometry

#### Step 3: Pose Classification

**Input:** 34-dimensional embedding
**Output:** 8 probabilities (one for each class)

```javascript
// Custom neural network classifies the pose
const predictions = await poseClassifierRef.current.predict(embedding);

// predictions is an array of 8 probabilities
predictions = [
  0.02,  // Utkasana (Chair)
  0.01,  // Bhujangasana (Cobra)
  0.03,  // Adhomukasana (Downward Dog)
  0.01,  // No_Pose
  0.02,  // Sarvangasana (Shoulder Stand)
  0.05,  // Trikonasana (Triangle)
  0.85,  // Vrukshasana (Tree) ← HIGHEST
  0.01   // Veerabhadrasana (Warrior)
]
```

**Class Mapping:**
```javascript
const CLASS_NO = {
  Utkasana: 0,           // Chair Pose
  Bhujangasana: 1,       // Cobra Pose
  Adhomukasana: 2,       // Downward Dog
  No_Pose: 3,            // No pose detected
  Sarvangasana: 4,       // Shoulder Stand
  Trikonasana: 5,        // Triangle Pose
  Vrukshasana: 6,        // Tree Pose
  Veerabhadrasana: 7,    // Warrior Pose
};
```

#### Step 4: Decision Logic

```javascript
// Find the pose with highest confidence
detectedPoseIndex = indexOf(max(predictions))
detectedConfidence = predictions[detectedPoseIndex]

// Get expected pose
expectedPoseIndex = CLASS_NO[currentPose.id]

// Decision tree:
if (detectedPoseIndex === expectedPoseIndex) {
  // ✅ CORRECT POSE
  accuracy = predictions[expectedPoseIndex] * 100
  isPoseCorrect = true
  
  if (accuracy > 95) {
    // Perfect pose - start timing and turn skeleton green
    startTimer()
    playAudio()
  }
  
} else if (detectedConfidence > 0.7) {
  // ❌ WRONG POSE (high confidence in different pose)
  accuracy = 0
  isPoseCorrect = false
  showWarning("Wrong Pose Detected")
  
} else {
  // ⚠️ LOW CONFIDENCE (not sure what pose it is)
  accuracy = predictions[expectedPoseIndex] * 100
  isPoseCorrect = true
  // Keep showing expected pose accuracy
}
```

---

## 5. Data Flow

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  USER STARTS SESSION                                        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Load AI Models (one-time)                               │
│     • MoveNet: ~10MB from CDN                               │
│     • Pose Classifier: Load from /model/ or CDN backup      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Start Camera Stream                                     │
│     • getUserMedia() → 640x480 video                        │
│     • Display in <video> element                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Detection Loop (every 100ms)                            │
│                                                             │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Get video frame                                  │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  MoveNet.estimatePoses(frame)                     │  │
│     │  → Returns 17 keypoints                           │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Draw skeleton on canvas                          │  │
│     │  • White lines normally                            │  │
│     │  • Green when pose correct + accuracy >95%        │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Normalize keypoints                              │  │
│     │  → 34-dimensional embedding                       │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Pose Classifier.predict(embedding)               │  │
│     │  → 8 probabilities                                │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Compare detected vs expected pose                │  │
│     │  • Calculate accuracy                             │  │
│     │  • Update UI                                      │  │
│     │  • Play/stop audio                                │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  If accuracy > 95%:                               │  │
│     │  • Accumulate pose time                           │  │
│     │  • Sum accuracy scores                            │  │
│     │  • Update best hold                               │  │
│     └───────────────────────────────────────────────────┘  │
│                                                             │
│     (Loop repeats every 100ms)                             │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  4. User Clicks "Next Pose"                                 │
│                                                             │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Calculate average accuracy for pose:             │  │
│     │  avgAccuracy = poseAccuracySum / poseAccuracyCount│ │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Save pose data to sessionDataRef:                │  │
│     │  {                                                 │  │
│     │    poseName: "Tree Pose",                         │  │
│     │    duration: 45,      // seconds                  │  │
│     │    accuracy: 87,      // average %                │  │
│     │    bestHold: 52       // longest hold in seconds  │  │
│     │  }                                                 │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Reset counters for next pose                     │  │
│     │  Move to next pose in sequence                    │  │
│     └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  5. User Clicks "Stop Session"                              │
│                                                             │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Save final pose data                             │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Calculate session totals:                        │  │
│     │  • Total duration (sum of all pose durations)     │  │
│     │  • Average accuracy (across all poses)            │  │
│     │  • Total poses completed                          │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Send to backend API:                             │  │
│     │  POST /api/yoga/save-session                      │  │
│     │  {                                                 │  │
│     │    duration: 15,          // minutes              │  │
│     │    posesCompleted: [...], // all pose data        │  │
│     │    totalPoses: 7,                                 │  │
│     │    averageAccuracy: 85                            │  │
│     │  }                                                 │  │
│     └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Backend Saves to MongoDB                                │
│                                                             │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Find user by Clerk ID                            │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Add session to user.sessions[]                   │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  Update user.stats:                               │  │
│     │  • totalSessions += 1                             │  │
│     │  • totalMinutes += duration                       │  │
│     │  • Update streak (if consecutive day)             │  │
│     └───────────────────────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│     ┌───────────────────────────────────────────────────┐  │
│     │  user.save()                                      │  │
│     └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. API Endpoints

### Authentication
All endpoints require Clerk JWT authentication via Bearer token.

### Endpoint Details

#### 1. **POST /api/sync-user**
**Purpose:** Sync user from Clerk to MongoDB
**Called:** On app load
**Request:**
```javascript
Headers: {
  Authorization: 'Bearer <clerk-jwt-token>'
}
```
**Response:**
```json
{
  "user": {
    "clerkId": "user_abc123",
    "username": "john_doe",
    "email": "john@example.com",
    "stats": {
      "totalSessions": 0,
      "totalMinutes": 0,
      "currentStreak": 0
    }
  },
  "isNewUser": false,
  "needsOnboarding": false
}
```

#### 2. **POST /api/yoga/save-session**
**Purpose:** Save completed yoga session
**Called:** When user stops session
**Request:**
```json
{
  "duration": 15,
  "totalPoses": 7,
  "averageAccuracy": 85,
  "posesCompleted": [
    {
      "poseName": "Tree Pose",
      "duration": 45,
      "accuracy": 87,
      "bestHold": 52
    },
    {
      "poseName": "Chair Pose",
      "duration": 38,
      "accuracy": 92,
      "bestHold": 42
    }
  ]
}
```
**Response:**
```json
{
  "message": "Session saved successfully",
  "session": { /* saved session object */ },
  "stats": {
    "totalSessions": 5,
    "totalMinutes": 67,
    "currentStreak": 3
  }
}
```

**Backend Logic:**
```javascript
// 1. Validate input
if (!duration || !posesCompleted || !Array.isArray(posesCompleted)) {
  return 400 error
}

// 2. Create session object
const newSession = {
  date: new Date(),
  duration,
  posesCompleted,
  totalPoses,
  averageAccuracy
}

// 3. Add to user's sessions array
user.sessions.push(newSession)

// 4. Update statistics
user.stats.totalSessions += 1
user.stats.totalMinutes += duration

// 5. Calculate streak
const today = new Date()
const lastSession = new Date(user.stats.lastSessionDate)
const daysDiff = calculateDayDifference(today, lastSession)

if (daysDiff === 0) {
  // Same day - no change
} else if (daysDiff === 1) {
  // Consecutive day - increase streak
  user.stats.currentStreak += 1
} else {
  // Streak broken - reset to 1
  user.stats.currentStreak = 1
}

user.stats.lastSessionDate = new Date()

// 6. Save to database
await user.save()
```

#### 3. **GET /api/yoga/session-history?limit=10**
**Purpose:** Get user's recent sessions
**Called:** On progress page
**Response:**
```json
{
  "sessions": [
    {
      "date": "2026-02-16T10:30:00Z",
      "duration": 15,
      "posesCompleted": [ /* array of poses */ ],
      "averageAccuracy": 85
    }
  ],
  "totalSessions": 5
}
```

#### 4. **GET /api/yoga/analytics**
**Purpose:** Get session analytics and insights
**Called:** On progress page
**Response:**
```json
{
  "totalSessions": 5,
  "averageDuration": 14,
  "averageAccuracy": 83,
  "favoritePose": "Tree Pose",
  "weeklyProgress": [
    {
      "date": "2026-02-10",
      "sessions": 0,
      "minutes": 0
    },
    {
      "date": "2026-02-11",
      "sessions": 1,
      "minutes": 15
    }
  ]
}
```

**Calculation Logic:**
```javascript
// Average duration
totalDuration = sum(session.duration for all sessions)
averageDuration = totalDuration / totalSessions

// Average accuracy
totalAccuracy = sum(session.averageAccuracy for all sessions)
averageAccuracy = totalAccuracy / totalSessions

// Favorite pose (most practiced)
poseCount = {}
for each session:
  for each pose in session.posesCompleted:
    poseCount[pose.poseName]++

favoritePose = pose with highest count

// Last 7 days
for i from 6 to 0:
  date = today - i days
  sessionsOnDay = sessions where date matches
  minutesOnDay = sum(session.duration for sessionsOnDay)
  weeklyProgress.push({ date, sessions: count, minutes })
```

#### 5. **GET /api/user-stats**
**Purpose:** Get user statistics
**Response:**
```json
{
  "totalSessions": 5,
  "totalMinutes": 67,
  "streak": 3,
  "weeklyGoal": 105,
  "weeklyProgress": 67
}
```

---

## 7. Database Schema

### MongoDB Collections

#### Users Collection

```javascript
{
  _id: ObjectId("..."),
  clerkId: "user_abc123",              // Primary key from Clerk
  username: "john_doe",
  email: "john@example.com",
  profileImageUrl: "https://...",
  
  // Onboarding data
  onboardingCompleted: true,
  goals: ["flexibility", "strength"],
  experience: "beginner",
  timePerDay: "15-30",
  
  // User statistics
  stats: {
    totalSessions: 5,
    totalMinutes: 67,
    currentStreak: 3,
    longestStreak: 7,
    lastSessionDate: ISODate("2026-02-16")
  },
  
  // Session history
  sessions: [
    {
      date: ISODate("2026-02-16T10:30:00Z"),
      duration: 15,                    // minutes
      totalPoses: 7,
      averageAccuracy: 85,             // percentage
      posesCompleted: [
        {
          poseName: "Tree Pose",
          duration: 45,                // seconds
          accuracy: 87,                // percentage
          bestHold: 52                 // seconds
        },
        {
          poseName: "Chair Pose",
          duration: 38,
          accuracy: 92,
          bestHold: 42
        }
        // ... more poses
      ]
    }
    // ... more sessions
  ],
  
  createdAt: ISODate("2026-01-15"),
  updatedAt: ISODate("2026-02-16")
}
```

### Indexes

```javascript
// Primary lookup by Clerk ID
db.users.createIndex({ clerkId: 1 }, { unique: true })

// Email lookup
db.users.createIndex({ email: 1 })

// Session date for analytics
db.users.createIndex({ "sessions.date": -1 })
```

---

## 8. Pose Detection Algorithm

### Detailed Algorithm Breakdown

#### Phase 1: Keypoint Detection

```python
# Pseudo-code for understanding

def detect_keypoints(video_frame):
    """
    MoveNet detects 17 body keypoints
    """
    # Preprocess image
    image = resize(video_frame, (192, 192))  # MoveNet input size
    image = normalize(image, 0, 255)
    
    # Run inference
    keypoints = movenet_model.predict(image)
    
    # Each keypoint has:
    # - name: body part name
    # - x, y: pixel coordinates
    # - score: confidence (0-1)
    
    return keypoints  # Array of 17 keypoints
```

**Keypoint Names:**
1. nose
2. left_eye
3. right_eye
4. left_ear
5. right_ear
6. left_shoulder
7. right_shoulder
8. left_elbow
9. right_elbow
10. left_wrist
11. right_wrist
12. left_hip
13. right_hip
14. left_knee
15. right_knee
16. left_ankle
17. right_ankle

#### Phase 2: Normalization

```python
def normalize_pose(keypoints):
    """
    Make pose scale and position invariant
    """
    # Step 1: Find center point (hip center)
    left_hip = keypoints[11]
    right_hip = keypoints[12]
    hip_center = (left_hip + right_hip) / 2
    
    # Step 2: Center the pose
    centered = keypoints - hip_center
    
    # Step 3: Calculate pose size
    left_shoulder = keypoints[5]
    right_shoulder = keypoints[6]
    shoulder_center = (left_shoulder + right_shoulder) / 2
    
    torso_size = distance(shoulder_center, hip_center)
    
    # Find max distance from center
    max_dist = max(distance(point, hip_center) for point in keypoints)
    
    # Pose size is larger of torso*2.5 or max distance
    pose_size = max(torso_size * 2.5, max_dist)
    
    # Step 4: Normalize by size
    normalized = centered / pose_size
    
    # Step 5: Flatten to 1D
    embedding = [x1, y1, x2, y2, ..., x17, y17]  # 34 values
    
    return embedding
```

**Why This Works:**
- **Center by hip:** Makes pose position-independent
- **Scale by pose size:** Makes pose distance-independent
- **Result:** Same pose looks identical regardless of where you stand or how far from camera

#### Phase 3: Classification

```python
def classify_pose(embedding):
    """
    Custom neural network classifies the pose
    """
    # Neural network architecture (simplified)
    # Input layer: 34 neurons (embedding)
    # Hidden layers: Dense layers with ReLU
    # Output layer: 8 neurons with softmax
    
    x = embedding  # Shape: (1, 34)
    
    # Forward pass through network
    x = dense_layer_1(x)  # → (1, 128)
    x = relu(x)
    x = dropout(x, 0.3)
    
    x = dense_layer_2(x)  # → (1, 64)
    x = relu(x)
    x = dropout(x, 0.3)
    
    x = output_layer(x)   # → (1, 8)
    predictions = softmax(x)
    
    # predictions = [0.02, 0.01, 0.03, 0.01, 0.02, 0.05, 0.85, 0.01]
    #                   0     1     2     3     4     5     6     7
    #                 Chair Cobra  Dog  None  Shldr Tri  Tree  War
    
    return predictions
```

#### Phase 4: Decision Making

```python
def make_decision(predictions, expected_pose):
    """
    Determine if pose is correct and calculate accuracy
    """
    # Find detected pose
    detected_idx = argmax(predictions)
    detected_conf = predictions[detected_idx]
    
    # Get expected pose index
    expected_idx = CLASS_NO[expected_pose]
    
    # Decision logic
    if detected_idx == expected_idx:
        # ✅ Correct pose detected
        accuracy = predictions[expected_idx] * 100
        is_correct = True
        
        if accuracy > 95:
            # Perfect - start counting time
            start_timer()
            play_audio()
            color = "green"
        else:
            # Good but not perfect
            color = "white"
            
    elif detected_conf > 0.7:
        # ❌ Wrong pose with high confidence
        accuracy = 0
        is_correct = False
        show_warning()
        color = "white"
        
    else:
        # ⚠️ Not sure - show expected pose confidence
        accuracy = predictions[expected_idx] * 100
        is_correct = True
        color = "white"
    
    return {
        accuracy,
        is_correct,
        skeleton_color: color
    }
```

---

## 9. Session Management

### Session Lifecycle

#### 1. Session Start
```javascript
handleStartSession() {
  // Initialize
  sessionDataRef.current = {
    startTime: new Date(),
    posesData: []
  }
  
  // Load models if not loaded
  if (!detectorRef.current) {
    await loadModels()
  }
  
  // Start camera and detection
  setIsCameraOn(true)
  setSessionStarted(true)
  setIsRecording(true)
}
```

#### 2. During Session
```javascript
// Every 100ms detection cycle
detectPose() {
  // Get predictions
  const predictions = await classifyPose(keypoints)
  
  // Update accuracy
  setAccuracy(predictions[expectedPose] * 100)
  
  // If pose is perfect (>95%)
  if (predictions[expectedPose] > 0.95) {
    // Accumulate time
    const now = Date.now()
    const delta = (now - lastActiveTime) / 1000
    accumulatedPoseTime += delta
    
    // Accumulate accuracy for averaging
    poseAccuracySum += predictions[expectedPose] * 100
    poseAccuracyCount += 1
    
    // Play audio feedback
    if (audio.paused) {
      audio.play()
    }
  } else {
    // Stop audio when pose breaks
    audio.pause()
  }
}
```

#### 3. Next Pose
```javascript
handleNextPose() {
  // Calculate averages for this pose
  const avgAccuracy = poseAccuracyCount > 0
    ? poseAccuracySum / poseAccuracyCount
    : 0
  
  // Save pose data
  sessionDataRef.current.posesData.push({
    poseName: currentPose.name,
    duration: Math.round(accumulatedPoseTime),
    accuracy: Math.round(avgAccuracy),
    bestHold: Math.round(bestPerform)
  })
  
  // Reset for next pose
  setAccumulatedPoseTime(0)
  setPoseAccuracySum(0)
  setPoseAccuracyCount(0)
  
  // Move to next
  setCurrentPoseIndex((prev) => (prev + 1) % YOGA_POSES.length)
}
```

#### 4. Session End
```javascript
handleStopSession() {
  // Save last pose
  if (accumulatedPoseTime > 0) {
    sessionDataRef.current.posesData.push({ /* last pose */ })
  }
  
  // Calculate totals
  const totalSeconds = sum(pose.duration for all poses)
  const durationMinutes = Math.round(totalSeconds / 60)
  
  const avgAccuracy = average(pose.accuracy for all poses)
  
  // Send to backend
  await saveSession({
    duration: durationMinutes,
    posesCompleted: sessionDataRef.current.posesData,
    totalPoses: sessionDataRef.current.posesData.length,
    averageAccuracy: avgAccuracy
  })
  
  // Cleanup
  stopCamera()
  resetState()
}
```

### Data Accumulation Strategy

**Problem:** Need accurate metrics despite fluctuating readings

**Solution:** Accumulate over time
```javascript
// Instead of just showing current accuracy:
accuracy = predictions[pose] * 100  // Jumps around 80-95%

// We accumulate all readings:
poseAccuracySum = 0
poseAccuracyCount = 0

// Each detection cycle (when accuracy > 95%):
poseAccuracySum += currentAccuracy
poseAccuracyCount += 1

// Final average:
avgAccuracy = poseAccuracySum / poseAccuracyCount
// Result: Stable 87% instead of jumping 80-95%
```

**Time Accumulation:**
```javascript
// Track actual time in pose (not wall clock time)
accumulatedPoseTime = 0
lastActiveTime = null

// Each detection cycle (when accuracy > 95%):
if (lastActiveTime) {
  delta = (now - lastActiveTime) / 1000
  accumulatedPoseTime += delta
}
lastActiveTime = now

// If pose breaks (accuracy drops):
lastActiveTime = null  // Stop accumulating

// Result: Only counts time when pose is held correctly
```

---

## 10. User Journey

### Complete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Authentication                                     │
│  • User signs in with Clerk (Google/Email)                  │
│  • Frontend receives JWT token                              │
│  • Calls /api/sync-user to create/fetch DB user             │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Onboarding (if first time)                         │
│  • Select goals: flexibility, strength, stress relief       │
│  • Select experience: beginner, intermediate, advanced      │
│  • Select time commitment: 15-30, 30-45, 45-60 mins         │
│  • Saves to user profile                                    │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Dashboard                                          │
│  • Shows weekly goal progress                               │
│  • Shows current streak                                     │
│  • Quick action: "Start Yoga Session"                       │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Yoga Session                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4a. Click "Start Session"                           │   │
│  │      • Loads AI models (MoveNet + Pose Classifier)   │   │
│  │      • Requests camera permission                    │   │
│  │      • Starts video stream                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4b. Practice First Pose (Tree Pose)                 │   │
│  │      • Shows instructions and benefits               │   │
│  │      • Real-time skeleton overlay                    │   │
│  │      • Accuracy percentage updates                   │   │
│  │      • Green skeleton when >95% accurate             │   │
│  │      • Audio plays while holding correctly           │   │
│  │      • Timer counts total time                       │   │
│  │      • Pose time counts correct hold time            │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4c. Click "Next Pose"                               │   │
│  │      • Saves Tree Pose data (duration, accuracy)     │   │
│  │      • Moves to Chair Pose                           │   │
│  │      • Resets counters                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4d. Continue Through All Poses                      │   │
│  │      • Repeat 4b-4c for each pose                    │   │
│  │      • Can pause session anytime                     │   │
│  │      • Can skip poses                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4e. Click "Stop Session"                            │   │
│  │      • Calculates session totals                     │   │
│  │      • Sends data to backend                         │   │
│  │      • Shows success toast                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: View Progress                                      │
│  • Navigate to Progress page                                │
│  • View session history                                     │
│  • See analytics:                                           │
│    - Total sessions                                         │
│    - Total time                                             │
│    - Current streak                                         │
│    - Average accuracy                                       │
│    - Favorite pose                                          │
│    - Weekly activity chart                                  │
│  • Each past session shows:                                 │
│    - Date and duration                                      │
│    - All poses practiced                                    │
│    - Individual pose metrics                                │
└─────────────────────────────────────────────────────────────┘
```

### Example Session Data

**During Session:**
```javascript
// User practices 7 poses over 15 minutes

Pose 1: Tree Pose
  - Total time in pose: 45 seconds
  - Average accuracy: 87%
  - Best hold: 52 seconds

Pose 2: Chair Pose
  - Total time: 38 seconds
  - Average accuracy: 92%
  - Best hold: 42 seconds

Pose 3: Cobra Pose
  - Total time: 41 seconds
  - Average accuracy: 85%
  - Best hold: 45 seconds

// ... 4 more poses

Total session: 15 minutes
Average accuracy: 88%
```

**Saved to Database:**
```json
{
  "date": "2026-02-16T10:30:00Z",
  "duration": 15,
  "totalPoses": 7,
  "averageAccuracy": 88,
  "posesCompleted": [
    {
      "poseName": "Tree Pose",
      "duration": 45,
      "accuracy": 87,
      "bestHold": 52
    },
    // ... 6 more poses
  ]
}
```

**Updates User Stats:**
```javascript
Before session:
  totalSessions: 4
  totalMinutes: 52
  currentStreak: 2

After session:
  totalSessions: 5
  totalMinutes: 67
  currentStreak: 3  // (if practiced on consecutive day)
```

---

## Key Takeaways

### What Makes This App Work?

1. **Client-Side AI:** All pose detection happens in the browser using TensorFlow.js
   - No server calls for every frame
   - Real-time feedback (10 FPS)
   - Works offline after models load

2. **Two-Stage Model:**
   - Stage 1 (MoveNet): Finds body keypoints
   - Stage 2 (Custom): Classifies which yoga pose

3. **Smart Normalization:**
   - Pose detection works regardless of:
     - Distance from camera
     - Position in frame
     - Body size
   - All poses normalized to same scale

4. **Accurate Metrics:**
   - Accumulates data over time
   - Averages out fluctuations
   - Only counts "perfect" pose time (>95% accuracy)

5. **Progressive Enhancement:**
   - Audio feedback when pose is correct
   - Visual feedback (green skeleton)
   - Wrong pose warnings
   - Detailed analytics and progress tracking

### Technical Highlights

- **Models:** 
  - MoveNet Thunder: ~10MB, ~100ms inference
  - Custom classifier: ~1MB, <10ms inference
  
- **Performance:** 
  - 10 detections per second
  - Minimal lag
  - Runs on average laptop/phone

- **Accuracy:**
  - Keypoint detection: 85-95% confidence
  - Pose classification: 70-99% confidence
  - User sees: Real-time accuracy percentage

- **Data Flow:**
  - Browser → AI Models → UI (milliseconds)
  - Browser → Backend → Database (on session end)

This architecture provides a responsive, accurate, and engaging yoga practice experience!
