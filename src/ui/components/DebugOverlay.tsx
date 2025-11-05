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
      <div className="fixed bottom-4 right-4 z-[9999]">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-panel border border-white/20 rounded-lg px-3 py-2 text-2xl cursor-pointer transition-all hover:bg-white/10 hover:scale-110 shadow-card"
          title="Show debug overlay (or press `)"
        >
          📊
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-panel border border-white/20 rounded-lg p-4 min-w-[200px] z-[9999] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
        <h3 className="m-0 text-text text-sm font-bold">Debug Metrics</h3>
        <button onClick={() => setIsVisible(false)} className="bg-transparent border-0 text-muted text-xl cursor-pointer p-0 leading-none hover:text-text transition-colors">×</button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted">Gold/min:</span>
          <span className="text-text font-semibold">{metrics.goldPerMin.toFixed(1)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted">XP/min:</span>
          <span className="text-text font-semibold">{metrics.xpPerMin.toFixed(1)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted">Auto DPS:</span>
          <span className="text-text font-semibold">{metrics.currentDPS.toFixed(1)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted">Zone:</span>
          <span className="text-text font-semibold">{metrics.currentZone}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted">Difficulty:</span>
          <span className="text-text font-semibold">{metrics.zoneDifficultyMultiplier.toFixed(2)}x</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-muted text-center">
        Press ` to toggle
      </div>
    </div>
  )
}