"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface SessionControlsProps {
  sessionStarted: boolean;
  isRecording: boolean;
  isLoading: boolean;
  handleStartSession: () => void;
  handlePauseSession: () => void;
  handleNextPose: () => void;
  handleStopSession: () => void;
}

const SessionControls = ({
  sessionStarted,
  isRecording,
  isLoading,
  handleStartSession,
  handlePauseSession,
  handleNextPose,
  handleStopSession
}: SessionControlsProps) => {
  return (
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
  );
};

export default SessionControls;
