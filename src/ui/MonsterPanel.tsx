import { useEffect, useState, useCallback } from 'react'
import { useCombat } from '@/state/combatStore'
import { useChar } from '@/state/charStore'
import { useTown } from '@/state/townStore'
import { useZoneProgression } from '@/state/zoneProgressionStore'
import { getZone } from '@/data/zones'
import { shouldAutoAttackMiss } from '@/data/monsters'
import { computeAutoDamage, computeAutoAPS } from '@/systems/math'
import { calculateBuildingEffects } from '@/data/buildings'
import DamageNumberContainer, { type DamageNumber } from '@/ui/components/DamageNumberContainer'
import DPSPanel from '@/ui/components/DPSPanel'

const MonsterPanel = () => {
  const { 
    monsterHP, 
    monsterMaxHP,
    monsterAC,
    monsterName,
    monsterImage,
    isBoss, 
    bossTimer, 
    click, 
    tryBoss, 
    canTryBoss,
    onMonsterDeath,
    setDamageCallback,
    affixes
  } = useCombat()
  
  const { currentZone: zone } = useZoneProgression()
  const [showZoneTooltip, setShowZoneTooltip] = useState(false)
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([])
  const totalStats = useChar.getState().getTotalStats()
  const currentZone = getZone(zone || 1)
  const { getZoneLevel } = useZoneProgression()
  
  // Add damage number when click happens
  const addDamageNumber = useCallback((damage: number, isCrit: boolean = false, isMiss: boolean = false) => {
    console.log('addDamageNumber called with:', { damage, isCrit, isMiss })

    // Use fixed position for testing
    const x = 300 + (Math.random() - 0.5) * 40
    const y = 300 + (Math.random() - 0.5) * 20

    const damageNumber: DamageNumber = {
      id: Date.now() + Math.random().toString(),
      damage,
      isCrit,
      isMiss,
      x,
      y,
      timestamp: Date.now()
    }

    console.log('Adding damage number:', damageNumber)
    setDamageNumbers(prev => {
      const newNumbers = [...prev, damageNumber]
      console.log('Damage numbers updated from', prev.length, 'to', newNumbers.length)
      return newNumbers
    })
  }, [])

  // Remove damage number after animation
  const removeDamageNumber = useCallback((id: string) => {
    console.log('Removing damage number:', id)
    setDamageNumbers(prev => {
      const filtered = prev.filter(num => num.id !== id)
      console.log('Damage numbers after removal:', prev.length, '->', filtered.length)
      return filtered
    })
  }, [])

  // Set up damage callback
  useEffect(() => {
    console.log('Setting damage callback in useEffect')
    setDamageCallback(addDamageNumber)
  }, [addDamageNumber, setDamageCallback])

  // Auto-attack system
  useEffect(() => {
    // Get building effects for auto-clicker
    const townBuildings = useTown.getState().buildings
    const buildingEffects = calculateBuildingEffects(townBuildings)
    
    const attacksPerSecond = computeAutoAPS(totalStats, buildingEffects)
    
    // Absolutely no auto-attacks if no auto-clicker buildings or attacksPerSecond is 0
    if (attacksPerSecond <= 0 || monsterHP <= 0) return
    
    // Double-check that we actually have auto-clicker capability
    if (!buildingEffects.autoClicker || buildingEffects.autoClicker <= 0) return

    const attackInterval = 1000 / attacksPerSecond // milliseconds
    const intervalId = setInterval(() => {
      const currentHP = useCombat.getState().monsterHP
      if (currentHP <= 0) return

      // Get fresh building effects for damage calculation
      const currentTownBuildings = useTown.getState().buildings
      const currentBuildingEffects = calculateBuildingEffects(currentTownBuildings)
      
      // Check if auto attack should miss due to monster affixes
      const currentMonster = useCombat.getState().monster
      if (currentMonster && shouldAutoAttackMiss(currentMonster)) {
        return // Auto attack misses
      }
      
      const charLevel = useChar.getState().level
      const damage = computeAutoDamage(totalStats, currentBuildingEffects, charLevel)
      
      // No damage if calculated damage is 0 or negative
      if (damage <= 0) return
      
      const newHP = Math.max(0, currentHP - damage)
      
      if (newHP === 0) {
        useCombat.getState().onMonsterDeath()
      } else {
        useCombat.setState({ monsterHP: newHP })
      }
    }, attackInterval)

    return () => clearInterval(intervalId)
  }, [totalStats, monsterHP, onMonsterDeath])

  // Boss timer countdown
  useEffect(() => {
    if (!isBoss || bossTimer === null || bossTimer <= 0) return

    const intervalId = setInterval(() => {
      const currentTimer = useCombat.getState().bossTimer
      if (currentTimer === null || currentTimer <= 0) return

      const newTimer = Math.max(0, currentTimer - 0.1)
      
      if (newTimer <= 0 && useCombat.getState().monsterHP > 0) {
        // Boss fight failed - go back to regular monster
        const state = useCombat.getState()
        const currentZone = useZoneProgression.getState().currentZone || 1
        const newMonster = state.createMonsterData(currentZone, false)
        useCombat.setState({
          ...newMonster,
          bossTimer: null,
          canTryBoss: true
        })
      } else {
        useCombat.setState({ bossTimer: newTimer })
      }
    }, 100) // Update every 100ms for smooth timer

    return () => clearInterval(intervalId)
  }, [isBoss, bossTimer])

  const healthPercent = Math.max(0, Math.min(100, (monsterHP / monsterMaxHP) * 100))
  const formattedBossTimer = bossTimer?.toFixed(1)

  return (
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
      <DPSPanel />
      <div className="relative">
        <DamageNumberContainer
          damageNumbers={damageNumbers}
          onRemoveDamageNumber={removeDamageNumber}
        />
        <div className="flex justify-between items-center">
          <div className="relative">
            <button
              className="bg-transparent border-none text-text cursor-pointer text-sm px-2 py-1 rounded hover:bg-white/5 transition-colors"
              onMouseEnter={() => setShowZoneTooltip(true)}
              onMouseLeave={() => setShowZoneTooltip(false)}
              onFocus={() => setShowZoneTooltip(true)}
              onBlur={() => setShowZoneTooltip(false)}
              aria-label={`${currentZone.name} information`}
            >
              <b>{currentZone.name}</b>
              {isBoss && ' — Boss!'}
              <span className="ml-1 opacity-70">ℹ️</span>
            </button>

            {showZoneTooltip && (
              <div className="absolute top-full left-0 mt-2 bg-panel border border-white/20 rounded-lg p-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-50 min-w-[280px] animate-tooltip-fade-in">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                  <strong className="text-text">{currentZone.name}</strong>
                  <span className="bg-gold/20 text-gold px-2 py-0.5 rounded text-xs font-bold">Level {getZoneLevel(zone || 1)}</span>
                </div>
                <div className="text-sm text-muted mb-3">
                  {currentZone.description}
                </div>
                <div>
                  <div className="text-xs font-bold text-muted uppercase mb-2">Available Materials:</div>
                  <div className="flex flex-wrap gap-1">
                    {currentZone.rewards.materials.map(material => (
                      <span key={material} className="bg-purple/20 text-purple px-2 py-1 rounded text-xs font-medium border border-purple/30">
                        {material.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {isBoss && <span>⏱ {formattedBossTimer}s</span>}
            <button
              className="bg-[#1a1f2a] border border-white/10 rounded-lg px-3 py-2 cursor-pointer text-xl hover:bg-[#222a3a] hover:border-white/20 transition-all"
              onClick={() => useZoneProgression.getState().showZoneSelect()}
              title="Select Zone"
            >
              🗺️
            </button>
          </div>
        </div>

        <button
          className="relative w-full bg-[#1a1f2a] border-2 border-white/10 rounded-xl p-6 mt-3 mb-3 cursor-pointer transition-all hover:border-white/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:scale-[0.98]"
          onClick={() => {
            console.log('Monster clicked!')
            click()
          }}
          aria-label="Attack monster"
        >
          <div className="text-center">
            <div className="text-lg flex items-center justify-center gap-2">
              {monsterImage.startsWith('/') || monsterImage.startsWith('http') ? (
                <img
                  src={monsterImage}
                  alt={monsterName}
                  className="w-12 h-12 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span>{monsterImage}</span>
              )}
              <span>{monsterName}</span>
            </div>
            <div className="text-xs text-muted mt-1 flex justify-center items-center gap-1">
              <span className="text-sm">🛡️</span>
              <span>AC {monsterAC}</span>
            </div>
            {affixes && affixes.length > 0 && (
              <div className="flex justify-center gap-1 mt-2 flex-wrap">
                {affixes.map(affix => (
                  <span
                    key={affix.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-white rounded font-bold text-[11px] border border-white/20"
                    style={{
                      backgroundColor: affix.color,
                      boxShadow: `0 2px 4px ${affix.color}66`
                    }}
                    title={affix.description}
                  >
                    <span className="text-sm">{affix.icon}</span>
                    {affix.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-1.5">
              {Math.ceil(monsterHP)} / {Math.ceil(monsterMaxHP)} HP
            </div>
          </div>
          <div className="absolute left-3 right-3 bottom-3">
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 rounded-full"
                style={{ width: healthPercent + '%' }}
              />
            </div>
          </div>
        </button>

        {!isBoss && (
          <div className="mt-3">
            {canTryBoss ? (
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none rounded-lg px-6 py-3 font-bold text-base cursor-pointer transition-all hover:from-purple-500 hover:to-purple-600 hover:shadow-[0_4px_12px_rgba(168,85,247,0.4)] active:scale-[0.98]"
                onClick={tryBoss}
              >
                Fight Boss
              </button>
            ) : (
              <div className="text-center py-3 px-4 bg-black/20 rounded-lg border border-white/5">
                <span className="text-muted text-sm">Defeat more monsters to unlock boss</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MonsterPanel;
