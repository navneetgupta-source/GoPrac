"use client"

import { useEffect, useRef } from "react"

export default function SkillsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with higher resolution for retina displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Set canvas size in CSS
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Center of the radar chart
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Draw radar background circles
    const circles = 4
    ctx.strokeStyle = "#e2e8f0"
    ctx.fillStyle = "#f8fafc"

    for (let i = circles; i > 0; i--) {
      const currentRadius = (radius / circles) * i
      ctx.beginPath()
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2)

      if (i === circles) {
        ctx.fillStyle = "#f8fafc"
      } else {
        // Create gradient for inner circles
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius)
        gradient.addColorStop(0, "rgba(219, 234, 254, 0.4)")
        gradient.addColorStop(1, "rgba(219, 234, 254, 0.1)")
        ctx.fillStyle = gradient
      }

      ctx.fill()
      ctx.stroke()
    }

    // Draw radar lines
    const categories = ["Data Structures", "Problem Solving", "Critical Thinking", "Problem Comprehension"]

    const numCategories = categories.length
    const angleStep = (Math.PI * 2) / numCategories

    // Draw lines from center to edge
    ctx.strokeStyle = "#e2e8f0"
    ctx.beginPath()
    for (let i = 0; i < numCategories; i++) {
      const angle = i * angleStep - Math.PI / 2 // Start from top (- PI/2)
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)

      // Draw category labels
      ctx.font = "10px sans-serif"
      ctx.fillStyle = "#64748b"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const labelDistance = radius * 1.15
      const labelX = centerX + labelDistance * Math.cos(angle)
      const labelY = centerY + labelDistance * Math.sin(angle)

      // Adjust label position based on angle
      const textX = labelX
      const textY = labelY

      ctx.fillText(categories[i], textX, textY)
    }
    ctx.stroke()

    // Draw data points
    const dataPoints = [0.8, 0.7, 0.6, 0.75] // Values between 0-1

    // Draw filled polygon for data
    ctx.beginPath()
    for (let i = 0; i < numCategories; i++) {
      const angle = i * angleStep - Math.PI / 2
      const value = dataPoints[i]
      const pointRadius = radius * value
      const x = centerX + pointRadius * Math.cos(angle)
      const y = centerY + pointRadius * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)"
    ctx.fill()
    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw data points
    for (let i = 0; i < numCategories; i++) {
      const angle = i * angleStep - Math.PI / 2
      const value = dataPoints[i]
      const pointRadius = radius * value
      const x = centerX + pointRadius * Math.cos(angle)
      const y = centerY + pointRadius * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw center point
    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
    ctx.fillStyle = "#3b82f6"
    ctx.fill()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-64"
      aria-label="Skills radar chart showing performance across different categories"
    />
  )
}
