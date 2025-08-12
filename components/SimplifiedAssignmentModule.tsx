"use client"

import React from 'react'
import { FileText, Sparkles, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface SimplifiedAssignmentModuleProps {
  onCreateManualAction: () => void
  onCreateAIAction: () => void
}

export default function SimplifiedAssignmentModule({ onCreateManualAction, onCreateAIAction }: SimplifiedAssignmentModuleProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto p-4">
      {/* Manual Assignment - Perfect Square Card */}
      <motion.div
        className="group relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          onClick={onCreateManualAction}
          className="aspect-square bg-white border-2 border-blue-200 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center p-6 group-hover:border-blue-400 group-hover:bg-blue-50"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Manual Assignment</h3>
          <p className="text-sm text-gray-600 text-center leading-relaxed">Create custom assignments with full control</p>
          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* AI Assignment - Perfect Square Card */}
      <motion.div
        className="group relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.div
          onClick={onCreateAIAction}
          className="aspect-square bg-white border-2 border-purple-200 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center p-6 group-hover:border-purple-400 group-hover:bg-purple-50"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors duration-300">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">AI Assignment</h3>
          <p className="text-sm text-gray-600 text-center leading-relaxed">Generate assignments using artificial intelligence</p>
          <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
