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
      className={`flex-1 min-w-[280px] max-w-[400px] border-2 rounded-lg p-4 transition-all ${
        canAccess ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'
      }`}
      onClick={handleClick}
      style={{
        background: zone.isPrestige
          ? 'linear-gradient(135deg, #4c1d95, #1e1b4b)'
          : canAccess
            ? 'linear-gradient(135deg, #1e293b, #0f172a)'
            : 'linear-gradient(135deg, #374151, #1f2937)',
        borderColor: zone.isPrestige ? '#8b5cf6' : canAccess ? '#3b82f6' : '#6b7280'
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-lg font-bold text-text">{zone.name}</div>
        <div className="flex gap-2">
          {zone.isPrestige && <div className="bg-purple text-white px-2 py-0.5 rounded text-xs font-bold">PRESTIGE</div>}
          {!canAccess && <div className="text-xl">🔒</div>}
        </div>
      </div>

      <div className="text-sm text-muted mb-3">{zone.description}</div>

      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        <div className="flex-1 min-w-[80px]">
          <span className="text-muted">Zone Level:</span>
          <span className="text-text font-bold ml-1">{zoneLevel}</span>
        </div>
        <div className="flex-1 min-w-[80px]">
          <span className="text-muted">Difficulty:</span>
          <span className="text-orange-400 font-bold ml-1">×{difficultyMultiplier.toFixed(1)}</span>
        </div>
        <div className="flex-1 min-w-[80px]">
          <span className="text-muted">Rewards:</span>
          <span className="text-green-400 font-bold ml-1">×{rewardMultiplier.toFixed(1)}</span>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xs text-muted mb-1">Materials:</div>
        <div className="flex flex-wrap gap-1">
          {zone.rewards.materials.map(material => (
            <span key={material} className="bg-purple/20 text-purple px-2 py-0.5 rounded text-[10px] font-medium">
              {material.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {!canAccess && (
        <div className="text-xs text-red-400 mt-2 text-center">{lockReason}</div>
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] backdrop-blur-sm">
      <div className="bg-panel border border-white/20 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-2xl font-bold text-text m-0">Select Zone</h2>
          <div className="flex items-center gap-4">
            {prestigeLevel > 0 && (
              <div className="text-sm text-muted">Prestige Level: <span className="text-gold font-bold">{prestigeLevel}</span></div>
            )}
            {canPrestige() && (
              <button
                className="bg-gradient-to-r from-purple to-pink-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition-all hover:scale-105"
                onClick={handlePrestige}
              >
                🌟 PRESTIGE 🌟
              </button>
            )}
            <button
              className="w-8 h-8 bg-white/10 hover:bg-white/20 text-text rounded flex items-center justify-center transition-colors"
              onClick={handleClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-4">
            {zones.map(zone => (
              <ZoneCard
                key={zone.id}
                zoneId={zone.id}
                onSelect={handleZoneSelect}
              />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-blue-500/10">
          <p className="text-sm text-muted text-center m-0">
            💡 Clearing zones multiple times increases difficulty but also rewards!
          </p>
        </div>
      </div>
    </div>
  )
}