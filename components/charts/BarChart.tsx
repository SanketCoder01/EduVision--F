"use client"

import { motion } from "framer-motion"

interface BarChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
  showValues?: boolean
}

export function BarChart({ data, height = 200, showValues = true }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height
          const color = item.color || "#3b82f6"
          
          return (
            <div key={item.name} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex flex-col items-center">
                {showValues && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-xs font-semibold text-gray-700 mb-1"
                  >
                    {item.value}
                  </motion.span>
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                  className="w-full rounded-t-lg relative group cursor-pointer"
                  style={{ backgroundColor: color }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-t-lg" />
                </motion.div>
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="text-xs text-gray-600 text-center max-w-full truncate px-1"
              >
                {item.name}
              </motion.span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
