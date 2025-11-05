import React from 'react'
import { useChar } from '@/state/charStore'
import { useTown } from '@/state/townStore'
import { rarityInfo } from '@/data/equipment'
import type { Equipment } from '@/data/equipment'

type EquipmentTooltipProps = {
  readonly equipment: Equipment
  readonly onEquip?: () => void
  readonly onBreakdown?: () => void
  readonly onClose?: () => void
}

const statNames = {
  str: 'Strength',
  dex: 'Dexterity', 
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom'
}

const slotNames = {
  weapon: 'Weapon',
  helmet: 'Helmet',
  chest: 'Chest Armor',
  legs: 'Leg Armor', 
  boots: 'Boots',
  gloves: 'Gloves'
}

export default function EquipmentTooltip({ equipment, onEquip, onBreakdown, onClose }: EquipmentTooltipProps) {
  const { equipped } = useChar()
  const { getBuilding } = useTown()
  
  const rarity = rarityInfo[equipment.rarity as keyof typeof rarityInfo]
  const currentEquipped = equipped[equipment.slot]
  const blacksmithBuilding = getBuilding('blacksmith')
  const blacksmithLevel = blacksmithBuilding?.level || 0
  const canBreakdown = blacksmithLevel > 0

  // Calculate stat comparison
  const getStatComparison = (stat: keyof typeof statNames) => {
    const newValue = equipment.stats[stat] || 0
    const currentValue = currentEquipped?.stats[stat] || 0
    const difference = newValue - currentValue
    
    return {
      newValue,
      currentValue,
      difference,
      isUpgrade: difference > 0,
      isDowngrade: difference < 0
    }
  }

  // Calculate breakdown rewards
  const getBreakdownRewards = () => {
    // Use the same calculation as the economy store
    const rarityMultipliers = {
      common: 1,
      uncommon: 1.2,
      rare: 1.5,
      epic: 2,
      legendary: 3
    }
    
    const multiplier = rarityMultipliers[equipment.rarity as keyof typeof rarityMultipliers] || 1
    const baseRewards: Record<string, number> = {
      'iron': Math.max(1, Math.floor(equipment.level * 0.3 * multiplier)),
      'wood': Math.max(1, Math.floor(equipment.level * 0.2 * multiplier)),
      'fiber': Math.max(1, Math.floor(equipment.level * 0.1 * multiplier))
    }

    // Add bonus materials for higher rarity (same logic as economy store)
    if (equipment.rarity === 'rare' || equipment.rarity === 'epic' || equipment.rarity === 'legendary') {
      baseRewards['crystal'] = Math.max(1, Math.floor(equipment.level * 0.1 * multiplier))
    }
    if (equipment.rarity === 'epic' || equipment.rarity === 'legendary') {
      baseRewards['magic dust'] = Math.max(1, Math.floor(equipment.level * 0.05 * multiplier))
    }
    if (equipment.rarity === 'legendary') {
      baseRewards['gemstones'] = Math.max(1, Math.floor(equipment.level * 0.03 * multiplier))
    }
    
    return baseRewards
  }

  const breakdownRewards = getBreakdownRewards()

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] backdrop-blur-sm">
      <div className="bg-panel border-2 rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-md w-full mx-4 relative" style={{ borderColor: rarity.color }}>
        <div className="mb-4 pb-3 border-b border-white/10">
          <div className="text-lg font-bold mb-1" style={{ color: rarity.color }}>
            {equipment.name}
          </div>
          <div className="text-sm text-muted">{slotNames[equipment.slot]} • Level {equipment.level}</div>
          <div className="text-sm font-bold mt-1" style={{ color: rarity.color }}>
            {equipment.rarity.charAt(0).toUpperCase() + equipment.rarity.slice(1)}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-bold text-gold uppercase mb-2">Stats</div>
          <div className="space-y-1">
            {Object.entries(statNames).map(([statKey, statName]) => {
              const comparison = getStatComparison(statKey as keyof typeof statNames)
              if (comparison.newValue === 0) return null

              return (
                <div key={statKey} className="flex justify-between items-center text-sm">
                  <span className="text-muted">{statName}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text">+{comparison.newValue}</span>
                    {comparison.difference !== 0 && (
                      <span className={`text-xs font-bold ${comparison.isUpgrade ? 'text-green-400' : 'text-red-400'}`}>
                        ({comparison.difference > 0 ? '+' : ''}{comparison.difference})
                      </span>
                    )}
                    {!currentEquipped && comparison.newValue > 0 && (
                      <span className="text-xs font-bold text-green-400">
                        (+{comparison.newValue})
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {equipment.affixes && equipment.affixes.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-bold text-purple uppercase mb-2">Special Properties</div>
            <div className="space-y-1">
              {equipment.affixes.map((affix) => (
                <div key={affix.id} className="text-sm bg-purple/10 border border-purple/30 rounded px-2 py-1">
                  <span className="text-purple font-bold">{affix.name}:</span>
                  <span className="text-text ml-2">
                    {Object.entries(affix.stats).map(([statKey, value]) => (
                      <span key={statKey}>
                        +{value}{statKey.includes('Chance') || statKey.includes('Bonus') ? '%' : ''} {statKey}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentEquipped && (
          <div className="mb-4">
            <div className="text-xs font-bold text-muted uppercase mb-2">Currently Equipped</div>
            <div className="text-sm">
              <span style={{ color: rarityInfo[currentEquipped.rarity as keyof typeof rarityInfo].color }}>
                {currentEquipped.name}
              </span>
              <span className="text-muted"> (Level {currentEquipped.level})</span>
            </div>
          </div>
        )}

        {canBreakdown && (
          <div className="mb-4">
            <div className="text-xs font-bold text-muted uppercase mb-2">Breakdown Rewards</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(breakdownRewards).map(([material, amount]) => (
                <div key={material} className="flex-1 min-w-[100px] text-xs bg-black/30 rounded px-2 py-1 flex justify-between">
                  <span className="text-muted capitalize">{material}:</span>
                  <span className="text-gold font-bold">+{amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {onEquip && (
            <button
              className="flex-1 bg-gradient-to-r from-gold to-yellow-600 text-bg font-bold py-2 px-4 rounded cursor-pointer transition-all hover:scale-105"
              onClick={onEquip}
            >
              {currentEquipped ? 'Replace Equipment' : 'Equip'}
            </button>
          )}
          {onBreakdown && canBreakdown && (
            <button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors"
              onClick={onBreakdown}
            >
              Break Down
            </button>
          )}
          {!canBreakdown && (
            <div className="flex-1 text-center py-2">
              <span className="text-muted text-xs">Unlock Blacksmith to break down items</span>
            </div>
          )}
        </div>

        {onClose && (
          <button
            className="absolute top-2 right-2 w-8 h-8 bg-white/10 hover:bg-white/20 text-text rounded flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}