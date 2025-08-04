"use client"

import { motion } from "framer-motion"
import { Code, Loader2 } from "lucide-react"

export default function CompilerLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="relative"
        >
          <Code className="h-16 w-16 text-purple-600" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="absolute inset-0 rounded-full border-2 border-purple-600/30"
          />
        </motion.div>

        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Compiler</h2>
          <p className="text-muted-foreground">Setting up your coding environment...</p>
        </div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Initializing...
        </motion.div>
      </motion.div>
    </div>
  )
}
