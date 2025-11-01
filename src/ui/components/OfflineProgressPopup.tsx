import React from 'react'
import type { OfflineProgressResult } from '../../state/offlineProgressStore'
import { useEconomy } from '../../state/economyStore'

interface OfflineProgressPopupProps {
  readonly progress: OfflineProgressResult
  readonly onClaim: () => void
}

export default function OfflineProgressPopup({ progress, onClaim }: OfflineProgressPopupProps) {
  const handleClaim = () => {
    // Apply the offline progress to the player (gold and materials only, no XP/levels)
    const { addGold, addMaterial } = useEconomy.getState()
    
    // Add rewards
    addGold(progress.gold)
    
    // Add materials
    for (const [material, amount] of Object.entries(progress.materials)) {
      addMaterial(material, amount)
    }
    
    onClaim()
  }

  return (
    <div className="offline-progress-overlay">
      <div className="offline-progress-modal">
        <div className="offline-progress-header">
          <h2>🌙 Welcome Back!</h2>
          <div className="offline-time">
            You were away for {progress.timeOfflineFormatted}
          </div>
        </div>

        <div className="offline-progress-content">
          <p className="offline-description">
            Your town continued to prosper while you were away! Here's what you earned:
          </p>

          <div className="offline-rewards">
            <div className="reward-item">
              <span className="reward-icon">💰</span>
              <span className="reward-label">Gold:</span>
              <span className="reward-value">+{progress.gold.toLocaleString()}</span>
            </div>

            {Object.entries(progress.materials).map(([material, amount]) => (
              <div key={material} className="reward-item">
                <span className="reward-icon">📦</span>
                <span className="reward-label">{material.charAt(0).toUpperCase() + material.slice(1)}:</span>
                <span className="reward-value">+{amount}</span>
              </div>
            ))}

            {progress.intelligenceBonus > 0 && (
              <div className="reward-item intelligence-bonus">
                <span className="reward-icon">🧠</span>
                <span className="reward-label">INT Bonus:</span>
                <span className="reward-value">+{progress.intelligenceBonus.toFixed(0)}%</span>
              </div>
            )}
          </div>

          <div className="offline-note">
            <small>
              💡 Offline progress runs at 25% efficiency and is capped at 6 hours.
              <br />
              ✨ Increase your Intelligence stat to boost offline gains (each INT = +2% efficiency)!
              <br />
              🌟 Upgrade "Mystic Presence" in the Prestige tab for even more offline rewards!
            </small>
          </div>
        </div>

        <div className="offline-progress-actions">
          <button className="claim-button" onClick={handleClaim}>
            Claim Rewards
          </button>
        </div>
      </div>
    </div>
  )
}