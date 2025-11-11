import { useEffect, useState } from 'react'

export interface DamageNumber {
  id: string
  damage: number
  isCrit: boolean
  isMiss?: boolean
  x: number
  y: number
  timestamp: number
}

interface DamageNumberContainerProps {
  readonly damageNumbers: DamageNumber[]
  readonly onRemoveDamageNumber: (id: string) => void
}

interface AnimatedDamageNumber extends DamageNumber {
  isAnimating: boolean
}

export default function DamageNumberContainer({ damageNumbers, onRemoveDamageNumber }: DamageNumberContainerProps) {
  const [animatedNumbers, setAnimatedNumbers] = useState<AnimatedDamageNumber[]>([])

  // When new damage numbers arrive, add them to animated list
  useEffect(() => {
    damageNumbers.forEach(damageNumber => {
      // Check if this damage number is already being animated
      const exists = animatedNumbers.find(an => an.id === damageNumber.id)
      if (!exists) {
        // Add new damage number
        setAnimatedNumbers(prev => [...prev, { ...damageNumber, isAnimating: false }])

        // Start animation after a tiny delay
        setTimeout(() => {
          setAnimatedNumbers(prev =>
            prev.map(an => an.id === damageNumber.id ? { ...an, isAnimating: true } : an)
          )
        }, 10)

        // Fade out
        setTimeout(() => {
          setAnimatedNumbers(prev =>
            prev.map(an => an.id === damageNumber.id ? { ...an, isAnimating: false } : an)
          )
        }, 600)

        // Remove from our local state and notify parent
        setTimeout(() => {
          setAnimatedNumbers(prev => prev.filter(an => an.id !== damageNumber.id))
          onRemoveDamageNumber(damageNumber.id)
        }, 1000)
      }
    })
  }, [damageNumbers, onRemoveDamageNumber])

  // Clean up when damage numbers are removed from parent
  useEffect(() => {
    const currentIds = new Set(damageNumbers.map(dn => dn.id))
    setAnimatedNumbers(prev => prev.filter(an => currentIds.has(an.id)))
  }, [damageNumbers])

  return (
    <div className="relative pointer-events-none">
      {animatedNumbers.map(damageNumber => {
        // Determine color and text
        let color: string
        let text: string
        if (damageNumber.isMiss) {
          color = '#888'
          text = 'MISS'
        } else if (damageNumber.damage <= 0) {
          color = '#888'
          text = '0 dmg'
        } else if (damageNumber.isCrit) {
          color = '#ff6b35'
          text = `${Math.ceil(damageNumber.damage)} dmg! 🎯`
        } else {
          color = '#fff'
          text = `${Math.ceil(damageNumber.damage)} dmg`
        }

        return (
          <div
            key={damageNumber.id}
            className="absolute pointer-events-none z-[1000] transition-all duration-700 ease-out"
            style={{
              left: '48%',
              top: '400px',
              fontSize: damageNumber.isCrit ? '28px' : '20px',
              fontWeight: damageNumber.isCrit || damageNumber.isMiss ? 'bold' : 'normal',
              color: color,
              textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
              transform: damageNumber.isAnimating ? 'translateY(-80px)' : 'translateY(20px)',
              opacity: damageNumber.isAnimating ? 1 : 0,
            }}
          >
            {text}
          </div>
        )
      })}
    </div>
  )
}