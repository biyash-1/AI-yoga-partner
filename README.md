# 🧘 AI Yoga Partner

An intelligent yoga companion that uses **real-time AI pose detection** to guide your practice, track your progress, and help perfect your form — all running directly in your browser.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.17-FF6F00?style=flat-square&logo=tensorflow)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [AI Model Details](#-ai-model-details)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## ✨ Features

- 🎯 **Real-Time Pose Detection** — Uses MoveNet + custom neural network to classify 7 yoga poses in real-time
- 📸 **Webcam Integration** — Live skeleton overlay drawn on your body as you practice
- 📊 **Accuracy Tracking** — See how well you're performing each pose with live confidence scores
- 🏆 **Session Metrics** — Track pose hold time, best hold, and overall session accuracy
- 🔥 **Streak System** — Daily streak tracking to keep you motivated
- 📈 **Analytics Dashboard** — Weekly progress charts, favorite pose, average accuracy
- 🔊 **Audio Feedback** — Sound cues when you hold a pose correctly (>95% accuracy)
- 🔐 **Authentication** — Secure sign-in/sign-up with Clerk
- 💾 **Cloud Persistence** — All sessions saved to MongoDB for long-term tracking
- 🌐 **Privacy-First** — All AI processing happens in your browser; no video is sent to any server

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                          │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │  Webcam   │───▶│   MoveNet    │───▶│ Custom Classifier    │  │
│  │  640×480  │    │  (17 joints) │    │ (Dense NN: 34→128→   │  │
│  └──────────┘    └──────────────┘    │  64→8 classes)        │  │
│                                      └──────────┬───────────┘  │
│                                                 │              │
│  ┌──────────────────────────────────────────────▼───────────┐  │
│  │              Next.js Frontend (React)                     │  │
│  │  • Skeleton overlay  • Accuracy display  • Session UI     │  │
│  └──────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────┘
                              │ REST API (JWT Auth)
┌─────────────────────────────▼──────────────────────────────────┐
│                    Express.js Backend                           │
│  • Save sessions  • Analytics  • User management  • Streaks   │
└─────────────────────────────┬──────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────┐
│                      MongoDB Database                          │
│  • Users  • Sessions  • Pose metrics  • Stats                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety |
| **TensorFlow.js** | Browser-based ML inference |
| **@tensorflow-models/pose-detection** | MoveNet pose estimation |
| **Clerk** | Authentication |
| **Framer Motion** | Animations |
| **TailwindCSS 4** | Styling |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express.js 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **Clerk Express SDK** | JWT verification |

### AI / ML
| Technology | Purpose |
|-----------|---------|
| **Python + TensorFlow/Keras** | Model training |
| **MoveNet Thunder (TFLite)** | Keypoint extraction during training |
| **MoveNet (TF.js)** | Browser-based keypoint detection |
| **Custom Dense NN** | Yoga pose classification |

---

## 🧠 How It Works

### Real-Time Pose Detection Pipeline

```
1. CAMERA           → Captures video at 640×480 resolution
2. MOVENET          → Detects 17 body keypoints (nose, eyes, ears,
                      shoulders, elbows, wrists, hips, knees, ankles)
3. NORMALIZATION    → Centers keypoints at hip midpoint, scales to
                      constant size → 34 features (17 × 2 coordinates)
4. CLASSIFICATION   → Custom Neural Network predicts pose probabilities
                      → [0.02, 0.01, 0.03, 0.01, 0.02, 0.01, 0.88, 0.02]
5. FEEDBACK         → Compares with expected pose → Shows accuracy,
                      skeleton color, audio cues
6. TRACKING         → Records hold time, best hold, average accuracy
7. PERSISTENCE      → Saves session data to MongoDB on session end
```

### Supported Yoga Poses (7 + No Pose)

| # | Pose | Sanskrit Name |
|---|------|--------------|
| 1 | 🌳 Tree Pose | Vrukshasana |
| 2 | 🪑 Chair Pose | Utkasana |
| 3 | 🐍 Cobra Pose | Bhujangasana |
| 4 | ⚔️ Warrior Pose | Veerabhadrasana |
| 5 | 🐕 Downward Dog | Adhomukasana |
| 6 | 🤸 Shoulder Stand | Sarvangasana |
| 7 | 📐 Triangle Pose | Trikonasana |

---

## 🤖 AI Model Details

### Model Architecture

```
Input (34 features: 17 keypoints × 2 coordinates)
    │
    ▼
Dense Layer (128 neurons, ReLU6 activation)
    │
    ▼
Dropout (50%)
    │
    ▼
Dense Layer (64 neurons, ReLU6 activation)
    │
    ▼
Dropout (50%)
    │
    ▼
Output Layer (8 neurons, Softmax activation)
    → Probabilities for each yoga pose class
```

### Training Details

| Parameter | Value |
|-----------|-------|
| Input Shape | (34,) — normalized (x, y) coordinates |
| Output Classes | 8 (7 poses + no_pose) |
| Optimizer | Adam |
| Loss Function | Categorical Cross-Entropy |
| Max Epochs | 200 |
| Batch Size | 16 |
| Early Stopping | Patience: 20 epochs |
| Regularization | Dropout (0.5) |

### Data Preprocessing Pipeline

```
Training Images → MoveNet Thunder → 17 Keypoints (x, y, score)
     → CSV Files → Normalization (center + scale) → 34 Features
     → Train/Test Split → Model Training → Export to TF.js
```

---

## 📁 Project Structure

```
AI-yoga-partner/
│
├── AI/                              # ML Training Module
│   └── classification model/
│       ├── data.py                  # BodyPart enum (17 keypoints)
│       ├── movenet.py               # MoveNet TFLite wrapper
│       ├── proprocessing.py         # Image → Keypoint → CSV pipeline
│       ├── training.py              # Neural network training
│       ├── convert_model.py         # Keras → TensorFlow.js converter
│       ├── class_names.json         # ["chair","cobra","dog",...]
│       ├── yoga_poses/              # Training/test images
│       └── csv_per_pose/            # Extracted keypoint CSVs
│
├── frontend/                        # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Global styles
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # Dashboard (stats + analytics)
│   │   │   ├── yoga-session/
│   │   │   │   └── page.tsx         # ⭐ Core: Real-time yoga session
│   │   │   └── progress/
│   │   │       └── page.tsx         # Progress tracking
│   │   ├── hooks/
│   │   │   ├── usePoseDetection.ts  # Pose detection hook
│   │   │   └── Useyogasession.ts    # Session persistence hook
│   │   └── utils/
│   │       └── pose_images.ts       # Pose image mappings
│   ├── components/
│   │   ├── yoga/
│   │   │   ├── YogaHeader.tsx       # Session header component
│   │   │   ├── StatsCards.tsx       # Pose time/best hold/progress
│   │   │   ├── YogaSidebar.tsx      # Pose guide + sequence list
│   │   │   └── SessionControls.tsx  # Start/pause/next/stop buttons
│   │   ├── Navbar.tsx
│   │   ├── FeatureSection.tsx
│   │   └── SyncUserOnSignIn.tsx     # Clerk → MongoDB user sync
│   ├── public/
│   │   ├── model/                   # TF.js model files
│   │   │   ├── model.json
│   │   │   └── group1-shard1of1.bin
│   │   └── poses/                   # Reference pose images
│   └── middleware.ts                # Clerk route protection
│
└── clerk_backend/                   # Express.js Backend
    ├── index.js                     # Server entry + route definitions
    ├── controllers/
    │   ├── userController.js        # User sync, onboarding, stats
    │   └── yogacontroller.js        # Session save, history, analytics
    ├── models/
    │   └── User.js                  # Mongoose schema
    └── services/
        └── yogaPoseService.js       # Server-side pose service
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **Python** 3.8+ (only for AI model training)
- **MongoDB** (local or Atlas)
- **Clerk Account** ([clerk.com](https://clerk.com))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AI-yoga-partner.git
cd AI-yoga-partner
```

### 2. Setup Backend

```bash
cd clerk_backend
npm install
```

Create a `.env` file:
```env
MONGOURI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yoga-app
PORT=5000
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
```

Start the backend:
```bash
node index.js
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
```

Start the development server:
```bash
npm run dev
```

### 4. Open the App

Navigate to `http://localhost:3000` in your browser.

### 5. (Optional) Train the AI Model

```bash
cd AI/classification\ model
pip install -r requirements.txt

# Step 1: Extract keypoints from images
python proprocessing.py

# Step 2: Train the model
python training.py

# Step 3: Convert to TensorFlow.js format
tensorflowjs_converter --input_format=keras saved_model ../frontend/public/model
```

---

## 📡 API Endpoints

### User Management
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/sync-user` | Sync Clerk user to MongoDB |
| `GET` | `/api/check-onboarding` | Check onboarding status |
| `POST` | `/api/save-onboarding` | Save user preferences |
| `GET` | `/api/user-stats` | Get user statistics |

### Yoga Sessions
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/yoga/save-session` | Save a completed session |
| `GET` | `/api/yoga/session-history` | Get session history |
| `GET` | `/api/yoga/analytics` | Get analytics & insights |

> All endpoints require a valid Clerk JWT token in the `Authorization` header.

---

## 🗄 Database Schema

### User Document

```javascript
{
  clerkId: String,              // Unique Clerk authentication ID
  username: String,
  email: String,
  profileImageUrl: String,
  onboardingCompleted: Boolean,
  goals: [String],              // ['flexibility', 'strength', ...]
  experience: String,           // 'beginner' | 'intermediate' | 'advanced'
  timePerDay: String,           // '15-30' | '30-45' | '45-60'
  stats: {
    totalSessions: Number,
    totalMinutes: Number,
    currentStreak: Number,
    lastSessionDate: Date
  },
  sessions: [{
    date: Date,
    duration: Number,           // in minutes
    posesCompleted: [{
      poseName: String,
      duration: Number,         // seconds held
      accuracy: Number,         // percentage (0-100)
      bestHold: Number          // best hold in seconds
    }],
    totalPoses: Number,
    averageAccuracy: Number
  }]
}
```

---

## 🖼 Screenshots

> *Add screenshots of your application here*
> 
> - Landing Page
> - Dashboard with Stats
> - Yoga Session with AI Detection
> - Pose Accuracy Feedback

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is built for educational purposes.

---

## 🙏 Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) — Browser-based ML
- [MoveNet](https://www.tensorflow.org/hub/tutorials/movenet) — Pose estimation model by Google
- [Clerk](https://clerk.com) — Authentication platform
- [Next.js](https://nextjs.org) — React framework
- [MongoDB](https://www.mongodb.com) — Database

---

<p align="center">
  Built with ❤️ using AI & Modern Web Technologies
</p>
