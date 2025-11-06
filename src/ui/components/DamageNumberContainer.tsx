import { useEffect, useRef } from 'react'

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

// Object pool for damage numbers
class DamageNumberPool {
  private pool: HTMLDivElement[] = []
  private readonly maxPoolSize = 20
  private container: HTMLDivElement | null = null
  
  setContainer(container: HTMLDivElement) {
    this.container = container
  }
  
  acquire(): HTMLDivElement {
    let element = this.pool.pop()
    
    if (!element && this.container) {
      element = document.createElement('div')
      element.className = 'absolute pointer-events-none z-[1000] transition-all duration-200 ease-out'
      this.container.appendChild(element)
    }
    
    return element || document.createElement('div')
  }
  
  release(element: HTMLDivElement) {
    if (this.pool.length < this.maxPoolSize) {
      element.style.display = 'none'
      this.pool.push(element)
    } else if (element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }
  
  clear() {
    this.pool.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    this.pool = []
  }
}

const damagePool = new DamageNumberPool()

export default function DamageNumberContainer({ damageNumbers, onRemoveDamageNumber }: DamageNumberContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeElementsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  
  // Initialize pool with container
  useEffect(() => {
    if (containerRef.current) {
      damagePool.setContainer(containerRef.current)
    }
    
    return () => {
      // Cleanup on unmount
      damagePool.clear()
      activeElementsRef.current.clear()
    }
  }, [])
  
  // Manage damage numbers using pooled elements
  useEffect(() => {
    const currentIds = new Set(damageNumbers.map(dn => dn.id))
    const timers: number[] = []

    // Remove old elements
    activeElementsRef.current.forEach((element, id) => {
      if (!currentIds.has(id)) {
        damagePool.release(element)
        activeElementsRef.current.delete(id)
      }
    })

    // Add or update elements
    damageNumbers.forEach(damageNumber => {
      const isNewElement = !activeElementsRef.current.has(damageNumber.id)
      let element = activeElementsRef.current.get(damageNumber.id)

      if (!element) {
        element = damagePool.acquire()
        activeElementsRef.current.set(damageNumber.id, element)
      }

      // Only schedule removal for new elements
      if (isNewElement) {
        // Schedule removal with simpler structure
        const fadeTimer = window.setTimeout(() => {
          const el = activeElementsRef.current.get(damageNumber.id)
          if (el) {
            el.style.opacity = '0'
            el.style.transform = 'translateY(-100px)'
          }
        }, 800)

        const removeTimer = window.setTimeout(() => {
          onRemoveDamageNumber(damageNumber.id)
        }, 1200)

        timers.push(fadeTimer, removeTimer)
      }
      
      // Only update and animate new elements
      if (isNewElement) {
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

        // Update element
        element.style.display = 'block'
        element.style.left = '360px'
        element.style.top = '150px'
        element.style.position = 'absolute'
        element.style.pointerEvents = 'none'
        element.style.zIndex = '1000'
        element.style.fontSize = damageNumber.isCrit ? '24px' : '18px'
        element.style.fontWeight = damageNumber.isCrit || damageNumber.isMiss ? 'bold' : 'normal'
        element.style.color = color
        element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)'
        element.style.transition = 'all 0.6s ease-out'
        element.textContent = text
        element.className = `absolute pointer-events-none z-[1000] ${damageNumber.isCrit ? 'crit' : damageNumber.isMiss ? 'miss' : 'normal'}`

        // Reset transform and opacity for new animation
        element.style.transform = 'translateY(0px)'
        element.style.opacity = '0'

        // Trigger animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (element) {
              element.style.transform = 'translateY(-80px)'
              element.style.opacity = '1'
            }
          })
        })
      }
    })
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [damageNumbers, onRemoveDamageNumber])
  
  return (
    <div
      ref={containerRef}
      className="relative pointer-events-none"
    >
      {/* Container for pooled elements */}
    </div>
  )
}