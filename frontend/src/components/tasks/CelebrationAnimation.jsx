import React, { useEffect, useState } from 'react'
import { CheckCircle2, Star, Sparkles, Trophy, Zap } from 'lucide-react'

/**
 * Celebration animation component for task completion
 */
const CelebrationAnimation = ({ onComplete }) => {
  const [particles, setParticles] = useState([])
  const [showMainIcon, setShowMainIcon] = useState(true)

  useEffect(() => {
    // Create confetti particles
    const newParticles = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * -3 - 2,
        color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      })
    }
    setParticles(newParticles)

    // Animate particles
    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          rotation: particle.rotation + particle.rotationSpeed
        })).filter(particle => particle.y < window.innerHeight + 100)
      )
    }

    const interval = setInterval(animateParticles, 16) // 60fps

    // Hide main icon after 1 second
    const hideTimer = setTimeout(() => {
      setShowMainIcon(false)
    }, 1000)

    // Complete animation after 2 seconds
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(hideTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Main Celebration Icon */}
      {showMainIcon && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* Pulsing Background */}
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-2 bg-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></div>
            
            {/* Main Icon */}
            <div className="relative p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl">
              <CheckCircle2 className="h-16 w-16 text-white animate-bounce" />
            </div>

            {/* Floating Icons */}
            <div className="absolute -top-4 -right-4 animate-bounce" style={{ animationDelay: '0.1s' }}>
              <div className="p-2 bg-yellow-400 rounded-full shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 animate-bounce" style={{ animationDelay: '0.3s' }}>
              <div className="p-2 bg-purple-500 rounded-full shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="absolute top-0 -left-8 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <div className="p-2 bg-blue-500 rounded-full shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="absolute -top-8 left-0 animate-bounce" style={{ animationDelay: '0.7s' }}>
              <div className="p-2 bg-pink-500 rounded-full shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confetti Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-pulse"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 ${particle.size}px ${particle.color}`
          }}
        />
      ))}

      {/* Success Message */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg">
          <p className="text-lg font-bold text-green-600 dark:text-green-400 animate-pulse">
            🎉 Task Completed! 🎉
          </p>
        </div>
      </div>

      {/* XP Award Animation */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl px-4 py-2 shadow-lg animate-bounce">
          <p className="text-white font-bold text-sm">
            +10 XP Earned!
          </p>
        </div>
      </div>

      {/* Progress Boost Message */}
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="bg-blue-500/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
          <p className="text-white font-semibold text-sm animate-pulse">
            Great progress! Keep it up! 💪
          </p>
        </div>
      </div>
    </div>
  )
}

export default CelebrationAnimation

