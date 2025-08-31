'use client'

import { useEffect, useState } from 'react'

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  icon: string
}

export function FloatingSocialBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    // Create initial bubbles
    const initialBubbles: Bubble[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 40 + 20,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.3 + 0.1,
      icon: ['📱', '💬', '📺', '🎵', '⚽', '🎭', '🎪', '🎬'][i]
    }))

    setBubbles(initialBubbles)

    // Animation loop
    const animate = () => {
      setBubbles(prevBubbles =>
        prevBubbles.map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          // Reset bubble if it goes off screen
          ...(bubble.y < -50 && {
            y: window.innerHeight + 50,
            x: Math.random() * window.innerWidth
          })
        }))
      )
    }

    const interval = setInterval(animate, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-500/30 flex items-center justify-center text-2xl"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {bubble.icon}
        </div>
      ))}
    </div>
  )
}
