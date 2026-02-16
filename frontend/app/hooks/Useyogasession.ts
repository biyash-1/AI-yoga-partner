
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';

interface PoseData {
  poseName: string;
  duration: number; 
  accuracy: number; 
  bestHold: number; 
}

interface SessionData {
  duration: number; 
  posesCompleted: PoseData[];
  totalPoses: number;
  averageAccuracy: number;
}

export const useYogaSession = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { getToken } = useAuth();

  const saveSession = async (sessionData: SessionData) => {
    setIsSaving(true);
    try {
      const token = await getToken();

      const response = await fetch('http://localhost:5000/api/yoga/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      const data = await response.json();
      toast.success('Yoga session saved! 🧘‍♀️');
      return data;

    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const getSessionHistory = async (limit = 10) => {
    try {
      const token = await getToken();

      const response = await fetch(
        `http://localhost:5000/api/yoga/session-history?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session history');
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching session history:', error);
      throw error;
    }
  };

  const getAnalytics = async () => {
    try {
      const token = await getToken();

      const response = await fetch('http://localhost:5000/api/yoga/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  };

  return {
    saveSession,
    getSessionHistory,
    getAnalytics,
    isSaving,
  };
};