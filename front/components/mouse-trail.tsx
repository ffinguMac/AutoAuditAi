"use client"

import { useState, useEffect } from "react"

interface TrailPoint {
  x: number
  y: number
  id: number
  timestamp: number
}

export function MouseTrail() {
  const [trail, setTrail] = useState<TrailPoint[]>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
        timestamp: Date.now(),
      }

      setTrail((prev) => [
        newPoint,
        ...prev.slice(0, 20), // Keep last 20 points
      ])
    }

    // Clean up old trail points
    const cleanup = setInterval(() => {
      setTrail((prev) => prev.filter((point) => Date.now() - point.timestamp < 1000))
    }, 50)

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(cleanup)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((point, index) => {
        const age = Date.now() - point.timestamp
        const opacity = Math.max(0, 1 - age / 1000)
        const scale = Math.max(0.2, 1 - index * 0.04)
        const size = 16 - index * 0.5

        return (
          <div
            key={point.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: point.x - size / 2,
              top: point.y - size / 2,
              width: size,
              height: size,
              background: `radial-gradient(circle, 
                rgba(59, 130, 246, ${opacity * 0.8}) 0%, 
                rgba(147, 51, 234, ${opacity * 0.6}) 30%, 
                rgba(236, 72, 153, ${opacity * 0.4}) 60%, 
                transparent 80%
              )`,
              boxShadow: `
                0 0 ${size * 2}px rgba(59, 130, 246, ${opacity * 0.6}),
                0 0 ${size * 4}px rgba(147, 51, 234, ${opacity * 0.3}),
                0 0 ${size * 6}px rgba(236, 72, 153, ${opacity * 0.1})
              `,
              transform: `scale(${scale})`,
              transition: "all 0.1s ease-out",
              filter: `blur(${index * 0.1}px)`,
            }}
          />
        )
      })}

      {/* Main cursor glow */}
      {trail.length > 0 && (
        <div
          className="absolute w-6 h-6 rounded-full pointer-events-none"
          style={{
            left: trail[0].x - 12,
            top: trail[0].y - 12,
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.7) 50%, transparent 70%)",
            boxShadow: `
              0 0 20px rgba(59, 130, 246, 0.8),
              0 0 40px rgba(147, 51, 234, 0.4),
              0 0 60px rgba(236, 72, 153, 0.2)
            `,
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}
    </div>
  )
}
