import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface PoseDetectionResult {
  pose: string;
  confidence: number;
  timestamp: string;
  message?: string;
}

interface UsePoseDetectionProps {
  onPoseDetected?: (result: PoseDetectionResult) => void;
  onError?: (error: string) => void;
}

export const usePoseDetection = ({ onPoseDetected, onError }: UsePoseDetectionProps = {}) => {
  const { getToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<PoseDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectPose = useCallback(async (imageBase64: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/detect-pose', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Detection failed');
      }

      const detectionResult: PoseDetectionResult = {
        pose: result.pose,
        confidence: result.confidence,
        timestamp: result.timestamp,
        message: result.message
      };

      setLastResult(detectionResult);
      onPoseDetected?.(detectionResult);
      
      return detectionResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [getToken, onPoseDetected, onError]);

  const captureFrameFromVideo = useCallback((videoElement: HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Function to get yoga sessions
  const getYogaSessions = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/yoga-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching yoga sessions:', error);
      return { sessions: [] };
    }
  }, [getToken]);

  // Function to get yoga stats
  const getYogaStats = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/yoga-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching yoga stats:', error);
      return null;
    }
  }, [getToken]);

  return {
    detectPose,
    captureFrameFromVideo,
    getYogaSessions,
    getYogaStats,
    isProcessing,
    lastResult,
    error,
    clearError: () => setError(null),
    clearResult: () => setLastResult(null),
  };
};

// Helper functions remain the same...
export const getPoseInstructions = (poseName: string): string => {
  const instructions: Record<string, string> = {
    'chair': 'Stand with feet together, bend knees as if sitting in a chair, keep back straight',
    'cobra': 'Lie on stomach, place hands under shoulders, lift chest while keeping hips on ground',
    'dog': 'Start on hands and knees, lift hips up and back, straighten legs and arms',
    'tree': 'Stand on one leg, place foot on inner thigh or calf, hands in prayer position',
    'warrior': 'Step feet wide apart, turn right foot out, bend right knee, arms extended at shoulder height',
  };
  return instructions[poseName.toLowerCase()] || 'Focus on your breath and alignment';
};

export const getPoseDuration = (poseName: string): number => {
  const durations: Record<string, number> = {
    'chair': 30,
    'cobra': 20,
    'dog': 45,
    'tree': 30,
    'warrior': 40,
  };
  return durations[poseName.toLowerCase()] || 30;
};