"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface YogaHeaderProps {
  isLoading: boolean;
  sessionStarted: boolean;
  modelSource: 'local' | 'cdn' | null;
}

const YogaHeader = ({ isLoading, sessionStarted, modelSource }: YogaHeaderProps) => {
  const router = useRouter();

  return (
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

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default YogaHeader;
