// app/yoga-session/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Camera, 
  Video, 
  CameraOff, 
  Maximize2,
  Minimize2,
  RotateCw,
  Play,
  Pause,
  CheckCircle,
  ArrowLeft,
  Info,
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";

const YogaSession = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPose, setCurrentPose] = useState<string>("Mountain Pose");
  const [timer, setTimer] = useState<number>(0);
  const [poseDuration, setPoseDuration] = useState<number>(30); // 30 seconds per pose
  const [sessionStarted, setSessionStarted] = useState(false);

  const yogaPoses = [
    { name: "Mountain Pose", duration: 30, instructions: "Stand tall, feet together, arms at sides" },
    { name: "Downward Dog", duration: 45, instructions: "Hands and feet on ground, hips high" },
    { name: "Warrior II", duration: 40, instructions: "Front knee bent, arms extended, gaze forward" },
    { name: "Tree Pose", duration: 35, instructions: "Stand on one leg, foot on inner thigh" },
    { name: "Child's Pose", duration: 60, instructions: "Kneel, sit back on heels, arms forward" },
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted && isRecording && timer < poseDuration) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted, isRecording, timer, poseDuration]);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleStartSession = () => {
    setSessionStarted(true);
    setIsRecording(true);
    setTimer(0);
  };

  const handlePauseSession = () => {
    setIsRecording(!isRecording);
  };

  const handleNextPose = () => {
    const currentIndex = yogaPoses.findIndex(pose => pose.name === currentPose);
    const nextIndex = (currentIndex + 1) % yogaPoses.length;
    setCurrentPose(yogaPoses[nextIndex].name);
    setPoseDuration(yogaPoses[nextIndex].duration);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">AI Yoga Session</h1>
                <p className="text-gray-400 text-sm">Real-time pose guidance and feedback</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-400">AI Assistant Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Camera Section - Takes 2/3 of screen */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Video Feed */}
              <div className="relative aspect-video bg-black">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <CameraOff className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-500">Camera is off</p>
                      <Button
                        onClick={() => setIsCameraOn(true)}
                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Enable Camera
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI Overlay Elements */}
                {isCameraOn && (
                  <>
                    {/* Pose Skeleton Overlay - Would be drawn by AI */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      {/* This is where AI would draw pose landmarks */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        {/* Simplified skeleton representation */}
                        <div className="w-24 h-24 border-2 border-green-400/50 rounded-full"></div>
                      </div>
                    </div>

                    {/* Pose Feedback */}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-4 max-w-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">Good Form!</span>
                      </div>
                      <p className="text-sm text-gray-300">Keep your back straight</p>
                    </div>

                    {/* Timer */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-2xl font-bold">{formatTime(timer)}</div>
                      <div className="text-sm text-gray-400">/ {formatTime(poseDuration)}</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(timer / poseDuration) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Camera Controls */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-4 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className="hover:bg-gray-800"
                  >
                    {isCameraOn ? (
                      <CameraOff className="w-5 h-5" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="hover:bg-gray-800"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="hover:bg-gray-800"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startCamera}
                    className="hover:bg-gray-800"
                  >
                    <RotateCw className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Session Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {!sessionStarted ? (
                <Button
                  onClick={handleStartSession}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-6 text-lg rounded-full"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Start Yoga Session
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handlePauseSession}
                    variant={isRecording ? "outline" : "default"}
                    className="px-8 py-6 text-lg rounded-full"
                  >
                    {isRecording ? (
                      <>
                        <Pause className="w-6 h-6 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-2" />
                        Resume
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleNextPose}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 px-8 py-6 text-lg rounded-full"
                  >
                    Next Pose
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Side Panel - Takes 1/3 of screen */}
          <div className="space-y-6">
            {/* Current Pose Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Current Pose</h2>
                  <p className="text-gray-400">Follow along with AI guidance</p>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">{currentPose}</div>
                <div className="text-gray-400">{formatTime(poseDuration)} hold</div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">Instructions:</span>
                </div>
                <p className="text-gray-300">
                  {yogaPoses.find(p => p.name === currentPose)?.instructions}
                </p>
              </div>
            </motion.div>

            {/* Pose Sequence */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
            >
              <h2 className="text-xl font-bold mb-4">Today's Sequence</h2>
              <div className="space-y-3">
                {yogaPoses.map((pose, index) => (
                  <div
                    key={pose.name}
                    className={`p-4 rounded-xl transition-all cursor-pointer ${
                      pose.name === currentPose
                        ? "bg-gradient-to-r from-purple-500/20 to-blue-600/20 border border-purple-500/30"
                        : "bg-gray-800/50 hover:bg-gray-800"
                    }`}
                    onClick={() => {
                      setCurrentPose(pose.name);
                      setPoseDuration(pose.duration);
                      setTimer(0);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          pose.name === currentPose
                            ? "bg-gradient-to-r from-purple-500 to-blue-600"
                            : "bg-gray-700"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{pose.name}</div>
                          <div className="text-sm text-gray-400">{formatTime(pose.duration)}</div>
                        </div>
                      </div>
                      {pose.name === currentPose && (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Feedback */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
            >
              <h2 className="text-xl font-bold mb-4">AI Feedback</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-medium">Good:</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✓ Posture alignment is correct</li>
                    <li>✓ Breathing pattern is steady</li>
                    <li>✓ Knees are properly aligned</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full border-2 border-yellow-400"></div>
                    <span className="font-medium text-yellow-400">Improve:</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Straighten your back slightly more</li>
                    <li>• Relax your shoulders</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Future Implementation Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-6 border border-purple-500/30"
        >
          <h3 className="text-lg font-bold mb-2">✨ Future AI Features (Coming Soon)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-800/30 rounded-xl p-4">
              <div className="font-medium mb-2">Real-time Pose Detection</div>
              <p className="text-sm text-gray-400">AI will track 33 body landmarks for precise feedback</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-4">
              <div className="font-medium mb-2">Multi-angle Analysis</div>
              <p className="text-sm text-gray-400">Compare your pose from multiple camera angles</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-4">
              <div className="font-medium mb-2">Personalized Sequences</div>
              <p className="text-sm text-gray-400">AI creates custom yoga flows based on your progress</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default YogaSession;