# 🧘 AI Yoga Partner

> A full-stack AI-powered web application that provides **real-time yoga pose detection and correction** using your webcam. Built with Next.js, TensorFlow.js, and a custom-trained neural network.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.17-orange?logo=tensorflow)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?logo=mongodb)
![Clerk](https://img.shields.io/badge/Auth-Clerk-blue?logo=clerk)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [How It Works](#-how-it-works)
- [Supported Poses](#-supported-poses)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [AI/ML Pipeline](#-aiml-pipeline)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## ✨ Features

- 🎥 **Real-time pose detection** via webcam using MoveNet Thunder
- 🧠 **Custom-trained neural network** classifies 7 yoga poses + idle state
- 📊 **Live accuracy feedback** with skeleton overlay (green = correct pose)
- 🔊 **Audio cues** when pose is held correctly (>95% confidence)
- 📈 **Dashboard with analytics** — session history, accuracy trends, streaks
- 🔐 **Secure authentication** via Clerk (sign-up, sign-in, JWT)
- 🗓️ **Streak tracking** — tracks consecutive practice days
- 🎯 **Weekly goals** — with progress bar based on user preferences
- 🌐 **All AI runs in-browser** — no images sent to server (privacy-first)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 15** (React 19) | Framework, routing, SSR |
| **TypeScript** | Type safety |
| **TensorFlow.js** | In-browser ML inference |
| **@tensorflow-models/pose-detection** | MoveNet Thunder (17 body keypoints) |
| **Clerk** (`@clerk/nextjs`) | Authentication |
| **Framer Motion** | Animations |
| **Tailwind CSS v4** | Styling |

### Backend
| Technology | Purpose |
|---|---|
| **Express.js 5** | REST API server |
| **MongoDB** + **Mongoose** | Database & ODM |
| **Clerk** (`@clerk/express`) | JWT middleware |

### AI/ML (Python — Training Only)
| Technology | Purpose |
|---|---|
| **TensorFlow / Keras** | Model training |
| **MoveNet Thunder** (TFLite) | Keypoint extraction from images |
| **Pandas, NumPy, scikit-learn** | Data processing |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       USER'S BROWSER                         │
│                                                              │
│   Webcam ──▶ MoveNet (17 keypoints) ──▶ Dense NN Classifier │
│                                              │               │
│                                    8 pose probabilities      │
│                                              │               │
│   Canvas (skeleton overlay) ◀── Decision Logic               │
│                                              │               │
│   Session Data ──────────────────────────────┘               │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP (Bearer Token)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPRESS.JS BACKEND (Node.js)                    │
│   Clerk Auth ──▶ Controllers ──▶ MongoDB (Mongoose)         │
└─────────────────────────────────────────────────────────────┘
```

> **Privacy**: All AI inference runs entirely in the browser. No images or video are ever sent to the server.

---

## 🧠 How It Works

### Two-Stage AI Pipeline

**Stage 1 — Pose Estimation (MoveNet Thunder)**
- Detects **17 body keypoints** from each webcam frame
- Each keypoint: `{x, y, confidence_score}`
- Runs at ~10 FPS in the browser via WebGL acceleration

**Stage 2 — Pose Classification (Custom Dense Neural Network)**
- Takes 17 keypoints → normalizes to 34 values (x, y only)
- Normalization: centers at hip midpoint + scales by body size
- Feeds into: `Dense(128, ReLU6) → Dropout(0.5) → Dense(64, ReLU6) → Dropout(0.5) → Dense(8, Softmax)`
- Outputs **8 probabilities** (one per pose class)

### Real-Time Detection Loop (every 100ms)

```
1. Capture webcam frame
2. MoveNet detects 17 keypoints
3. Skip if >4 keypoints are low-confidence
4. Normalize: center at hips, scale by body size → 34 features
5. Classifier outputs 8 probabilities
6. Compare detected pose with expected pose
7. If match ≥ 95%: green skeleton, play sound, track time
8. If mismatch > 70%: show "wrong pose" warning
```

---

## 🧘 Supported Poses

| # | Pose | Sanskrit Name | Description |
|---|------|---------------|-------------|
| 1 | 🌳 Tree Pose | Vrukshasana | Stand on one leg, arms in prayer |
| 2 | 🪑 Chair Pose | Utkasana | Squat with arms overhead |
| 3 | 🐍 Cobra Pose | Bhujangasana | Lie face down, lift chest |
| 4 | ⚔️ Warrior Pose | Veerabhadrasana | Front knee bent, arms extended |
| 5 | 🐕 Downward Dog | Adhomukasana | Inverted V-shape |
| 6 | 🤸 Shoulder Stand | Sarvangasana | Legs and hips lifted |
| 7 | 📐 Triangle Pose | Trikonasana | Wide stance, reach to ankle |
| 8 | 🚫 No Pose | — | Idle / not performing any pose |

---

## 📁 Project Structure

```
AI-yoga-partner/
│
├── AI/                                  # ML Training Pipeline (Python)
│   └── classification model/
│       ├── yoga_poses/train/            # Training images (8 pose folders)
│       ├── yoga_poses/test/             # Test images
│       ├── proprocessing.py             # MoveNet → keypoints → CSV
│       ├── data.py                      # BodyPart enum & data types
│       ├── movenet.py                   # MoveNet TFLite wrapper
│       ├── training.py                  # Train Dense NN classifier
│       ├── convert_model.py             # Export to TF.js format
│       ├── movenet_thunder.tflite       # Pre-trained MoveNet model
│       ├── train_data.csv / test_data.csv
│       └── class_names.json             # 8 class labels
│
├── frontend/                            # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx                     # Landing page
│   │   ├── layout.tsx                   # Root layout + ClerkProvider
│   │   ├── middleware.ts                # Auth route protection
│   │   ├── dashboard/
│   │   │   ├── page.tsx                 # Dashboard (stats, analytics)
│   │   │   ├── progress/page.tsx        # Progress tracking
│   │   │   └── yoga-session/page.tsx    # ★ Real-time yoga session
│   │   ├── hooks/Useyogasession.ts      # API hook for session CRUD
│   │   ├── onboarding/page.tsx          # First-time user setup
│   │   └── about/page.tsx
│   ├── components/yoga/                 # Yoga session UI components
│   ├── public/model/                    # TF.js model (model.json + .bin)
│   └── package.json
│
└── clerk_backend/                       # Express.js Backend
    ├── index.js                         # Server entry + routes
    ├── controllers/
    │   ├── userController.js            # User sync, onboarding, stats
    │   └── yogacontroller.js            # Session save, history, analytics
    ├── models/User.js                   # Mongoose schema
    ├── services/yogaPoseService.js      # Optional server-side pose service
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.8+ (only for model training)
- **MongoDB** instance (local or Atlas)
- **Clerk** account (free at [clerk.com](https://clerk.com))

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-yoga-partner.git
cd AI-yoga-partner
```

### 2. Setup Backend

```bash
cd clerk_backend
npm install
```

Create `.env` file:
```env
MONGOURI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yoga_app
PORT=5000
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

Start the server:
```bash
node index.js
# or with nodemon:
npx nodemon index.js
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Start the dev server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### 4. (Optional) Retrain the AI Model

```bash
cd AI/classification\ model
pip install -r ../requirements.txt

# Step 1: Extract keypoints from images
python proprocessing.py

# Step 2: Train the classifier
python training.py

# Step 3: Convert for TF.js
tensorflowjs_converter --input_format=keras_saved_model saved_model model
# Then copy model.json + .bin files to frontend/public/model/
```

---

## 🤖 AI/ML Pipeline

### Training Flow

```
Images → MoveNet (keypoints) → CSV → Normalize → Dense NN → Saved Model → TF.js
```

### Model Architecture

```
Input(34) → Dense(128, ReLU6) → Dropout(0.5) → Dense(64, ReLU6) → Dropout(0.5) → Dense(8, Softmax)
```

| Parameter | Value |
|---|---|
| Input features | 34 (17 keypoints × 2 coordinates) |
| Hidden layers | 2 (128 and 64 neurons) |
| Activation | ReLU6 |
| Regularization | Dropout 50% |
| Output | 8 classes (Softmax probabilities) |
| Loss function | Categorical Cross-Entropy |
| Optimizer | Adam |
| Training epochs | 200 (early stopping, patience=20) |
| Model size | ~74 KB |

### Normalization Details

1. **Translation**: Center all keypoints at the midpoint of left and right hip → position-invariant
2. **Scaling**: Divide by `max(torso_size × 2.5, max_keypoint_distance)` → scale-invariant

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/sync-user` | Sync user from Clerk to MongoDB | ✅ |
| `GET` | `/api/check-onboarding` | Check onboarding status | ✅ |
| `POST` | `/api/save-onboarding` | Save goals & preferences | ✅ |
| `GET` | `/api/user-stats` | Get stats (streak, minutes, etc.) | ✅ |
| `POST` | `/api/yoga/save-session` | Save completed session | ✅ |
| `GET` | `/api/yoga/session-history` | Get recent sessions | ✅ |
| `GET` | `/api/yoga/analytics` | Get analytics & insights | ✅ |

### Example: Save Session Payload

```json
{
  "duration": 5,
  "totalPoses": 3,
  "averageAccuracy": 87,
  "posesCompleted": [
    {
      "poseName": "Tree Pose",
      "duration": 45,
      "accuracy": 92,
      "bestHold": 18
    }
  ]
}
```

---

## 🔐 Authentication

- **Clerk** handles user sign-up, sign-in, and session management
- Frontend: `@clerk/nextjs` with middleware protecting `/dashboard/*` routes
- Backend: `@clerk/express` with `requireAuth()` middleware verifying JWT tokens
- Tokens are passed as `Authorization: Bearer <token>` headers

---

## 📸 Screenshots

> _Add your application screenshots here_

| Landing Page | Dashboard | Yoga Session |
|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) — In-browser ML inference
- [MoveNet](https://www.tensorflow.org/hub/tutorials/movenet) — Google's pose estimation model
- [Clerk](https://clerk.com) — Authentication platform
- [Next.js](https://nextjs.org) — React framework
- Yoga pose dataset contributors

---

<p align="center">
  Made with ❤️ for a healthier world 🧘
</p>
