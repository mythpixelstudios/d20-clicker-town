import { useState } from 'react'
import { useChar } from '@/state/charStore'
import { useTown } from '@/state/townStore'
import { computeClickDamage, computeAutoDamage, computeAutoAPS } from '@/systems/math'
import { calculateBuildingEffects } from '@/data/buildings'

export default function DPSPanel() {
  const { getTotalStats, statPoints, level } = useChar()
  const { buildings } = useTown()
  const [isOpen, setIsOpen] = useState(true)

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
    <div className="bg-panel border border-white/[0.06] rounded-xl shadow-card mb-3">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-transparent border-none cursor-pointer hover:bg-white/5 transition-colors rounded-xl"
        aria-expanded={isOpen}
        aria-label="Toggle DPS Overview"
      >
        <h3 className="m-0 text-text text-base">DPS Overview</h3>
        <span className={`text-text transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4 flex flex-col gap-3">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs font-bold text-muted uppercase mb-2 tracking-wide">Current</div>
            <div className="flex justify-between items-center mb-1.5 text-sm">
              <span className="text-muted">Click Damage:</span>
              <span className="text-text font-semibold">{clickDamage.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center mb-1.5 text-sm">
              <span className="text-muted">Auto DPS:</span>
              <div className="flex items-center gap-2">
                <span className="text-text font-semibold">{autoDPS.toFixed(1)}</span>
                <span className="text-[10px] text-muted">({autoDamage.toFixed(1)} × {autoAPS.toFixed(2)}/s)</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm">
              <span className="text-text font-bold">Total Auto DPS:</span>
              <span className="text-gold font-bold">{totalDPS.toFixed(1)}</span>
            </div>
          </div>

          {statPoints > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="text-xs font-bold text-muted uppercase mb-2 tracking-wide">Best Next Upgrade</div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text font-medium">{bestUpgrade.label}:</span>
                <div className="flex items-center gap-2">
                  <span className="text-text font-semibold">
                    {bestUpgrade.clickDamage.toFixed(1)} click
                    {bestUpgrade.autoAPS > 0 && ` / ${(bestUpgrade.autoDamage * bestUpgrade.autoAPS).toFixed(1)} DPS`}
                  </span>
                  <span className="text-green-500 font-bold text-xs">
                    (+{(bestUpgrade.clickDamage - clickDamage).toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}