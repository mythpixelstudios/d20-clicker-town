import React from 'react'
import { useZoneProgression } from '@/state/zoneProgressionStore'
import { useChar } from '@/state/charStore'
import { zones, getZone } from '@/data/zones'

interface ZoneCardProps {
  readonly zoneId: number
  readonly onSelect: (zoneId: number) => void
}

function ZoneCard({ zoneId, onSelect }: ZoneCardProps) {
  const { getZoneLevel, getZoneDifficultyMultiplier, getZoneRewardMultiplier, isZoneUnlocked } = useZoneProgression()
  const { level: playerLevel } = useChar()
  const zone = getZone(zoneId)
  const zoneLevel = getZoneLevel(zoneId)
  const difficultyMultiplier = getZoneDifficultyMultiplier(zoneId)
  const rewardMultiplier = getZoneRewardMultiplier(zoneId)
  const isUnlocked = isZoneUnlocked(zoneId)

  // Check unlock requirements
  let canAccess = isUnlocked
  let lockReason = ''

  if (zone.unlockRequirement) {
    if (zone.unlockRequirement.type === 'level' && playerLevel < zone.unlockRequirement.value) {
      canAccess = false
      lockReason = `Requires level ${zone.unlockRequirement.value}`
    }
  }

  const handleClick = () => {
    if (canAccess) {
      onSelect(zoneId)
    }
  }

  return (
    <div 
      className={`zone-card ${canAccess ? 'unlocked' : 'locked'} ${zone.isPrestige ? 'prestige' : ''}`}
      onClick={handleClick}
      style={{
        background: zone.isPrestige 
          ? 'linear-gradient(135deg, #4c1d95, #1e1b4b)' 
          : canAccess 
            ? 'linear-gradient(135deg, #1e293b, #0f172a)'
            : 'linear-gradient(135deg, #374151, #1f2937)',
        borderColor: zone.isPrestige ? '#8b5cf6' : canAccess ? '#3b82f6' : '#6b7280',
        cursor: canAccess ? 'pointer' : 'not-allowed',
        opacity: canAccess ? 1 : 0.6
      }}
    >
      <div className="zone-header">
        <div className="zone-name">{zone.name}</div>
        {zone.isPrestige && <div className="prestige-badge">PRESTIGE</div>}
        {!canAccess && <div className="zone-lock-badge">🔒</div>}
      </div>
      
      <div className="zone-description">{zone.description}</div>
      
      <div className="zone-stats">
        <div className="zone-level">
          <span className="stat-label">Zone Level:</span>
          <span className="stat-value">{zoneLevel}</span>
        </div>
        <div className="zone-difficulty">
          <span className="stat-label">Difficulty:</span>
          <span className="stat-value">×{difficultyMultiplier.toFixed(1)}</span>
        </div>
        <div className="zone-rewards">
          <span className="stat-label">Rewards:</span>
          <span className="stat-value">×{rewardMultiplier.toFixed(1)}</span>
        </div>
      </div>

      <div className="zone-materials">
        <div className="materials-label">Materials:</div>
        <div className="materials-list">
          {zone.rewards.materials.map(material => (
            <span key={material} className="material-tag">
              {material.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {!canAccess && (
        <div className="lock-reason">{lockReason}</div>
      )}
    </div>
  )
}

export default function ZoneSelectionScreen() {
  const { selectZone, hideZoneSelect, canPrestige, performPrestige, prestigeLevel } = useZoneProgression()

  const handleZoneSelect = (zoneId: number) => {
    selectZone(zoneId)
  }

  const handlePrestige = () => {
    if (canPrestige()) {
      performPrestige()
    }
  }

  const handleClose = () => {
    hideZoneSelect()
  }

  return (
    <div className="zone-selection-overlay">
      <div className="zone-selection-modal">
        <div className="zone-selection-header">
          <h2>Select Zone</h2>
          <div className="prestige-info">
            {prestigeLevel > 0 && (
              <div className="prestige-level">Prestige Level: {prestigeLevel}</div>
            )}
            {canPrestige() && (
              <button className="prestige-button" onClick={handlePrestige}>
                🌟 PRESTIGE 🌟
              </button>
            )}
          </div>
          <button className="close-button" onClick={handleClose}>✕</button>
        </div>

        <div className="zone-selection-content">
          <div className="zones-grid">
            {zones.map(zone => (
              <ZoneCard
                key={zone.id}
                zoneId={zone.id}
                onSelect={handleZoneSelect}
              />
            ))}
          </div>
        </div>

        <div className="zone-selection-footer">
          <p className="zone-hint">
            💡 Clearing zones multiple times increases difficulty but also rewards!
          </p>
        </div>
      </div>
    </div>
  )
}