"use client"

import { motion } from "framer-motion"

const EduVisionLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <motion.div
        style={{
          width: 200,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "white",
          background: "linear-gradient(to right, #4f46e5, #8b5cf6)",
          borderRadius: "1rem",
          perspective: 1000,
        }}
      >
        <motion.div
          animate={{
            rotateY: [0, 180, 180, 0, 0],
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          EduVision
        </motion.div>
      </motion.div>
    </div>
  )
}

export default EduVisionLoader
