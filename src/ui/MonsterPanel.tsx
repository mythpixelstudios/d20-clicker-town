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
    setDamageNumbers(prev => prev.filter(num => num.id !== id))
  }, [])

  // Set up damage callback
  useEffect(() => {
    console.log('Setting damage callback in useEffect')
    setDamageCallback(addDamageNumber)
  }, [])

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
    <div className="card">
      <DPSPanel />
      <div className="monster-area" style={{ position: 'relative' }}>
        <DamageNumberContainer 
          damageNumbers={damageNumbers} 
          onRemoveDamageNumber={removeDamageNumber} 
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              className="zone-info-button"
              onMouseEnter={() => setShowZoneTooltip(true)}
              onMouseLeave={() => setShowZoneTooltip(false)}
              onFocus={() => setShowZoneTooltip(true)}
              onBlur={() => setShowZoneTooltip(false)}
              aria-label={`${currentZone.name} information`}
            >
              <b>{currentZone.name}</b>
              {isBoss && ' — Boss!'}
              <span style={{ marginLeft: 4, opacity: 0.7 }}>ℹ️</span>
            </button>
            
            {showZoneTooltip && (
              <div className="zone-materials-tooltip">
                <div className="tooltip-header">
                  <strong>{currentZone.name}</strong>
                  <span className="zone-level-badge">Level {getZoneLevel(zone || 1)}</span>
                </div>
                <div className="tooltip-description">
                  {currentZone.description}
                </div>
                <div className="tooltip-section">
                  <div className="tooltip-section-title">Available Materials:</div>
                  <div className="materials-tooltip-list">
                    {currentZone.rewards.materials.map(material => (
                      <span key={material} className="material-tooltip-tag">
                        {material.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isBoss && <span>⏱ {formattedBossTimer}s</span>}
            <button 
              className="zone-select-button"
              onClick={() => useZoneProgression.getState().showZoneSelect()}
              title="Select Zone"
            >
              🗺️
            </button>
          </div>
        </div>
        
        <button 
          className="monster-square" 
          onClick={() => {
            console.log('Monster clicked!')
            click()
          }}
          aria-label="Attack monster"
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>
              {monsterImage} {monsterName}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: '#a0aec0', 
              marginTop: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4
            }}>
              <span style={{ fontSize: 14 }}>🛡️</span>
              <span>AC {monsterAC}</span>
            </div>
            {affixes && affixes.length > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 4, 
                marginTop: 8,
                flexWrap: 'wrap'
              }}>
                {affixes.map(affix => (
                  <span 
                    key={affix.id}
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '4px 8px',
                      backgroundColor: affix.color,
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: `0 2px 4px ${affix.color}66`,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                    title={affix.description}
                  >
                    <span style={{ fontSize: '14px' }}>{affix.icon}</span>
                    {affix.name}
                  </span>
                ))}
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              {Math.ceil(monsterHP)} / {Math.ceil(monsterMaxHP)} HP
            </div>
          </div>
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
            <div className="progress">
              <span style={{ width: healthPercent + '%' }} />
            </div>
          </div>
        </button>
        
        {!isBoss && (
          <div className="boss-controls">
            {canTryBoss ? (
              <button className="boss-button" onClick={tryBoss}>
                Fight Boss
              </button>
            ) : (
              <div className="boss-locked">
                <span className="muted">Defeat more monsters to unlock boss</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MonsterPanel;
