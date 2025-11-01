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
    <div className="equipment-tooltip">
      <div className="tooltip-header">
        <div className="equipment-name" style={{ color: rarity.color }}>
          {equipment.name}
        </div>
        <div className="equipment-type">{slotNames[equipment.slot]} • Level {equipment.level}</div>
        <div className="equipment-rarity" style={{ color: rarity.color }}>
          {equipment.rarity.charAt(0).toUpperCase() + equipment.rarity.slice(1)}
        </div>
      </div>

      <div className="tooltip-section">
        <div className="section-title">Stats</div>
        <div className="stats-list">
          {Object.entries(statNames).map(([statKey, statName]) => {
            const comparison = getStatComparison(statKey as keyof typeof statNames)
            if (comparison.newValue === 0) return null
            
            return (
              <div key={statKey} className="stat-row">
                <span className="stat-name">{statName}:</span>
                <span className="stat-value">+{comparison.newValue}</span>
                {comparison.difference !== 0 && (
                  <span 
                    className={`stat-comparison ${comparison.isUpgrade ? 'upgrade' : 'downgrade'}`}
                  >
                    ({comparison.difference > 0 ? '+' : ''}{comparison.difference})
                  </span>
                )}
                {!currentEquipped && comparison.newValue > 0 && (
                  <span className="stat-comparison upgrade">
                    (+{comparison.newValue})
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {equipment.affixes && equipment.affixes.length > 0 && (
        <div className="tooltip-section">
          <div className="section-title">Special Properties</div>
          <div className="affixes-list">
            {equipment.affixes.map((affix) => (
              <div key={affix.id} className={`affix-item ${affix.tier}-affix`}>
                <span className="affix-name">{affix.name}:</span>
                <span className="affix-value">
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
        <div className="tooltip-section">
          <div className="section-title">Currently Equipped</div>
          <div className="current-equipment">
            <span style={{ color: rarityInfo[currentEquipped.rarity as keyof typeof rarityInfo].color }}>
              {currentEquipped.name}
            </span>
            <span className="muted"> (Level {currentEquipped.level})</span>
          </div>
        </div>
      )}

      {canBreakdown && (
        <div className="tooltip-section">
          <div className="section-title">Breakdown Rewards</div>
          <div className="breakdown-rewards">
            {Object.entries(breakdownRewards).map(([material, amount]) => (
              <div key={material} className="reward-item">
                <span className="material-name">{material}:</span>
                <span className="material-amount">+{amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tooltip-actions">
        {onEquip && (
          <button className="equip-button" onClick={onEquip}>
            {currentEquipped ? 'Replace Equipment' : 'Equip'}
          </button>
        )}
        {onBreakdown && canBreakdown && (
          <button className="breakdown-button" onClick={onBreakdown}>
            Break Down
          </button>
        )}
        {!canBreakdown && (
          <div className="breakdown-locked">
            <span className="muted">Unlock Blacksmith to break down items</span>
          </div>
        )}
      </div>

      {onClose && (
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  )
}