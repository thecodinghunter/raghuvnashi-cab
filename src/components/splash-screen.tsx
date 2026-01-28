'use client';

import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800"
      initial={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-6"
      >
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <svg
            className="w-16 h-16 text-blue-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.364 5.636l-3.536 3.536m9.172-9.172a9 9 0 11-12.728 12.728m0 0L9.172 9.172m0 0l3.536-3.536m9.172 9.172L12 12m0 0l-3.536-3.536" />
          </svg>
        </div>
      </motion.div>

      {/* Business Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-white mb-2">Jalaram Cabs</h1>
        <p className="text-blue-100 text-lg">AI-powered ride hailing service</p>
      </motion.div>

      {/* Loading Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-white rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
