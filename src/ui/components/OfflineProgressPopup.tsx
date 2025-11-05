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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] backdrop-blur-sm">
      <div className="bg-panel border border-gold/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(225,184,102,0.3)] animate-slide-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gold mb-2">🌙 Welcome Back!</h2>
          <div className="text-muted text-sm">
            You were away for {progress.timeOfflineFormatted}
          </div>
        </div>

        <div>
          <p className="text-text text-sm mb-4 text-center">
            Your town continued to prosper while you were away! Here's what you earned:
          </p>

          <div className="bg-black/30 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span className="text-muted text-sm">Gold:</span>
              </div>
              <span className="text-gold font-bold">+{progress.gold.toLocaleString()}</span>
            </div>

            {Object.entries(progress.materials).map(([material, amount]) => (
              <div key={material} className="flex items-center justify-between py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📦</span>
                  <span className="text-muted text-sm">{material.charAt(0).toUpperCase() + material.slice(1)}:</span>
                </div>
                <span className="text-text font-bold">+{amount}</span>
              </div>
            ))}

            {progress.intelligenceBonus > 0 && (
              <div className="flex items-center justify-between py-2 bg-purple/20 rounded px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧠</span>
                  <span className="text-purple text-sm font-medium">INT Bonus:</span>
                </div>
                <span className="text-purple font-bold">+{progress.intelligenceBonus.toFixed(0)}%</span>
              </div>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <small className="text-xs text-muted leading-relaxed block">
              💡 Offline progress runs at 25% efficiency and is capped at 6 hours.
              <br />
              ✨ Increase your Intelligence stat to boost offline gains (each INT = +2% efficiency)!
              <br />
              🌟 Upgrade "Mystic Presence" in the Prestige tab for even more offline rewards!
            </small>
          </div>
        </div>

        <div className="flex justify-center">
          <button className="bg-gradient-to-r from-gold to-yellow-600 text-bg font-bold py-3 px-8 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(225,184,102,0.5)] active:scale-95" onClick={handleClaim}>
            Claim Rewards
          </button>
        </div>
      </div>
    </div>
  )
}