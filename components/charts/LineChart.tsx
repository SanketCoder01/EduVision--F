"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface LineChartProps {
  data: Array<{
    name: string
    value: number
  }>
  height?: number
  width?: number
  color?: string
  showPoints?: boolean
}

export function LineChart({ 
  data, 
  height = 200, 
  width = 400, 
  color = "#3b82f6",
  showPoints = true 
}: LineChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  const minValue = Math.min(...data.map(item => item.value))
  const range = maxValue - minValue
  
  const points = useMemo(() => {
    const padding = 20
    const stepX = (width - padding * 2) / (data.length - 1)
    
    return data.map((item, index) => {
      const x = padding + stepX * index
      const y = height - padding - ((item.value - minValue) / range) * (height - padding * 2)
      return { x, y, ...item }
    })
  }, [data, width, height, minValue, range])
  
  const pathData = useMemo(() => {
    if (points.length === 0) return ""
    
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }
    return path
  }, [points])
  
  return (
    <div className="w-full">
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - 20 - ratio * (height - 40)
          return (
            <line
              key={ratio}
              x1={20}
              y1={y}
              x2={width - 20}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
          )
        })}
        
        {/* Line path */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {/* Gradient fill */}
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.path
          d={`${pathData} L ${width - 20} ${height - 20} L 20 ${height - 20} Z`}
          fill="url(#lineGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        
        {/* Data points */}
        {showPoints && points.map((point, index) => (
          <motion.g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="white"
              stroke={color}
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="cursor-pointer hover:r-8 transition-all"
            />
            <title>{`${point.name}: ${point.value}`}</title>
          </motion.g>
        ))}
        
        {/* X-axis labels */}
        {points.map((point, index) => (
          <text
            key={`label-${index}`}
            x={point.x}
            y={height - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {point.name}
          </text>
        ))}
      </svg>
    </div>
  )
}
