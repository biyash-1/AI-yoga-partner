"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import { 
  Camera, 
  CameraOff, 
  Maximize2,
  Minimize2,
  Play,
  Pause,
  CheckCircle,
  ArrowLeft,
  Info,
  AlertCircle,
  Trophy,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { poseImages } from "@/app/utils/pose_images";
import { useYogaSession } from "@/app/hooks/Useyogasession";

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
  
  // Pose Detection State
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [startingTime, setStartingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [modelSource, setModelSource] = useState<'local' | 'cdn' | null>(null);
  
  // AI Models
  const detectorRef = useRef<any>(null);
  const poseClassifierRef = useRef<any>(null);
  const detectionIntervalRef = useRef<any>(null);
  const flagRef = useRef(false);

  const currentPose = YOGA_POSES[currentPoseIndex];

  // Timer effect for pose duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted && isRecording && timer < currentPose.duration) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timer >= currentPose.duration) {
      handleNextPose();
    }
    return () => clearInterval(interval);
  }, [sessionStarted, isRecording, timer, currentPose.duration]);

  // Pose time tracking
  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000;
    if (flagRef.current) {
      setPoseTime(timeDiff);
    }
    if (timeDiff > bestPerform) {
      setBestPerform(timeDiff);
    }
  }, [currentTime, startingTime, bestPerform]);

  // Reset stats on pose change
  useEffect(() => {
    setCurrentTime(0);
    setPoseTime(0);
    setBestPerform(0);
    setTimer(0);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
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
    poseCenter = tf.expandDims(poseCenter, 1);
    poseCenter = tf.broadcastTo(poseCenter, [1, 17, 2]);
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
      
      console.log('✅ TensorFlow backend initialized:', tf.getBackend());
      console.log('✅ Available backends:', tf.engine().backendNames);
      
      setLoadingMessage("Loading MoveNet detector...");
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
      
      // Try to load your friend's custom model
      // Note: Local and CDN versions are the SAME model!
      // CDN is just a backup copy hosted online.
      let poseClassifier;
      try {
        console.log('📁 Attempting to load model from local files...');
        console.log('Path: /model/model.json');
        
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
        
        // Load the model
        poseClassifier = await tf.loadLayersModel('/model/model.json');
        console.log('✅ Successfully loaded local model!');
        console.log('📊 Model: Custom-trained yoga pose classifier');
        console.log('🎯 Classes: 7 yoga poses (Vrukshasana, Utkasana, etc.)');
        setModelSource('local');
        
      } catch (localError: any) {
        console.warn('⚠️ Local model files have an issue:', localError.message);
        console.log('');
        console.log('📡 Loading backup copy from CDN...');
        console.log('ℹ️  NOTE: CDN version is the SAME model, just hosted online');
        console.log('ℹ️  Your friend uploaded this model to the CDN originally');
        
        try {
          poseClassifier = await tf.loadLayersModel(
            'https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json'
          );
          console.log('✅ Successfully loaded model from CDN!');
          console.log('📊 Model: Same custom-trained yoga pose classifier');
          console.log('🎯 Classes: 7 yoga poses (Vrukshasana, Utkasana, etc.)');
          console.log('');
          console.log('💡 To fix local version: Copy fresh model files to public/model/');
          setModelSource('cdn');
        } catch (cdnError: any) {
          throw new Error(`Failed to load model from both local and CDN: ${cdnError.message}`);
        }
      }
      
      poseClassifierRef.current = poseClassifier;
      console.log('Model input shape:', poseClassifier.inputs[0].shape);
      console.log('Model output shape:', poseClassifier.outputs[0].shape);

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

  const detectPose = async () => {
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
        const classNo = CLASS_NO[currentPose.id];
        const acc = data[0][classNo] * 100;
        setAccuracy(Math.round(acc));

        if (data[0][classNo] > 0.95) {
          if (!flagRef.current) {
            setStartingTime(Date.now());
            flagRef.current = true;
          }
          setCurrentTime(Date.now());
          
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
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

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
    
    // Start pose detection loop
    detectionIntervalRef.current = setInterval(() => {
      detectPose();
    }, 100);
  };

  const handlePauseSession = () => {
    setIsRecording(!isRecording);
  };

  const handleNextPose = () => {
    // Save current pose data before moving to next
    if (poseTime > 0) {
      const poseData = {
        poseName: currentPose.name.split('(')[0].trim(),
        duration: Math.round(poseTime), // seconds
        accuracy: accuracy,
        bestHold: Math.round(bestPerform) // seconds
      };
      sessionDataRef.current.posesData.push(poseData);
      console.log('Saved pose data:', poseData);
    }
    
    const nextIndex = (currentPoseIndex + 1) % YOGA_POSES.length;
    setCurrentPoseIndex(nextIndex);
    flagRef.current = false;
  };

  const handleStopSession = async () => {
    // Save last pose data if any
    if (poseTime > 0) {
      const lastPoseData = {
        poseName: currentPose.name.split('(')[0].trim(),
        duration: Math.round(poseTime),
        accuracy: accuracy,
        bestHold: Math.round(bestPerform)
      };
      sessionDataRef.current.posesData.push(lastPoseData);
    }
    
    // Calculate session duration in minutes
    const sessionStart = sessionDataRef.current.startTime;
    const sessionEnd = new Date();
    const durationMinutes = sessionStart 
      ? Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 60000)
      : 0;
    
    // Calculate average accuracy
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
        
        console.log('✅ Session saved successfully!');
      } catch (error) {
        console.error('❌ Failed to save session:', error);
      }
    }
    
    // Cleanup
    setSessionStarted(false);
    setIsRecording(false);
    setIsCameraOn(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="hover:bg-white/10 text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Yoga Session
                </h1>
                <p className="text-gray-400 text-sm">Real-time pose detection & guidance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">AI Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium text-sm">
                    {isLoading ? "Loading..." : sessionStarted ? "Active" : "Ready"}
                  </span>
                </div>
              </div>
              
              {modelSource && (
                <div className={`px-4 py-2 rounded-xl text-xs font-medium ${
                  modelSource === 'local' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {modelSource === 'local' 
                    ? '🎯 Custom Model (Local)' 
                    : '🎯 Custom Model (CDN Backup)'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                    {/* Accuracy Badge */}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        {accuracy >= 95 ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : accuracy >= 70 ? (
                          <AlertCircle className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <Info className="w-6 h-6 text-blue-400" />
                        )}
                        <div>
                          <div className="text-xs text-gray-400">Accuracy</div>
                          <div className="text-2xl font-bold">{accuracy}%</div>
                        </div>
                      </div>
                      {accuracy >= 95 && (
                        <p className="text-xs text-green-400 mt-2">Perfect form! 🎉</p>
                      )}
                    </div>

                    {/* Timer */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      <div className="text-xs text-gray-400 mb-1">Time</div>
                      <div className="text-3xl font-bold">{formatTime(timer)}</div>
                      <div className="text-xs text-gray-400">/ {formatTime(currentPose.duration)}</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(timer / currentPose.duration) * 100}%` }}
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

            {/* Session Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {!sessionStarted ? (
                <Button
                  onClick={handleStartSession}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-10 py-7 text-lg rounded-full shadow-lg shadow-green-500/50 transition-all hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Yoga Session
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handlePauseSession}
                    className="bg-white/10 hover:bg-white/20 px-8 py-6 text-lg rounded-full border border-white/20"
                  >
                    {isRecording ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Resume
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleNextPose}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/50"
                  >
                    Next Pose
                  </Button>

                  <Button
                    onClick={handleStopSession}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 px-8 py-6 text-lg rounded-full"
                  >
                    End Session
                  </Button>
                </>
              )}
            </div>

            {/* Stats Cards */}
            {sessionStarted && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30"
                >
                  <Timer className="w-5 h-5 text-purple-400 mb-2" />
                  <div className="text-sm text-gray-400">Pose Time</div>
                  <div className="text-2xl font-bold">{poseTime.toFixed(1)}s</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30"
                >
                  <Trophy className="w-5 h-5 text-green-400 mb-2" />
                  <div className="text-sm text-gray-400">Best Hold</div>
                  <div className="text-2xl font-bold">{bestPerform.toFixed(1)}s</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30"
                >
                  <CheckCircle className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-sm text-gray-400">Progress</div>
                  <div className="text-2xl font-bold">{currentPoseIndex + 1}/{YOGA_POSES.length}</div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Current Pose Card with Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Current Pose</h2>
                  <p className="text-gray-400 text-sm">Follow the guidance</p>
                </div>
              </div>
              
              {/* Pose Image */}
              <div className="relative mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10">
                <div className="aspect-square relative">
                  <img 
                    src={poseImages[currentPose.id as keyof typeof poseImages]}
                    alt={currentPose.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      // Fallback to a placeholder if image doesn't exist
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23a78bfa" opacity="0.2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="16" font-family="Arial">Pose Image</text></svg>';
                    }}
                  />
                </div>
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-purple-300">Reference</span>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {currentPose.name}
                </div>
                <div className="text-gray-400 text-sm">{formatTime(currentPose.duration)} hold time</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-sm">Instructions</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {currentPose.instructions}
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Benefits:</div>
                  <p className="text-sm text-purple-300">{currentPose.benefits}</p>
                </div>
              </div>
            </motion.div>

            {/* Pose Sequence */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm rounded-3xl p-6 border border-white/10"
            >
              <h2 className="text-xl font-bold mb-4">Today's Sequence</h2>
              <div className="space-y-2">
                {YOGA_POSES.map((pose, index) => (
                  <div
                    key={pose.id}
                    className={`p-4 rounded-xl transition-all ${
                      sessionStarted ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${
                      index === currentPoseIndex
                        ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-500/50 scale-105"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                    }`}
                    onClick={() => {
                      setCurrentPoseIndex(index);
                      setTimer(0);
                      flagRef.current = false;
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === currentPoseIndex
                            ? "bg-gradient-to-r from-purple-500 to-blue-600"
                            : "bg-white/10"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{pose.name.split('(')[0].trim()}</div>
                          <div className="text-xs text-gray-400">{formatTime(pose.duration)}</div>
                        </div>
                      </div>
                      {index === currentPoseIndex && sessionStarted && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400">Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YogaSession;