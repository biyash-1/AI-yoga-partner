"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  const team = [
    { name: "Prijal khadka", role: "Founder & AI Lead", avatar: "👨‍💻" },
    { name: "Biyash Shrestha", role: "Yoga Director", avatar: "🧘‍♀️"  },
    { name: "Ashum BHuju Shrestha", role: "Product Designer", avatar: "🎨" },
    { name: "Pranil Barahi", role: "Head of Engineering", avatar: "⚙️" },
  ];

  const milestones = [
    { year: "2022", event: "Founded YogaAI with a vision to democratize yoga" },
    { year: "2023", event: "Launched beta to 1,000 early adopters" },
    { year: "2024", event: "Reached 50,000 active users across 40 countries" },
    { year: "2025", event: "Secured Series A funding to expand AI capabilities" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-[1200px] mx-auto px-6 py-16">

        {/* Hero */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            ABOUT US
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Making Yoga Accessible to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">
              Everyone
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We believe yoga should be available to everyone, regardless of location, schedule, or experience level. That's why we built an AI instructor that meets you exactly where you are.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 md:p-14 shadow-xl mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🎯</span>
            <h2 className="text-3xl font-bold text-gray-800">Our Mission</h2>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Traditional yoga studios are expensive, intimidating, and bound by rigid schedules. We're changing that. YogaAI combines ancient yoga wisdom with cutting-edge artificial intelligence to deliver personalized instruction that adapts to your body, your pace, and your goals.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Whether you're a complete beginner taking your first downward dog or an advanced practitioner perfecting your handstand, our AI coach provides real-time feedback that helps you improve safely and effectively.
          </p>
        </motion.div>

        {/* Story Timeline */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 text-center">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {m.year}
                </div>
                <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md">
                  <p className="text-gray-700 leading-relaxed">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">Meet the Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            A passionate group of engineers, designers, and yoga experts working together to transform how the world practices yoga.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-4xl">
                  {member.avatar}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-purple-600 text-sm font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 text-xs leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {[
            { icon: "🌍", title: "Accessible", desc: "Yoga for everyone, everywhere, at any skill level" },
            { icon: "🤖", title: "Intelligent", desc: "AI that learns your body and adapts in real-time" },
            { icon: "💚", title: "Mindful", desc: "Technology that enhances, never replaces, human connection" },
          ].map((value, i) => (
            <motion.div
              key={value.title}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-5xl mb-4">{value.icon}</div>
              <h3 className="font-bold text-gray-800 text-xl mb-2">{value.title}</h3>
              <p className="text-gray-600 text-sm">{value.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-20 text-center bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl p-12 text-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join 50,000+ people who've transformed their practice with AI-guided yoga.
          </p>
          <button className="bg-white text-purple-600 font-semibold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
            Start Free Session
          </button>
        </motion.div>

      </div>
    </div>
  );
}