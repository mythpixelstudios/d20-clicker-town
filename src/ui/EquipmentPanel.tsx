import React from 'react'
import { useChar } from '@/state/charStore'
import { useEconomy } from '@/state/economyStore'
import { rarityInfo } from '@/data/equipment'
import type { EquipmentSlot } from '@/data/equipment'

type EquipmentSlotProps = {
  readonly slot: EquipmentSlot
  readonly equipment?: any
  readonly onUnequip?: (EquipmentSlot: EquipmentSlot) => void
}

const slotIcons = {
  weapon: '⚔️',
  helmet: '🪖',
  chest: '🛡️',
  legs: '👖',
  boots: '👢',
  gloves: '🧤',
  ring_left: '💍',
  ring_right: '💍'
}

const slotNames = {
  weapon: 'Weapon',
  helmet: 'Helmet', 
  chest: 'Chest',
  legs: 'Legs',
  boots: 'Boots',
  gloves: 'Gloves',
  ring_left: 'Left Ring',
  ring_right: 'Right Ring'
}

function EquipmentSlot({ slot, equipment, onUnequip }: EquipmentSlotProps) {
  const handleClick = () => {
    if (equipment && onUnequip) {
      onUnequip(slot)
    }
  }

  const rarityColor = equipment ? rarityInfo[equipment.rarity as keyof typeof rarityInfo]?.color : '#404040'
  const isEquipped = !!equipment

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span>{slotIcons[slot]}</span>
        <span>{slotNames[slot]}</span>
      </div>

      <button
        className={`relative p-2 rounded-lg border transition-all ${
          isEquipped
            ? 'cursor-pointer hover:scale-105'
            : 'cursor-not-allowed opacity-60'
        }`}
        onClick={handleClick}
        disabled={!equipment}
        style={{
          borderColor: isEquipped ? rarityColor : 'rgba(255,255,255,0.06)',
          background: isEquipped
            ? `linear-gradient(135deg, ${rarityColor}15, ${rarityColor}05)`
            : '#1a1f2a'
        }}
      >
        {equipment ? (
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-lg"
              style={{ backgroundColor: rarityColor }}
            />
            <div className="flex-1 min-w-0 pl-1">
              <div className="text-xs font-medium text-text truncate" title={equipment.name}>
                {equipment.name}
              </div>
              <div className="text-[10px] text-muted">Lv {equipment.level}</div>
              <div
                className="text-[10px] font-bold"
                style={{ color: rarityColor }}
              >
                {equipment.rarity}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-2xl opacity-30">{slotIcons[slot]}</div>
            <div className="text-[10px] text-muted mt-1">Empty</div>
          </div>
        )}
      </button>
    </div>
  )
}

export const EquipmentPanel = () => {
  const { equipped, unequipItem, getTotalStats } = useChar()
  const totalStats = getTotalStats()

  const handleUnequip = (slot: EquipmentSlot) => {
    const unequippedItem = unequipItem(slot)
    
    if (unequippedItem) {
      // Add unequipped item back to inventory
      const economy = useEconomy.getState()
      
      economy.addItem({
        id: unequippedItem.id,
        label: unequippedItem.name,
        equipment: unequippedItem,
        isEquipment: true
      })
    }
  }

  // Calculate equipment bonuses for display
  const equipmentStats = {
    str: totalStats.str - 0,
    dex: totalStats.dex - 0, 
    con: totalStats.con - 0,
    int: totalStats.int - 0,
    wis: totalStats.wis - 0,
    clickDamage: totalStats.clickDamage || 0,
    autoDamage: totalStats.autoDamage || 0,
    autoSpeed: totalStats.autoSpeed || 0,
    critChance: totalStats.critChance || 0,
    goldBonus: totalStats.goldBonus || 0,
    xpBonus: totalStats.xpBonus || 0
  }

  const slots: EquipmentSlot[] = ['weapon', 'helmet', 'chest', 'legs', 'boots', 'gloves', 'ring_left', 'ring_right']

  return (
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card">
      <div className="mb-3">
        <b className="text-text">Equipment</b>
        <div className="text-muted text-[11px]">Click equipped items to unequip</div>
      </div>

      <div className="flex flex-wrap gap-3">
        {slots.map(slot => (
          <div key={slot} className="flex-1 min-w-[140px]">
            <EquipmentSlot
              slot={slot}
              equipment={equipped[slot]}
              onUnequip={handleUnequip}
            />
          </div>
        ))}
      </div>

      {/* Equipment bonuses summary */}
      {(equipmentStats.clickDamage > 0 || equipmentStats.autoDamage > 0 || equipmentStats.autoSpeed > 0 ||
        equipmentStats.critChance > 0 || equipmentStats.goldBonus > 0 || equipmentStats.xpBonus > 0) && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs font-bold text-gold uppercase mb-2">Equipment Bonuses</div>
          <div className="flex flex-wrap gap-2">
            {equipmentStats.clickDamage > 0 && <div className="text-xs text-green-400">+{equipmentStats.clickDamage} Click DMG</div>}
            {equipmentStats.autoDamage > 0 && <div className="text-xs text-green-400">+{equipmentStats.autoDamage} Auto DMG</div>}
            {equipmentStats.autoSpeed > 0 && <div className="text-xs text-green-400">+{equipmentStats.autoSpeed.toFixed(1)} Speed</div>}
            {equipmentStats.critChance > 0 && <div className="text-xs text-green-400">+{equipmentStats.critChance}% Crit</div>}
            {equipmentStats.goldBonus > 0 && <div className="text-xs text-green-400">+{(equipmentStats.goldBonus * 100).toFixed(0)}% Gold</div>}
            {equipmentStats.xpBonus > 0 && <div className="text-xs text-green-400">+{(equipmentStats.xpBonus * 100).toFixed(0)}% XP</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default EquipmentPanel