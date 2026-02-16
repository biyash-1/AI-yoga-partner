"use client";

import { motion } from "framer-motion";
import { Timer, Trophy, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  poseTime: number;
  bestPerform: number;
  currentPoseIndex: number;
  totalPoses: number;
}

const StatsCards = ({ poseTime, bestPerform, currentPoseIndex, totalPoses }: StatsCardsProps) => {
  return (
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
        <div className="text-2xl font-bold">{currentPoseIndex + 1}/{totalPoses}</div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
