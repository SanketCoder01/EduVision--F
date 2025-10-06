"use client"

import { motion } from "framer-motion";
import Image from "next/image";

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-32 h-32 mb-6"
        >
          {/* Rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-dashed border-orange-300"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Logo */}
          <div className="absolute inset-2 rounded-full overflow-hidden bg-white shadow-xl">
            <Image
              src="/images/SU_2.jpg"
              alt="Loading"
              width={120}
              height={120}
              className="w-full h-full object-contain p-2"
            />
          </div>

          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-gray-600 font-medium"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
}

