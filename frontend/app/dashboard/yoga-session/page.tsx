"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import {
  CameraOff,
  Maximize2,
  Minimize2,
  AlertCircle,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useYogaSession } from "@/app/hooks/Useyogasession";
import YogaHeader from "@/components/yoga/YogaHeader";
import StatsCards from "@/components/yoga/StatsCards";
import YogaSidebar from "@/components/yoga/YogaSidebar";
import SessionControls from "@/components/yoga/SessionControls";

// Yoga poses configuration - Using exact poses from original React app
const YOGA_POSES = [
  {
    id: 'Vrukshasana',
    name: 'Tree Pose (Vrukshasana)',
    duration: 30,
    instructions: 'Stand on one leg, place other foot on inner thigh, hands in prayer position',
    benefits: 'Improves balance and focus'
  },
  {
    id: 'Utkasana',
    name: 'Chair Pose (Utkasana)',
    duration: 30,
    instructions: 'Squat with arms raised overhead, back straight',
    benefits: 'Strengthens legs and core'
  },
  {
    id: 'Bhujangasana',
    name: 'Cobra Pose (Bhujangasana)',
    duration: 25,
    instructions: 'Lie face down, lift chest using arms, look up',
    benefits: 'Strengthens spine and opens chest'
  },
  {
    id: 'Veerabhadrasana',
    name: 'Warrior Pose (Veerabhadrasana)',
    duration: 35,
    instructions: 'Front knee bent at 90°, back leg straight, arms extended',
    benefits: 'Builds strength and stamina'
  },
  {
    id: 'Adhomukasana',
    name: 'Downward Dog (Adhomukasana)',
    duration: 30,
    instructions: 'Inverted V-shape, hands and feet on ground, hips high',
    benefits: 'Stretches entire body'
  },
  {
    id: 'Sarvangasana',
    name: 'Shoulder Stand (Sarvangasana)',
    duration: 30,
    instructions: 'Lie on back, lift legs and hips up, support with hands',
    benefits: 'Improves blood circulation'
  },
  {
    id: 'Trikonasana',
    name: 'Triangle Pose (Trikonasana)',
    duration: 30,
    instructions: 'Wide stance, reach down to ankle, other arm up',
    benefits: 'Stretches sides and improves flexibility'
  },
];

const CLASS_NO: Record<string, number> = {
  Utkasana: 0,
  Bhujangasana: 1,
  Adhomukasana: 2,
  No_Pose: 3,
  Sarvangasana: 4,
  Trikonasana: 5,
  Vrukshasana: 6,
  Veerabhadrasana: 7,
};

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

const keypointConnections: Record<string, string[]> = {
  nose: ['left_eye', 'right_eye'],
  left_eye: ['left_ear'],
  right_eye: ['right_ear'],
  left_shoulder: ['right_shoulder', 'left_elbow', 'left_hip'],
  right_shoulder: ['right_elbow', 'right_hip'],
  left_elbow: ['left_wrist'],
  right_elbow: ['right_wrist'],
  left_hip: ['right_hip', 'left_knee'],
  right_hip: ['right_knee'],
  left_knee: ['left_ankle'],
  right_knee: ['right_ankle'],
};

const YogaSession = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Session tracking hook
  const { saveSession, isSaving } = useYogaSession();

  // Session data tracking
  const sessionDataRef = useRef({
    startTime: null as Date | null,
    posesData: [] as Array<{
      poseName: string;
      duration: number;
      accuracy: number;
      bestHold: number;
    }>
  });

  // UI State
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pose Detection State
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [startingTime, setStartingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [modelSource, setModelSource] = useState<'local' | 'cdn' | null>(null);
  const [detectedPose, setDetectedPose] = useState<string | null>(null);
  const [isPoseCorrect, setIsPoseCorrect] = useState(true);

  // Accumulators for accurate metrics per pose
  const [poseAccuracySum, setPoseAccuracySum] = useState(0);
  const [poseAccuracyCount, setPoseAccuracyCount] = useState(0);
  const [accumulatedPoseTime, setAccumulatedPoseTime] = useState(0);
  const lastActiveTimeRef = useRef<number | null>(null);

  // AI Models
  const detectorRef = useRef<any>(null);
  const poseClassifierRef = useRef<any>(null);
  const detectionIntervalRef = useRef<any>(null);
  const flagRef = useRef(false);
  const hasPlayedHoldSoundRef = useRef(false);

  const currentPose = YOGA_POSES[currentPoseIndex];

  // Timer effect for pose duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted && isRecording) {
      // Keep timer running continuously, don't auto-advance poses
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted, isRecording]);

  // Pose time tracking
  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000;
    if (flagRef.current) {
      setPoseTime(timeDiff);
    }
    // Update best perform with accumulated time for the current pose session
    if (poseTime > bestPerform) {
      setBestPerform(poseTime);
    }
  }, [currentTime, startingTime, bestPerform, poseTime]);

  // Reset stats on pose change
  useEffect(() => {
    setCurrentTime(0);
    setPoseTime(0);
    setBestPerform(0);
    setTimer(0);
    setAccumulatedPoseTime(0);
    setPoseAccuracySum(0);
    setPoseAccuracyCount(0);
    lastActiveTimeRef.current = null;
  }, [currentPoseIndex]);

  // Camera setup
  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraOn]);

  // Initialize audio on mount
  useEffect(() => {
    // Try to detect which file exists
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const checkAudio = async () => {
      const possiblePaths = ["/hold_pose.wav", "/count.wav"];
      let foundPath = null;

      for (const path of possiblePaths) {
        try {
          const response = await fetch(path, { method: 'HEAD' });
          if (response.ok) {
            foundPath = path;
            break;
          }
        } catch (e) {
          console.warn(`Error checking ${path}:`, e);
        }
      }

      if (foundPath) {
        console.log(`✅ Audio file found at ${foundPath}`);
        if (audioRef.current) {
          audioRef.current.src = foundPath;
          audioRef.current.loop = true; // Enable looping for continuous feedback
          audioRef.current.load();
        }
      } else {
        console.warn("⚠️ No audio file found (tried /hold_pose.wav and /count.wav). Please ensure the file is in the public folder.");
      }
    };
    checkAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);



  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to use this feature");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Pose detection helper functions
  const getCenterPoint = (landmarks: any, leftBodypart: number, rightBodypart: number) => {
    const left = tf.gather(landmarks, leftBodypart, 1);
    const right = tf.gather(landmarks, rightBodypart, 1);
    return tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
  };

  const getPoseSize = (landmarks: any, torsoSizeMultiplier = 2.5) => {
    const hipsCenter = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
    const shouldersCenter = getCenterPoint(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER);
    const torsoSize = tf.norm(tf.sub(shouldersCenter, hipsCenter));

    let poseCenterNew = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
    poseCenterNew = tf.expandDims(poseCenterNew, 1);
    poseCenterNew = tf.broadcastTo(poseCenterNew, [1, 17, 2]);

    const d = tf.gather(tf.sub(landmarks, poseCenterNew), 0, 0);
    const maxDist = tf.max(tf.norm(d, 'euclidean', 0));

    return tf.maximum(tf.mul(torsoSize, torsoSizeMultiplier), maxDist);
  };

  const normalizePoseLandmarks = (landmarks: any) => {

    let poseCenter = getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
    //  finds the midpoint between left and right hip
    poseCenter = tf.expandDims(poseCenter, 1);
    poseCenter = tf.broadcastTo(poseCenter, [1, 17, 2]);
    // stretches that center point to match all 17 keypoints
    landmarks = tf.sub(landmarks, poseCenter);

    const poseSize = getPoseSize(landmarks);
    return tf.div(landmarks, poseSize);
  };

  const landmarksToEmbedding = (landmarks: any) => {
    const normalized = normalizePoseLandmarks(tf.expandDims(landmarks, 0));
    return tf.reshape(normalized, [1, 34]);
  };

  const drawPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawSegment = (ctx: CanvasRenderingContext2D, point1: number[], point2: number[], color: string) => {
    ctx.beginPath();
    ctx.moveTo(point1[0], point1[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const loadModels = async () => {
    setIsLoading(true);
    try {
      // Initialize TensorFlow backend first
      setLoadingMessage("Initializing TensorFlow...");

      // Set backend to WebGL explicitly
      await tf.setBackend('webgl');
      await tf.ready();



      setLoadingMessage("Loading");
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
      };
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      detectorRef.current = detector;
      console.log('✅ MoveNet loaded');

      setLoadingMessage("Loading pose classifier...");

      let poseClassifier;
      try {
        console.log('📁 Attempting to load model from local files...');

        // Verify files exist
        const modelJsonResponse = await fetch('/model/model.json');
        if (!modelJsonResponse.ok) {
          throw new Error(`model.json not accessible (${modelJsonResponse.status})`);
        }

        const binResponse = await fetch('/model/group1-shard1of1.bin');
        if (!binResponse.ok) {
          throw new Error(`model weights file not accessible (${binResponse.status})`);
        }

        const binSize = binResponse.headers.get('content-length');
        console.log(`✅ Model files found (weights: ${binSize} bytes)`);


        poseClassifier = await tf.loadLayersModel('/model/model.json');
        console.log('✅ Successfully loaded local model!');
        console.log('📊 Model: Custom-trained yoga pose classifier');
        console.log('🎯 Classes: 7 yoga poses (Vrukshasana, Utkasana, etc.)');
        setModelSource('local');

      } catch (localError: any) {
        console.warn('⚠️ Local model files have an issue:', localError.message);

        try {
          poseClassifier = await tf.loadLayersModel(
            'https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json'
          );

          setModelSource('cdn');
        } catch (cdnError: any) {
          throw new Error(`Failed to load model from both local and CDN: ${cdnError.message}`);
        }
      }

      poseClassifierRef.current = poseClassifier;


      setIsLoading(false);
      setLoadingMessage("");
    } catch (error: any) {
      console.error('❌ Error loading models:', error);
      console.error('Error details:', error.message);
      setIsLoading(false);
      setLoadingMessage("");
      alert(`Failed to load AI models: ${error.message}\n\nCheck browser console for details`);
    }
  };

  const detectPose = useCallback(async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !detectorRef.current ||
      !poseClassifierRef.current ||
      videoRef.current.readyState !== 4
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (poses && poses.length > 0) {
        const keypoints = poses[0].keypoints;
        let notDetected = 0;
        let skeletonColor = 'rgb(255,255,255)';

        const input = keypoints.map((keypoint: any) => {
          if (keypoint.score > 0.4) {
            if (keypoint.name !== 'left_eye' && keypoint.name !== 'right_eye') {
              drawPoint(ctx, keypoint.x, keypoint.y, 6, 'rgb(255,255,255)');

              const connections = keypointConnections[keypoint.name];
              if (connections) {
                connections.forEach((connection) => {
                  const connectedPoint = keypoints.find((kp: any) => kp.name === connection);
                  if (connectedPoint && connectedPoint.score > 0.4) {
                    drawSegment(
                      ctx,
                      [keypoint.x, keypoint.y],
                      [connectedPoint.x, connectedPoint.y],
                      skeletonColor
                    );
                  }
                });
              }
            }
          } else {
            notDetected++;
          }
          return [keypoint.x, keypoint.y];
        });

        if (notDetected > 4) {
          return;
        }

        const processedInput = landmarksToEmbedding(input);
        const classification = poseClassifierRef.current.predict(processedInput);

        const data = await classification.array();
        const predictions = data[0];

        // Find which pose the model detected with highest confidence
        const detectedPoseIndex = predictions.indexOf(Math.max(...predictions));
        const detectedPoseConfidence = predictions[detectedPoseIndex];

        // Find the name of the detected pose
        const detectedPoseName = Object.keys(CLASS_NO).find(
          key => CLASS_NO[key] === detectedPoseIndex
        );

        // Get the expected pose class
        const expectedPoseIndex = CLASS_NO[currentPose.id];

        // DIAGNOSTIC LOGGING - Remove after debugging


        // Check if detected pose matches expected pose
        if (detectedPoseIndex === expectedPoseIndex) {
          // Correct pose - show actual confidence
          const acc = predictions[expectedPoseIndex] * 100;
          setAccuracy(acc);
          setIsPoseCorrect(true);
          setDetectedPose(null);
          console.log(' CORRECT POSE - Showing accuracy:', acc.toFixed(2) + '%');
        } else if (detectedPoseConfidence > 0.7) {
          // Wrong pose with high confidence
          setAccuracy(0);
          setIsPoseCorrect(false);
          setDetectedPose(detectedPoseName || 'Unknown');

        } else {
          // Not confident about any pose - show expected pose confidence
          const acc = predictions[expectedPoseIndex] * 100;
          setAccuracy(acc); // No rounding here
          setIsPoseCorrect(true);
          setDetectedPose(null);
          console.log(' LOW CONFIDENCE - Showing expected pose confidence:', acc.toFixed(2) + '%');
        }

        if (predictions[expectedPoseIndex] > 0.95 && detectedPoseIndex === expectedPoseIndex) {
          const now = Date.now();
          if (!flagRef.current) {
            setStartingTime(now);
            flagRef.current = true;
          }
          setCurrentTime(now);

          // Track accumulated time and accuracy
          if (lastActiveTimeRef.current) {
            const delta = (now - lastActiveTimeRef.current) / 1000;
            setAccumulatedPoseTime(prev => prev + delta);
          }
          lastActiveTimeRef.current = now;

          const currentAcc = predictions[expectedPoseIndex] * 100;
          setPoseAccuracySum(prev => prev + currentAcc);
          setPoseAccuracyCount(prev => prev + 1);

          // Continuous sound feedback: play while accurate, stop otherwise
          if (audioRef.current && audioRef.current.src) {
            if (audioRef.current.paused) {
              console.log('🎵 Starting continuous hold sound... (Accuracy: ' + Math.round(currentAcc) + '%)');
              audioRef.current.play()
                .catch(e => {
                  if (e.name === 'NotAllowedError') {
                    console.warn(" Browser blocked autoplay. Please click anywhere on the page first.");
                  } else {
                    console.error(" Audio playback failed:", e.message);
                  }
                });
            }
          }

          // Draw green skeleton when pose is correct
          keypoints.forEach((keypoint: any) => {
            if (keypoint.score > 0.4 && keypoint.name !== 'left_eye' && keypoint.name !== 'right_eye') {
              const connections = keypointConnections[keypoint.name];
              if (connections) {
                connections.forEach((connection) => {
                  const connectedPoint = keypoints.find((kp: any) => kp.name === connection);
                  if (connectedPoint && connectedPoint.score > 0.4) {
                    drawSegment(
                      ctx,
                      [keypoint.x, keypoint.y],
                      [connectedPoint.x, connectedPoint.y],
                      'rgb(0,255,0)'
                    );
                  }
                });
              }
            }
          });
        } else {
          flagRef.current = false;
          lastActiveTimeRef.current = null;

          // Stop sound when accuracy drops or pose is lost
          if (audioRef.current && !audioRef.current.paused) {
            console.log(' Stopping hold sound (Accuracy dropped)');
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, [currentPose]);

  // Manage pose detection interval
  useEffect(() => {
    if (sessionStarted && isRecording) {
      console.log(' Starting pose detection interval for:', currentPose.id);
      const interval = setInterval(() => {
        detectPose();
      }, 100);
      return () => {
        console.log('🧹 Clearing pose detection interval for:', currentPose.id);
        clearInterval(interval);
      };
    }
  }, [sessionStarted, isRecording, detectPose, currentPose.id]);

  const handleStartSession = async () => {
    if (!detectorRef.current || !poseClassifierRef.current) {
      await loadModels();
    }

    setIsCameraOn(true);
    setSessionStarted(true);
    setIsRecording(true);
    setTimer(0);

    // Track session start
    sessionDataRef.current.startTime = new Date();
    sessionDataRef.current.posesData = [];
  };

  const handlePauseSession = () => {
    setIsRecording(!isRecording);
  };

  const handleNextPose = () => {

    if (accumulatedPoseTime > 0) {
      const avgPoseAccuracy = poseAccuracyCount > 0
        ? Math.round(poseAccuracySum / poseAccuracyCount)
        : accuracy;

      const poseData = {
        poseName: currentPose.name.split('(')[0].trim(),
        duration: Math.round(accumulatedPoseTime), // total seconds spent in pose
        accuracy: avgPoseAccuracy,
        bestHold: Math.round(bestPerform) // seconds
      };
      sessionDataRef.current.posesData.push(poseData);
      console.log('Saved pose data:', poseData);
    }

    const nextIndex = (currentPoseIndex + 1) % YOGA_POSES.length;
    setCurrentPoseIndex(nextIndex);
    flagRef.current = false;
    lastActiveTimeRef.current = null;

    // Reset pose detection state for new pose
    setDetectedPose(null);
    setIsPoseCorrect(true);
  };

  const handleStopSession = async () => {

    if (accumulatedPoseTime > 0) {
      const avgPoseAccuracy = poseAccuracyCount > 0
        ? Math.round(poseAccuracySum / poseAccuracyCount)
        : accuracy;

      const lastPoseData = {
        poseName: currentPose.name.split('(')[0].trim(),
        duration: Math.round(accumulatedPoseTime),
        accuracy: avgPoseAccuracy,
        bestHold: Math.round(bestPerform)
      };
      sessionDataRef.current.posesData.push(lastPoseData);
    }

    // Calculate session duration in minutes based on time spent in poses
    const totalSecondsSpent = sessionDataRef.current.posesData.reduce((sum, p) => sum + p.duration, 0);
    const durationMinutes = Math.max(1, Math.round(totalSecondsSpent / 60));

    // Calculate average accuracy across all poses
    const avgAccuracy = sessionDataRef.current.posesData.length > 0
      ? Math.round(
        sessionDataRef.current.posesData.reduce((sum, p) => sum + p.accuracy, 0) /
        sessionDataRef.current.posesData.length
      )
      : 0;

    // Save to database
    if (sessionDataRef.current.posesData.length > 0 && durationMinutes > 0) {
      try {
        console.log('Saving session to database...', {
          duration: durationMinutes,
          poses: sessionDataRef.current.posesData.length,
          avgAccuracy
        });

        await saveSession({
          duration: durationMinutes,
          posesCompleted: sessionDataRef.current.posesData,
          totalPoses: sessionDataRef.current.posesData.length,
          averageAccuracy: avgAccuracy
        });

        console.log(' Session saved successfully!');
      } catch (error) {
        console.error(' Failed to save session:', error);
      }
    }

    // Cleanup
    setSessionStarted(false);
    setIsRecording(false);
    setIsCameraOn(false);

    // Reset session data
    sessionDataRef.current = {
      startTime: null,
      posesData: []
    };
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setFlagCallback = (flag: boolean) => {
    flagRef.current = flag;
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white">
      <YogaHeader
        isLoading={isLoading}
        sessionStarted={sessionStarted}
        modelSource={modelSource}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-8 border border-white/20 max-w-md">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-xl font-bold">Loading AI Models...</h3>
              <p className="text-gray-300 text-center">{loadingMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Camera Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-black/40 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              {/* Video Feed */}
              <div className="relative aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                {isCameraOn ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      width={640}
                      height={480}
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={480}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <CameraOff className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 mb-4">Camera is off</p>
                    </div>
                  </div>
                )}

                {/* Overlay Stats */}
                {isCameraOn && sessionStarted && (
                  <>
                    {/* Pose Time Badge */}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        <Timer className="w-6 h-6 text-purple-400" />
                        <div>
                          <div className="text-xs text-gray-400">Pose Time</div>
                          <div className="text-2xl font-bold">{Math.round(accumulatedPoseTime)}s</div>
                        </div>
                      </div>
                    </div>

                    {/* Accuracy Badge */}
                    <div className="absolute top-4 left-44 bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${accuracy >= 95 ? 'bg-green-500/20 text-green-400'
                          : accuracy >= 70 ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                          }`}>
                          {/* Replaced Icon logic with just color coding for cleaner code or use new icon component if needed */}
                          {accuracy >= 95 ? "🌟" : accuracy >= 70 ? "⚠️" : "ℹ️"}
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Accuracy</div>
                          <div className="text-2xl font-bold">{accuracy.toFixed(2)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Wrong Pose Warning */}
                    {!isPoseCorrect && detectedPose && (
                      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-900/90 backdrop-blur-md rounded-xl px-6 py-3 border border-red-500/50 max-w-xs">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <div>
                            <div className="text-sm font-medium text-red-200">Wrong Pose Detected</div>
                            <div className="text-xs text-red-300">
                              Detected: {detectedPose}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timer */}
                    <div className={`absolute top-4 right-4 backdrop-blur-md rounded-2xl p-4 border ${timer > currentPose.duration
                      ? 'bg-yellow-900/70 border-yellow-500/30'
                      : 'bg-black/70 border-white/20'
                      }`}>
                      <div className="text-xs text-gray-400 mb-1">Time</div>
                      <div className={`text-3xl font-bold ${timer > currentPose.duration ? 'text-yellow-400' : ''
                        }`}>
                        {formatTime(timer)}
                      </div>
                      <div className="text-xs text-gray-400">
                        / {formatTime(currentPose.duration)}
                        {timer > currentPose.duration && (
                          <span className="text-yellow-400 ml-1">⏱️ Overtime</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10">
                      <motion.div
                        className={`h-full ${timer > currentPose.duration
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min((timer / currentPose.duration) * 100, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Camera Controls */}
              {isCameraOn && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsCameraOn(false);
                        handleStopSession();
                      }}
                      className="hover:bg-white/20 text-white rounded-full"
                    >
                      <CameraOff className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="hover:bg-white/20 text-white rounded-full"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>

            <SessionControls
              sessionStarted={sessionStarted}
              isRecording={isRecording}
              isLoading={isLoading}
              handleStartSession={handleStartSession}
              handlePauseSession={handlePauseSession}
              handleNextPose={handleNextPose}
              handleStopSession={handleStopSession}
            />

            {sessionStarted && (
              <StatsCards
                poseTime={poseTime}
                bestPerform={bestPerform}
                currentPoseIndex={currentPoseIndex}
                totalPoses={YOGA_POSES.length}
              />
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10 h-fit">
            <YogaSidebar
              currentPose={currentPose}
              formatTime={formatTime}
              sessionStarted={sessionStarted}
              YOGA_POSES={YOGA_POSES}
              currentPoseIndex={currentPoseIndex}
              setCurrentPoseIndex={setCurrentPoseIndex}
              setTimer={setTimer}
              setFlag={setFlagCallback}
              setDetectedPose={setDetectedPose}
              setIsPoseCorrect={setIsPoseCorrect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default YogaSession;