"use client";

"use client";

import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const EduvisionLoader = ({ text = "EduVision" }) => {
  const letters = Array.from(text);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
      <motion.div
        className="flex overflow-hidden text-4xl font-bold text-purple-600"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {letters.map((letter, index) => (
          <motion.span key={index} variants={letterVariants}>
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </motion.div>
      <p className="text-lg text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
};

export default EduvisionLoader;
