"use client";

import { motion } from "framer-motion";
import { Camera, Info } from "lucide-react";
import { poseImages } from "@/app/utils/pose_images";

interface Pose {
  id: string;
  name: string;
  duration: number;
  instructions: string;
  benefits: string;
}

interface YogaSidebarProps {
  currentPose: Pose;
  formatTime: (seconds: number) => string;
  sessionStarted: boolean;
  YOGA_POSES: Pose[];
  currentPoseIndex: number;
  setCurrentPoseIndex: (index: number) => void;
  setTimer: (time: number) => void;
  setFlag: (flag: boolean) => void; // Passed as a function to setting ref
  setDetectedPose: (pose: string | null) => void;
  setIsPoseCorrect: (isCorrect: boolean) => void;
}

const YogaSidebar = ({
  currentPose,
  formatTime,
  sessionStarted,
  YOGA_POSES,
  currentPoseIndex,
  setCurrentPoseIndex,
  setTimer,
  setFlag,
  setDetectedPose,
  setIsPoseCorrect
}: YogaSidebarProps) => {
  return (
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
              className={`p-4 rounded-xl transition-all ${sessionStarted ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                } ${index === currentPoseIndex
                  ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-500/50 scale-105"
                  : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              onClick={() => {
                if (sessionStarted) {
                  setCurrentPoseIndex(index);
                  setTimer(0);
                  setFlag(false);
                  // Reset pose detection state for new pose
                  setDetectedPose(null);
                  setIsPoseCorrect(true);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === currentPoseIndex
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
  );
};

export default YogaSidebar;
