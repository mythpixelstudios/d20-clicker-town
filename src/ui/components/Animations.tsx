import React, { useEffect, useState } from 'react'

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

interface AnimationContainerProps {
  readonly type: 'levelUp' | 'craftingComplete' | 'achievement'
  readonly onComplete?: () => void
  readonly message?: string
}

export function LevelUpAnimation({ onComplete, message = 'Level Up!' }: Omit<AnimationContainerProps, 'type'>) {
  const [particles, setParticles] = useState<Particle[]>([])
  
  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = []
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30
      newParticles.push({
        id: `particle-${i}`,
        x: 50,
        y: 50,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        life: 100,
        color: `hsl(${45 + Math.random() * 30}, 100%, ${50 + Math.random() * 20}%)`,
        size: 4 + Math.random() * 4
      })
    }
    setParticles(newParticles)
    
    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2, // Gravity
          life: p.life - 2
        })).filter(p => p.life > 0)
        
        if (updated.length === 0 && onComplete) {
          onComplete()
        }
        
        return updated
      })
    }, 16)
    
    return () => clearInterval(interval)
  }, [onComplete])
  
  return (
    <div className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999] flex items-center justify-center">
      <div className="text-6xl font-bold text-gold animate-level-up-pulse z-10 relative" style={{
        textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.8)'
      }}>
        ⭐ {message} ⭐
      </div>
      <svg className="absolute w-full h-full top-0 left-0" viewBox="0 0 100 100">
        {particles.map(p => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={p.color}
            opacity={p.life / 100}
          />
        ))}
      </svg>
    </div>
  )
}

export function CraftingCompleteAnimation({ onComplete, message = 'Crafting Complete!' }: Omit<AnimationContainerProps, 'type'>) {
  const [sparkles, setSparkles] = useState<Particle[]>([])
  
  useEffect(() => {
    // Generate sparkles
    const newSparkles: Particle[] = []
    for (let i = 0; i < 20; i++) {
      newSparkles.push({
        id: `sparkle-${i}`,
        x: 40 + Math.random() * 20,
        y: 40 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 3,
        life: 100,
        color: `hsl(${180 + Math.random() * 60}, 100%, 70%)`,
        size: 2 + Math.random() * 3
      })
    }
    setSparkles(newSparkles)
    
    const interval = setInterval(() => {
      setSparkles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.1,
          life: p.life - 3
        })).filter(p => p.life > 0)
        
        if (updated.length === 0 && onComplete) {
          onComplete()
        }
        
        return updated
      })
    }, 16)
    
    return () => clearInterval(interval)
  }, [onComplete])
  
  return (
    <div className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999] flex items-center justify-center">
      <div className="text-5xl font-bold text-[#10b981] animate-crafting-bounce z-10 relative" style={{
        textShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.8)'
      }}>
        🔨 {message} 🔨
      </div>
      <svg className="absolute w-full h-full top-0 left-0" viewBox="0 0 100 100">
        {sparkles.map(p => (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={p.color}
              opacity={p.life / 100}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={p.size * 2}
              fill={p.color}
              opacity={(p.life / 100) * 0.3}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

export function AchievementAnimation({ onComplete, message = 'Achievement Unlocked!' }: Omit<AnimationContainerProps, 'type'>) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onComplete])
  
  return (
    <div className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999] flex items-center justify-center">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-500 border-[3px] border-[#fbbf24] rounded-2xl px-12 py-6 flex items-center gap-5 animate-achievement-slide pointer-events-auto" style={{
        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.6), 0 0 0 4px rgba(251, 191, 36, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
      }}>
        <div className="text-5xl animate-achievement-rotate">🏆</div>
        <div className="text-2xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>{message}</div>
      </div>
    </div>
  )
}

// Animation Manager Hook
export function useAnimationQueue() {
  const [queue, setQueue] = useState<AnimationContainerProps[]>([])
  const [current, setCurrent] = useState<AnimationContainerProps | null>(null)
  
  const addAnimation = (animation: AnimationContainerProps) => {
    setQueue(prev => [...prev, animation])
  }
  
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0])
      setQueue(prev => prev.slice(1))
    }
  }, [current, queue])
  
  const handleComplete = () => {
    setCurrent(null)
  }
  
  const AnimationComponent = () => {
    if (!current) return null
    
    switch (current.type) {
      case 'levelUp':
        return <LevelUpAnimation onComplete={handleComplete} message={current.message} />
      case 'craftingComplete':
        return <CraftingCompleteAnimation onComplete={handleComplete} message={current.message} />
      case 'achievement':
        return <AchievementAnimation onComplete={handleComplete} message={current.message} />
      default:
        return null
    }
  }
  
  return {
    addAnimation,
    AnimationComponent
  }
}
