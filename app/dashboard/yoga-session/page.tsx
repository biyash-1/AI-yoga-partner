'use client';

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { YogaAIService } from '../../services/yogaServices';

// Pose list for dropdown
const POSE_LIST = [
  'Vrukshasana',
  'Utkasana',
  'Bhujangasana',
  'Veerabhadrasana',
  'Adhomukasana',
  'Sarvangasana',
  'Trikonasana'
];

// Pose images (you'll need to add these to public/poses/)
const poseImages: { [key: string]: string } = {
  Vrukshasana: '/poses/vrukshasana.png',
  Utkasana: '/poses/utkasana.png',
  Bhujangasana: '/poses/bhujangasana.png',
  Veerabhadrasana: '/poses/veerabhadrasana.png',
  Adhomukasana: '/poses/adhomukasana.png',
  Sarvangasana: '/poses/sarvangasana.png',
  Trikonasana: '/poses/trikonasana.png',
};

export default function YogaDetectionPage() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [yogaAI] = useState(() => new YogaAIService());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentPose, setCurrentPose] = useState('Vrukshasana');
  const [detectedPose, setDetectedPose] = useState('No_Pose');
  const [accuracy, setAccuracy] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [startingTime, setStartingTime] = useState(0);
  const [isCorrectPose, setIsCorrectPose] = useState(false);

  // Initialize AI service on mount
  useEffect(() => {
    const initAI = async () => {
      try {
        await yogaAI.initialize('/model/model.json');
        setIsInitialized(true);
        console.log('✅ Yoga AI initialized');
      } catch (error) {
        console.error('❌ Failed to initialize:', error);
        alert('Failed to load AI model. Please check console for errors.');
      }
    };

    initAI();

    return () => {
      yogaAI.dispose();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [yogaAI]);

  // Update pose time
  useEffect(() => {
    if (isCorrectPose && startingTime > 0) {
      const timeDiff = (Date.now() - startingTime) / 1000;
      setPoseTime(timeDiff);
      
      if (timeDiff > bestPerform) {
        setBestPerform(timeDiff);
      }
    }
  }, [isCorrectPose, startingTime, bestPerform]);

  // Reset timers when pose changes
  useEffect(() => {
    setPoseTime(0);
    setBestPerform(0);
    setStartingTime(0);
  }, [currentPose]);

  const detectPose = async () => {
    if (!webcamRef.current?.video || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const ctx = canvasRef.current.getContext('2d');
    
    if (!ctx || video.readyState !== 4) return;

    try {
      const result = await yogaAI.detectPose(video, ctx, currentPose);
      
      if (result) {
        setDetectedPose(result.poseName);
        setAccuracy(result.accuracy);
        
        // Check if detected pose matches target pose
        const isMatch = result.poseName === currentPose && result.isCorrectPose;
        
        if (isMatch && !isCorrectPose) {
          // Just started correct pose
          setStartingTime(Date.now());
          setIsCorrectPose(true);
        } else if (!isMatch && isCorrectPose) {
          // Lost correct pose
          setIsCorrectPose(false);
          setStartingTime(0);
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  const startYoga = () => {
    if (!isInitialized) {
      alert('AI model is still loading. Please wait...');
      return;
    }

    setIsStarted(true);
    setPoseTime(0);
    setBestPerform(0);
    setStartingTime(0);
    setIsCorrectPose(false);

    intervalRef.current = setInterval(() => {
      detectPose();
    }, 100); // Run detection every 100ms (~10 FPS)
  };

  const stopYoga = () => {
    setIsStarted(false);
    setIsCorrectPose(false);
    setStartingTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  if (isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">Target Pose</p>
              <p className="text-white text-xl font-bold">{currentPose}</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">Detected</p>
              <p className={`text-xl font-bold ${
                detectedPose === currentPose ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {detectedPose}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">Accuracy</p>
              <p className={`text-xl font-bold ${
                accuracy > 90 ? 'text-green-400' : 
                accuracy > 70 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {accuracy.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">Hold Time</p>
              <p className="text-white text-xl font-bold">{poseTime.toFixed(1)}s</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Webcam + Canvas */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <Webcam
                ref={webcamRef}
                audio={false}
                width={640}
                height={480}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: 'user'
                }}
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute top-0 left-0 w-full h-full"
              />
              
              {/* Status Indicator */}
              <div className="absolute top-4 left-4">
                <div className={`px-4 py-2 rounded-full font-semibold ${
                  isCorrectPose 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-black'
                }`}>
                  {isCorrectPose ? '✓ Correct Pose!' : '↻ Adjust Position'}
                </div>
              </div>

              {/* Best Performance */}
              {bestPerform > 0 && (
                <div className="absolute top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-full font-semibold">
                  Best: {bestPerform.toFixed(1)}s
                </div>
              )}
            </div>

            {/* Reference Image */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-white text-2xl font-bold mb-4">Reference Pose</h3>
              <div className="bg-white/5 rounded-lg overflow-hidden">
                {poseImages[currentPose] ? (
                  <img
                    src={poseImages[currentPose]}
                    alt={currentPose}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center text-white/60">
                    <p>Reference image not available</p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-white/80 text-sm">
                <p><strong>Tip:</strong> Match your body position to the reference image. 
                The skeleton will turn green when you're in the correct pose!</p>
              </div>
            </div>
          </div>

          {/* Stop Button */}
          <div className="mt-6 text-center">
            <button
              onClick={stopYoga}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Stop Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white text-center mb-2">
            🧘 AI Yoga Trainer
          </h1>
          <p className="text-white/60 text-center mb-8">
            Practice yoga with real-time AI pose detection
          </p>

          {/* Pose Selection */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-2">
              Select Pose to Practice
            </label>
            <select
              value={currentPose}
              onChange={(e) => setCurrentPose(e.target.value)}
              className="w-full bg-white/20 text-white border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {POSE_LIST.map((pose) => (
                <option key={pose} value={pose} className="bg-gray-900">
                  {pose}
                </option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <h3 className="text-white font-semibold mb-3">How it works:</h3>
            <ul className="text-white/80 space-y-2 text-sm">
              <li>1️⃣ Allow camera access when prompted</li>
              <li>2️⃣ Select a yoga pose from the dropdown</li>
              <li>3️⃣ Click "Start Practice" and position yourself in frame</li>
              <li>4️⃣ Match the reference pose - skeleton turns green when correct</li>
              <li>5️⃣ Hold the pose as long as you can!</li>
            </ul>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            {!isInitialized && (
              <p className="text-yellow-400">⏳ Loading AI model...</p>
            )}
            {isInitialized && (
              <p className="text-green-400">✓ Ready to start</p>
            )}
          </div>

          {/* Start Button */}
          <button
            onClick={startYoga}
            disabled={!isInitialized}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isInitialized
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isInitialized ? 'Start Practice 🚀' : 'Loading...'}
          </button>

          {/* Footer */}
          <p className="text-white/40 text-xs text-center mt-6">
            Best viewed in Chrome. Camera access required.
          </p>
        </div>
      </div>
    </div>
  );
}