
"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import FeaturesSection from "../components/FeatureSection";

export default function Home() {
  const positions = [
    { top: "10%", left: "20%" },
    { top: "30%", left: "70%" },
    { top: "30%", left: "45%" },
    { top: "50%", left: "80%" },
    { top: "20%", left: "60%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden relative">
      {/* Floating Icons */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {["🧘", "✨", "🌿", "🌞", "🌙"].map((icon, i) => (
          <FloatingYogaIcon key={i} icon={icon} index={i} position={positions[i]} />
        ))}
      </div>

      {/* Page Content Wrapper */}
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Hero Section */}
        <section className="relative z-10 flex flex-col md:flex-row items-center justify-between min-h-screen py-12">
          {/* Text */}
          <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Transform Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">
                Yoga Practice
              </span>{" "}
              with AI
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-md mx-auto md:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Your personal AI yoga instructor, guiding you through poses,
              tracking your form, and helping you achieve mindfulness.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-purple-600 hover:to-blue-700 transform hover:-translate-y-1">
                Start Free Session
              </button>
              <button className="border-2 border-purple-500 text-purple-600 font-semibold py-3 px-8 rounded-full hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1">
                Learn More
              </button>
            </motion.div>
          </div>

          {/* Image */}
          <div className="md:w-1/2 relative">
            <motion.div
              className="relative w-full max-w-lg mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-blue-500 rounded-3xl blur-lg opacity-30 animate-pulse-slow"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src="/yogahero.png"
                    alt="AI Yoga Assistant demonstrating pose"
                    fill
                    className="rounded-2xl object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                </div>

                {/* AI Status */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full py-2 px-4 flex items-center gap-2 shadow-md">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">AI Active</span>
                </div>

                {/* Pose Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl py-2 px-4 shadow-md">
                  <p className="text-sm text-gray-500">Current Pose</p>
                  <p className="font-semibold text-gray-800">Downward Facing Dog</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Info Circles */}
            <motion.div
              className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:scale-110"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              whileHover={{ rotate: 5 }}
            >
              <span className="text-center text-sm font-semibold text-amber-600">
                Flexibility +32%
              </span>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:scale-110"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              whileHover={{ rotate: -5 }}
            >
              <span className="text-sm font-semibold text-center text-green-600">
                Balance Improved
              </span>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <FeaturesSection />
        </section>

        {/* Future Sections */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-center">More Coming Soon</h2>
        </section>
      </div>
    </div>
  );
}

// Floating Yoga Icon
const FloatingYogaIcon = ({ icon, position }) => (
  <motion.div
    className="absolute text-3xl opacity-80"
    style={position}
    animate={{
      y: [0, -15, 0],
      x: [0, 5, 0],
      rotate: [0, 5, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    whileHover={{
      scale: 1.5,
      rotate: 10,
      opacity: 2,
      transition: { duration: 0.3 },
    }}
  >
    {icon}
  </motion.div>
);
