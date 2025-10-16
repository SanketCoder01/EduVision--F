"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  size?: number
  showLegend?: boolean
}

export function PieChart({ data, size = 200, showLegend = true }: PieChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data])
  
  const segments = useMemo(() => {
    let cumulativeValue = 0
    return data.map(item => {
      const percentage = (item.value / total) * 100
      const startAngle = (cumulativeValue / total) * 360
      cumulativeValue += item.value
      const endAngle = (cumulativeValue / total) * 360
      
      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
        path: createArc(size / 2, size / 2, size / 2 - 20, startAngle, endAngle)
      }
    })
  }, [data, total, size])

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((segment, index) => (
          <motion.path
            key={segment.name}
            d={segment.path}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
      </svg>
      
      {showLegend && (
        <div className="flex flex-wrap gap-4 justify-center">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-600">
                {segment.name} ({segment.percentage.toFixed(1)}%)
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function createArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  
  return [
    "M", x, y,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ")
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  }
}
