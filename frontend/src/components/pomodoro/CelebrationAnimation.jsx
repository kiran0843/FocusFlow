import React, { useState, useEffect } from 'react'
import { Trophy, Zap, Star, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * CelebrationAnimation - XP and level up celebration component
 */
const CelebrationAnimation = ({ 
  xpGained = 0, 
  leveledUp = false, 
  newLevel = 1, 
  show = false, 
  onComplete = () => {} 
}) => {
  const [animationPhase, setAnimationPhase] = useState('hidden')
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (show) {
      setAnimationPhase('entering')
      
      // Generate confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1000,
        duration: 2000 + Math.random() * 1000,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
      }))
      setParticles(newParticles)

      // Animation sequence
      setTimeout(() => setAnimationPhase('visible'), 100)
      setTimeout(() => setAnimationPhase('exiting'), 2000)
      setTimeout(() => {
        setAnimationPhase('hidden')
        onComplete()
      }, 3000)
    } else {
      setAnimationPhase('hidden')
    }
  }, [show, onComplete])

  if (!show || animationPhase === 'hidden') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500",
        animationPhase === 'visible' ? 'opacity-100' : 'opacity-0'
      )} />

      {/* Confetti particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`
          }}
        />
      ))}

      {/* Main celebration content */}
      <div className={cn(
        "relative text-center transform transition-all duration-500",
        animationPhase === 'entering' && "scale-0 opacity-0",
        animationPhase === 'visible' && "scale-100 opacity-100",
        animationPhase === 'exiting' && "scale-110 opacity-0"
      )}>
        {/* XP Gained */}
        {xpGained > 0 && (
          <div className="mb-8">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-75 animate-pulse" />
              
              {/* Main XP display */}
              <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-4xl font-bold animate-bounce">
                <Zap className="inline-block w-8 h-8 mr-2" />
                +{xpGained} XP!
              </div>
            </div>
          </div>
        )}

        {/* Level Up */}
        {leveledUp && (
          <div className="mb-8">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse" />
              
              {/* Level up display */}
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-3xl font-bold animate-bounce">
                <Trophy className="inline-block w-8 h-8 mr-2" />
                Level Up!
              </div>
            </div>
            
            {/* New level */}
            <div className="mt-4 text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Level {newLevel}
            </div>
          </div>
        )}

        {/* Sparkles animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                "absolute w-4 h-4 text-yellow-400 animate-ping",
                "opacity-75"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1000}ms`,
                animationDuration: `${1000 + Math.random() * 1000}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * XPProgressBar - Shows XP progress towards next level
 */
export const XPProgressBar = ({ currentXP, level, className = '' }) => {
  const xpForCurrentLevel = (level - 1) * 100
  const xpForNextLevel = level * 100
  const progressXP = currentXP - xpForCurrentLevel
  const totalXPNeeded = xpForNextLevel - xpForCurrentLevel
  const progressPercentage = Math.min(100, Math.max(0, (progressXP / totalXPNeeded) * 100))

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-white/80">Level {level}</span>
        <span className="text-sm text-white/60">
          {xpForNextLevel - currentXP} XP to next level
        </span>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden relative">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            progressPercentage > 0 
              ? "bg-gradient-to-r from-blue-500 to-purple-500" 
              : "bg-gradient-to-r from-gray-400 to-gray-500 opacity-50"
          )}
          style={{ width: `${Math.max(2, progressPercentage)}%` }}
        />
        {progressPercentage === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/40">Start earning XP!</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-white/60">{currentXP} XP</span>
        <span className="text-xs text-white/60">{xpForNextLevel} XP</span>
      </div>
    </div>
  )
}

/**
 * SessionCompleteModal - Modal for session completion with options
 */
export const SessionCompleteModal = ({ 
  show = false, 
  sessionType = 'work', 
  xpEarned = 0, 
  onRate = () => {}, 
  onAddNotes = () => {}, 
  onClose = () => {} 
}) => {
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-4 text-center">
          Session Complete! 🎉
        </h3>
        
        {/* XP Earned */}
        {xpEarned > 0 && (
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              +{xpEarned} XP Earned!
            </div>
            <p className="text-white/70">
              Great job completing your {sessionType === 'work' ? 'work session' : 'break'}!
            </p>
          </div>
        )}

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm mb-2">Rate this session</label>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={cn(
                  "w-8 h-8 transition-colors",
                  star <= rating ? "text-yellow-400" : "text-white/30"
                )}
              >
                <Star className="w-full h-full fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm mb-2">Session notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did this session go?"
            className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 resize-none"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => {
              onRate(rating)
              onAddNotes(notes)
              onClose()
            }}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all"
          >
            Save & Continue
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

export default CelebrationAnimation

