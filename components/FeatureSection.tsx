"use client";
import { motion } from "framer-motion";

const FeaturesSection = () => {
  const features = [
    {
      title: "Real-Time Pose Correction",
      description: "Our AI instantly analyzes your form and provides corrective feedback to perfect your alignment.",
      icon: "🧘",
      color: "from-purple-500 to-blue-600",
    },
    {
      title: "Personalized Yoga Sequences",
      description: "Get custom routines tailored to your flexibility level, goals, and available time.",
      icon: "✨",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Progress Tracking",
      description: "Monitor your flexibility, balance, and strength improvements with detailed analytics.",
      icon: "📊",
      color: "from-green-500 to-teal-600",
    },
    {
      title: "Mindfulness Guidance",
      description: "Incorporates meditation and breathing exercises for complete mind-body wellness.",
      icon: "🌿",
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Adaptive Difficulty",
      description: "The AI automatically adjusts poses based on your current ability and progress.",
      icon: "⚡",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Community Challenges",
      description: "Join group sessions and challenges to stay motivated and connected with others.",
      icon: "👥",
      color: "from-pink-500 to-rose-600",
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const hoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <section className="relative py-20 overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-200 rounded-full opacity-30 blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Powerful Features for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">Yoga Journey</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how our AI-powered platform transforms your practice with cutting-edge technology and ancient wisdom.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative group"
              variants={itemVariants}
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md`}></div>
              
              <motion.div
                className="relative bg-white rounded-2xl p-6 h-full shadow-lg overflow-hidden"
                variants={hoverVariants}    initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}   viewport={{ once: false }}
          transition={{ duration: 1.2, delay: index * 0.1 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl text-white mb-6`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>

                <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${feature.color} transition-all duration-300 group-hover:w-full`}></div>

                <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-full blur-xl opacity-30`}></div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <p className="text-lg text-gray-600 mb-6">Ready to transform your practice?</p>
          <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-purple-600 hover:to-blue-700 transform hover:-translate-y-1">
            Start Your Free Trial
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
