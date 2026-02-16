"use client";
import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Target, Heart, Zap, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [timePerDay, setTimePerDay] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const goalOptions = [
    {
      id: "flexibility",
      label: "Improve Flexibility",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: "stress",
      label: "Reduce Stress",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: "strength",
      label: "Build Strength",
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: "balance",
      label: "Better Balance",
      icon: <Check className="w-5 h-5" />,
    },
    {
      id: "meditation",
      label: "Meditation Practice",
      icon: <Heart className="w-5 h-5" />,
    },
  ];

  const experienceOptions = [
    { id: "beginner", label: "Beginner", description: "New to yoga" },
    {
      id: "intermediate",
      label: "Intermediate",
      description: "Some experience",
    },
    { id: "advanced", label: "Advanced", description: "Regular practitioner" },
  ];

  const timeOptions = [
    { id: "15-30", label: "15-30 minutes" },
    { id: "30-45", label: "30-45 minutes" },
    { id: "45-60", label: "45-60 minutes" },
  ];

  const handleGoalToggle = (goalId: string) => {
    setGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const canProceedToStep2 = goals.length > 0;
  const canProceedToStep3 = experience !== "" && timePerDay !== "";

  const handleSubmit = async () => {
    if (!canProceedToStep3) {
      toast.error("Please complete all fields");
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      console.log("Auth Token:", token);
      if (!token) {
  toast.error("Authentication failed. Please sign in again.");
  return;
}

      const response = await fetch(
        "http://localhost:5000/api/save-onboarding",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            goals,
            experience,
            timePerDay,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome to AI Yoga! 🎉");
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast.error("Failed to save your preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to AI Yoga, {user?.firstName}! 🧘‍♀️
              </h1>
              <p className="text-gray-600 mb-8">
                Let's personalize your yoga journey. This will only take 2
                minutes.
              </p>
              <button
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-full hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </motion.div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What are your goals?
              </h2>
              <p className="text-gray-600 mb-8">Select all that apply</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {goalOptions.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center ${
                      goals.includes(goal.id)
                        ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="mb-2">{goal.icon}</div>
                    <span className="font-medium text-sm text-center">
                      {goal.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 font-medium hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedToStep2}
                  className={`font-semibold py-2 px-6 rounded-full transition-all duration-300 ${
                    canProceedToStep2
                      ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Experience & Time */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Almost done!
              </h2>

              <div className="space-y-6 mb-8">
                {/* Experience Level */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    What's your yoga experience?
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {experienceOptions.map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => setExperience(exp.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                          experience === exp.id
                            ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="font-medium">{exp.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {exp.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Commitment */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    How much time can you commit daily?
                  </h3>
                  <div className="flex gap-3">
                    {timeOptions.map((time) => (
                      <button
                        key={time.id}
                        onClick={() => setTimePerDay(time.id)}
                        className={`flex-1 py-3 rounded-lg border-2 transition-all duration-300 ${
                          timePerDay === time.id
                            ? "border-purple-500 bg-purple-50 text-purple-700 font-medium shadow-md"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="text-gray-600 font-medium hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canProceedToStep3 || isLoading}
                  className={`font-semibold py-3 px-8 rounded-full transition-all duration-300 flex items-center gap-2 ${
                    canProceedToStep3 && !isLoading
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
