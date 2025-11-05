import React from 'react'
import { useMetaStore } from '../state/metaStore'
import { useZoneProgression } from '../state/zoneProgressionStore'

export default function PrestigePanel() {
  const { upgrades, purchaseUpgrade, getUpgradeCost } = useMetaStore()
  const { prestigeTokens, prestigeLevel, zoneProgress, canPrestige, performPrestige } = useZoneProgression()

  const handlePurchaseUpgrade = (upgradeId: string) => {
    const cost = getUpgradeCost(upgradeId)
    if (prestigeTokens >= cost) {
      purchaseUpgrade(upgradeId)
    }
  }

  const canAffordUpgrade = (upgradeId: string) => {
    const cost = getUpgradeCost(upgradeId)
    const upgrade = upgrades[upgradeId]
    return prestigeTokens >= cost && upgrade.currentLevel < upgrade.maxLevel
  }

  // Calculate potential prestige tokens
  const calculatePotentialTokens = () => {
    let earnedTokens = 10 // Base tokens
    
    for (const progress of Object.values(zoneProgress)) {
      if (progress.isUnlocked) {
        const zoneBonus = Math.floor(progress.zoneId * 2)
        const levelBonus = Math.floor((progress.level - 1) * 1.5)
        earnedTokens += zoneBonus + levelBonus
      }
    }
    
    const prestigeMultiplier = 1 + (prestigeLevel * 0.15)
    return Math.floor(earnedTokens * prestigeMultiplier)
  }

  const potentialTokens = canPrestige() ? calculatePotentialTokens() : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text m-0">Prestige Upgrades</h2>
        <div className="flex gap-4 text-sm">
          <div className="text-muted">Prestige Level: <span className="text-gold font-bold">{prestigeLevel}</span></div>
          <div className="text-gold font-bold">🌟 {prestigeTokens} Tokens</div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-sm text-muted m-0 mb-2">
          Spend prestige tokens to purchase permanent upgrades that persist through all future prestiges.
          Prestige tokens are earned by completing zones and then performing prestige.
        </p>
        {canPrestige() && (
          <div className="bg-gradient-to-r from-gold/20 to-yellow-600/20 border border-gold/50 rounded-lg p-4 mt-3">
            <h3 className="text-lg font-bold text-gold m-0 mb-2">✨ Prestige Available!</h3>
            <p className="text-sm text-text m-0 mb-2">
              You can prestige now and earn <strong className="text-gold">🌟 {potentialTokens} tokens</strong>!
            </p>
            <p className="text-xs text-muted m-0 mb-3">
              Token Formula: Base (10) + Zones ({Object.values(zoneProgress).filter(p => p.isUnlocked).length} × 2)
              + Zone Clears × 1.5 × Prestige Multiplier ({(1 + prestigeLevel * 0.15).toFixed(2)}×)
            </p>
            <button
              className="w-full bg-gradient-to-r from-gold to-yellow-600 text-bg font-bold py-3 px-4 rounded cursor-pointer transition-all hover:scale-105 mb-2"
              onClick={performPrestige}
            >
              Perform Prestige (+{potentialTokens} 🌟)
            </button>
            <small className="text-xs text-red-400 block text-center">
              ⚠️ This will reset your character, zones, and inventory!
            </small>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.values(upgrades).map(upgrade => (
          <div key={upgrade.id} className="flex-1 min-w-[300px] bg-panel border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-text m-0">{upgrade.name}</h3>
              <div className="text-xs text-muted">
                Level {upgrade.currentLevel}/{upgrade.maxLevel}
              </div>
            </div>

            <div className="text-sm text-muted mb-2">
              {upgrade.description}
            </div>

            <div className="text-xs text-text mb-1">
              Current: <span className="text-green-400">{upgrade.getDescription(upgrade.currentLevel)}</span>
            </div>

            {upgrade.currentLevel < upgrade.maxLevel && (
              <div className="text-xs text-muted mb-3">
                Next: <span className="text-blue-400">{upgrade.getDescription(upgrade.currentLevel + 1)}</span>
              </div>
            )}

            <div>
              {upgrade.currentLevel < upgrade.maxLevel ? (
                <button
                  className={`w-full py-2 px-3 rounded font-bold text-sm transition-all ${
                    canAffordUpgrade(upgrade.id)
                      ? 'bg-gold hover:bg-yellow-600 text-bg cursor-pointer hover:scale-105'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => handlePurchaseUpgrade(upgrade.id)}
                  disabled={!canAffordUpgrade(upgrade.id)}
                >
                  {canAffordUpgrade(upgrade.id) ? 'Purchase' : 'Cannot Afford'}
                  <span className="ml-2">🌟 {getUpgradeCost(upgrade.id)}</span>
                </button>
              ) : (
                <div className="text-center text-green-400 font-bold py-2">MAX LEVEL</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}