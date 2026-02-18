"use client";
import { motion } from "framer-motion";

const footerLinks = {
  Product: ["Features", "Pricing", "AI Coach", "Pose Library"],
  Company: ["About Us", "Blog", "Careers", "Contact"],
  Support: ["Help Center", "Privacy Policy", "Terms of Service"],
  "Follow Along": ["Instagram", "YouTube", "TikTok", "Twitter / X"],
};

export default function Footer() {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
      <footer className="relative overflow-hidden w-full">
        {/* Wave separator */}
        <div className="w-full overflow-hidden leading-none -mb-1">
          <svg viewBox="0 0 1440 50" className="w-full block" preserveAspectRatio="none">
            <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="#1e1b4b" />
          </svg>
        </div>

        <div className="bg-[#1e1b4b] text-white w-full">
          <div className="w-full px-10 py-8">

            {/* Single row: logo | links | newsletter */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">

              {/* Brand */}
              <motion.div
                className="flex-shrink-0 lg:w-48"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🧘</span>
                  <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    YogaAI
                  </span>
                </div>
                <p className="text-indigo-300 text-xs leading-relaxed mb-3">
                  Your AI yoga instructor, available 24/7.
                </p>
                <div className="flex gap-2">
                  {["📸", "▶️", "🎵", "🐦"].map((icon, i) => (
                    <button
                      key={i}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-all duration-200 hover:scale-110"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Links */}
              <motion.div
                className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {Object.entries(footerLinks).map(([category, links]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-2">{category}</p>
                    <ul className="space-y-1.5">
                      {links.map((link) => (
                        <li key={link}>
                          <a
                            href="#"
                            className="text-indigo-300 text-xs hover:text-white transition-colors duration-200"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>

              {/* Newsletter */}
              <motion.div
                className="flex-shrink-0 lg:w-64"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-1">Stay Inspired</p>
                <p className="text-indigo-300 text-xs mb-3">
                  Weekly tips & AI updates for 50K+ practitioners.
                </p>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs text-white placeholder-indigo-400 outline-none focus:border-purple-400 transition-colors"
                  />
                  <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:from-purple-600 hover:to-blue-600 transition-all whitespace-nowrap">
                    Join
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-6 pt-4 border-t border-white/10 text-indigo-400 text-xs">
              <p>© 2025 YogaAI. All rights reserved. Made with 🧘 and AI magic.</p>
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">All systems operational</span>
              </div>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}