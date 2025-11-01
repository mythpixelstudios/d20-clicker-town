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
    <div className="prestige-panel">
      <div className="prestige-header">
        <h2>Prestige Upgrades</h2>
        <div className="prestige-stats">
          <div className="prestige-level">Prestige Level: {prestigeLevel}</div>
          <div className="prestige-tokens">🌟 {prestigeTokens} Tokens</div>
        </div>
      </div>

      <div className="prestige-description">
        <p>
          Spend prestige tokens to purchase permanent upgrades that persist through all future prestiges.
          Prestige tokens are earned by completing zones and then performing prestige.
        </p>
        {canPrestige() && (
          <div className="prestige-available-notice">
            <h3>✨ Prestige Available!</h3>
            <p>
              You can prestige now and earn <strong>🌟 {potentialTokens} tokens</strong>!
            </p>
            <p className="prestige-formula-hint">
              Token Formula: Base (10) + Zones ({Object.values(zoneProgress).filter(p => p.isUnlocked).length} × 2) 
              + Zone Clears × 1.5 × Prestige Multiplier ({(1 + prestigeLevel * 0.15).toFixed(2)}×)
            </p>
            <button 
              className="prestige-action-button" 
              onClick={performPrestige}
            >
              Perform Prestige (+{potentialTokens} 🌟)
            </button>
            <small className="prestige-warning">
              ⚠️ This will reset your character, zones, and inventory!
            </small>
          </div>
        )}
      </div>

      <div className="meta-upgrades-grid">
        {Object.values(upgrades).map(upgrade => (
          <div key={upgrade.id} className="meta-upgrade-card">
            <div className="upgrade-header">
              <h3>{upgrade.name}</h3>
              <div className="upgrade-level">
                Level {upgrade.currentLevel}/{upgrade.maxLevel}
              </div>
            </div>
            
            <div className="upgrade-description">
              {upgrade.description}
            </div>
            
            <div className="upgrade-effect">
              Current: {upgrade.getDescription(upgrade.currentLevel)}
            </div>
            
            {upgrade.currentLevel < upgrade.maxLevel && (
              <div className="upgrade-next">
                Next: {upgrade.getDescription(upgrade.currentLevel + 1)}
              </div>
            )}
            
            <div className="upgrade-actions">
              {upgrade.currentLevel < upgrade.maxLevel ? (
                <button
                  className={`upgrade-button ${canAffordUpgrade(upgrade.id) ? 'affordable' : 'expensive'}`}
                  onClick={() => handlePurchaseUpgrade(upgrade.id)}
                  disabled={!canAffordUpgrade(upgrade.id)}
                >
                  {canAffordUpgrade(upgrade.id) ? 'Purchase' : 'Cannot Afford'}
                  <span className="upgrade-cost">🌟 {getUpgradeCost(upgrade.id)}</span>
                </button>
              ) : (
                <div className="upgrade-maxed">MAX LEVEL</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}