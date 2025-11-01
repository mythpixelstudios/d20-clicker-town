import { useChar } from '@/state/charStore'
import { useTown } from '@/state/townStore'
import { computeClickDamage, computeAutoDamage, computeAutoAPS } from '@/systems/math'
import { calculateBuildingEffects } from '@/data/buildings'

export default function DPSPanel() {
  const { getTotalStats, statPoints, level } = useChar()
  const { buildings } = useTown()
  
  const totalStats = getTotalStats()
  const buildingEffects = calculateBuildingEffects(buildings)
  
  // Current DPS calculations
  const clickDamage = computeClickDamage(totalStats, level)
  const autoDamage = computeAutoDamage(totalStats, buildingEffects, level)
  const autoAPS = computeAutoAPS(totalStats, buildingEffects)
  const autoDPS = autoDamage * autoAPS
  const totalDPS = autoDPS // Click DPS not included since it's manual
  
  // Projected DPS after next upgrade for different stats
  const projections = {
    str: {
      stats: { ...totalStats, str: totalStats.str + 1 },
      label: 'Next STR'
    },
    wis: {
      stats: { ...totalStats, wis: totalStats.wis + 1 },
      label: 'Next WIS'
    },
    int: {
      stats: { ...totalStats, int: totalStats.int + 1 },
      label: 'Next INT'
    },
    dex: {
      stats: { ...totalStats, dex: totalStats.dex + 1 },
      label: 'Next DEX'
    }
  }
  
  const projectedValues = Object.entries(projections).map(([key, { stats, label }]) => ({
    stat: key,
    label,
    clickDamage: computeClickDamage(stats, level),
    autoDamage: computeAutoDamage(stats, buildingEffects, level),
    autoAPS: computeAutoAPS(stats, buildingEffects)
  }))
  
  // Find best upgrade option
  const bestUpgrade = projectedValues.reduce((best, current) => {
    const currentGain = (current.clickDamage - clickDamage) + ((current.autoDamage * current.autoAPS) - autoDPS)
    const bestGain = (best.clickDamage - clickDamage) + ((best.autoDamage * best.autoAPS) - autoDPS)
    return currentGain > bestGain ? current : best
  }, projectedValues[0])
  
  return (
    <div className="dps-panel">
      <div className="dps-header">
        <h3>DPS Overview</h3>
      </div>
      <div className="dps-stats">
        <div className="dps-section">
          <div className="dps-section-title">Current</div>
          <div className="dps-row">
            <span className="dps-label">Click Damage:</span>
            <span className="dps-value">{clickDamage.toFixed(1)}</span>
          </div>
          <div className="dps-row">
            <span className="dps-label">Auto DPS:</span>
            <span className="dps-value">{autoDPS.toFixed(1)}</span>
            <span className="dps-breakdown">({autoDamage.toFixed(1)} × {autoAPS.toFixed(2)}/s)</span>
          </div>
          <div className="dps-row total">
            <span className="dps-label">Total Auto DPS:</span>
            <span className="dps-value">{totalDPS.toFixed(1)}</span>
          </div>
        </div>
        
        {statPoints > 0 && (
          <div className="dps-section">
            <div className="dps-section-title">Best Next Upgrade</div>
            <div className="dps-row projection highlight">
              <span className="dps-label">{bestUpgrade.label}:</span>
              <span className="dps-value">
                {bestUpgrade.clickDamage.toFixed(1)} click 
                {bestUpgrade.autoAPS > 0 && ` / ${(bestUpgrade.autoDamage * bestUpgrade.autoAPS).toFixed(1)} DPS`}
              </span>
              <span className="dps-gain">
                (+{(bestUpgrade.clickDamage - clickDamage).toFixed(1)})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}