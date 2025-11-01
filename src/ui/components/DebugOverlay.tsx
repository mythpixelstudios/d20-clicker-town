import { useState, useEffect } from 'react'
import { useEconomy } from '@/state/economyStore'
import { useChar } from '@/state/charStore'
import { useTown } from '@/state/townStore'
import { useZoneProgression } from '@/state/zoneProgressionStore'
import { computeClickDamage, computeAutoDamage, computeAutoAPS } from '@/systems/math'
import { calculateBuildingEffects } from '@/data/buildings'

interface MetricsData {
  goldPerMin: number
  xpPerMin: number
  currentDPS: number
  zoneDifficultyMultiplier: number
  currentZone: number
}

export default function DebugOverlay() {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState<MetricsData>({
    goldPerMin: 0,
    xpPerMin: 0,
    currentDPS: 0,
    zoneDifficultyMultiplier: 1,
    currentZone: 1
  })
  
  const { gold } = useEconomy()
  const { getTotalStats, xp, level } = useChar()
  const { buildings } = useTown()
  const { currentZone, getZoneDifficultyMultiplier } = useZoneProgression()
  
  // Track metrics over time
  useEffect(() => {
    let lastGold = gold
    let lastXP = xp
    let lastTime = Date.now()
    
    const interval = setInterval(() => {
      const now = Date.now()
      const deltaTime = (now - lastTime) / 1000 / 60 // minutes
      
      const goldGained = gold - lastGold
      const xpGained = xp - lastXP
      
      const goldPerMin = deltaTime > 0 ? goldGained / deltaTime : 0
      const xpPerMin = deltaTime > 0 ? xpGained / deltaTime : 0
      
      // Calculate current DPS
      const totalStats = getTotalStats()
      const buildingEffects = calculateBuildingEffects(buildings)
      const autoDamage = computeAutoDamage(totalStats, buildingEffects, level)
      const autoAPS = computeAutoAPS(totalStats, buildingEffects)
      const currentDPS = autoDamage * autoAPS
      
      const zoneDifficultyMultiplier = getZoneDifficultyMultiplier(currentZone || 1)
      
      setMetrics({
        goldPerMin: goldPerMin || 0,
        xpPerMin: xpPerMin || 0,
        currentDPS,
        zoneDifficultyMultiplier,
        currentZone: currentZone || 1
      })
      
      lastGold = gold
      lastXP = xp
      lastTime = now
    }, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [gold, xp, getTotalStats, buildings, currentZone, getZoneDifficultyMultiplier])
  
  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        setIsVisible(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
  
  if (!isVisible) {
    return (
      <div className="debug-toggle">
        <button 
          onClick={() => setIsVisible(true)}
          className="debug-toggle-btn"
          title="Show debug overlay (or press `)"
        >
          📊
        </button>
      </div>
    )
  }
  
  return (
    <div className="debug-overlay">
      <div className="debug-header">
        <h3>Debug Metrics</h3>
        <button onClick={() => setIsVisible(false)} className="debug-close">×</button>
      </div>
      <div className="debug-content">
        <div className="debug-row">
          <span>Gold/min:</span>
          <span>{metrics.goldPerMin.toFixed(1)}</span>
        </div>
        <div className="debug-row">
          <span>XP/min:</span>
          <span>{metrics.xpPerMin.toFixed(1)}</span>
        </div>
        <div className="debug-row">
          <span>Auto DPS:</span>
          <span>{metrics.currentDPS.toFixed(1)}</span>
        </div>
        <div className="debug-row">
          <span>Zone:</span>
          <span>{metrics.currentZone}</span>
        </div>
        <div className="debug-row">
          <span>Difficulty:</span>
          <span>{metrics.zoneDifficultyMultiplier.toFixed(2)}x</span>
        </div>
      </div>
      <div className="debug-footer">
        Press ` to toggle
      </div>
    </div>
  )
}