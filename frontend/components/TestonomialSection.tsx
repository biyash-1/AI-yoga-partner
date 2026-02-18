"use client";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Yoga Enthusiast · 8 months",
    avatar: "🧘‍♀️",
    rating: 5,
    text: "This AI coach completely changed my practice. It corrected my Warrior II alignment in real time — something I'd been doing wrong for years. My flexibility improved dramatically.",
    highlight: "Flexibility up 40%",
    highlightColor: "text-purple-600 bg-purple-50",
  },
  {
    name: "James T.",
    role: "Beginner · 3 months",
    avatar: "🧘‍♂️",
    rating: 5,
    text: "I was intimidated to start yoga, but the AI broke everything down so gently. I went from barely touching my toes to holding a full forward fold.",
    highlight: "From zero to daily practice",
    highlightColor: "text-blue-600 bg-blue-50",
  },
  {
    name: "Priya K.",
    role: "Studio Instructor · 2 years",
    avatar: "✨",
    rating: 5,
    text: "Even as a certified instructor I use this to refine my own practice. The AI feedback is shockingly nuanced — it catches micro-adjustments I wouldn't notice myself.",
    highlight: "Pro-level feedback",
    highlightColor: "text-green-600 bg-green-50",
  },
  {
    name: "Daniel R.",
    role: "Stress Relief · 5 months",
    avatar: "🌿",
    rating: 5,
    text: "I started for stress relief and ended up completely transforming my mornings. The meditation sequences paired with yoga flow have been life-changing.",
    highlight: "Stress reduced by 60%",
    highlightColor: "text-amber-600 bg-amber-50",
  },
  {
    name: "Lena W.",
    role: "Postpartum Recovery · 6 months",
    avatar: "🌸",
    rating: 5,
    text: "The AI adapted perfectly to my postpartum journey — gentle, progressive, and always safe. I feel stronger than I did before pregnancy.",
    highlight: "Safe postpartum adapted",
    highlightColor: "text-pink-600 bg-pink-50",
  },
  {
    name: "Marcus J.",
    role: "Athlete Cross-training · 1 year",
    avatar: "🌞",
    rating: 5,
    text: "As a runner I used to skip flexibility work. Now I can't imagine training without it. My injury rate dropped to zero and my race times improved.",
    highlight: "Zero injuries this season",
    highlightColor: "text-indigo-600 bg-indigo-50",
  },
];

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-1 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            REAL STORIES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Loved by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">
              50,000+ practitioners
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From complete beginners to seasoned instructors — see how AI-guided yoga is transforming lives.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            { value: "50K+", label: "Active Users" },
            { value: "4.9★", label: "Average Rating" },
            { value: "2M+", label: "Sessions Completed" },
            { value: "98%", label: "Would Recommend" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-white/60 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <StarRating count={t.rating} />
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">"{t.text}"</p>
              <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full mb-4 ${t.highlightColor}`}>
                {t.highlight}
              </span>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA nudge */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-500 mb-4">Ready to write your own success story?</p>
          <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-purple-600 hover:to-blue-700 transform hover:-translate-y-1">
            Start Your Free Session
          </button>
        </motion.div>
      </div>
    </section>
  );
}