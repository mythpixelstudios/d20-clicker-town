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
    <div className="equipment-slot-wrapper">
      <div className="equipment-slot-header">
        <span className="slot-icon">{slotIcons[slot]}</span>
        <span className="slot-name">{slotNames[slot]}</span>
      </div>
      
      <button
        className={`equipment-slot-card ${isEquipped ? 'equipped' : 'empty'}`}
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
          <div className="equipped-item-content">
            <div 
              className="rarity-indicator"
              style={{ backgroundColor: rarityColor }}
            />
            <div className="item-details">
              <div className="item-name" title={equipment.name}>
                {equipment.name}
              </div>
              <div className="item-level">Lv {equipment.level}</div>
              <div 
                className="item-rarity"
                style={{ color: rarityColor }}
              >
                {equipment.rarity}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-slot-content">
            <div className="empty-icon">{slotIcons[slot]}</div>
            <div className="empty-text">Empty</div>
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
    <div className="card">
      <div style={{ marginBottom: 12 }}>
        <b>Equipment</b>
        <div className="muted" style={{ fontSize: 11 }}>Click equipped items to unequip</div>
      </div>
      
      <div className="equipment-slots-grid">
        {slots.map(slot => (
          <EquipmentSlot
            key={slot}
            slot={slot}
            equipment={equipped[slot]}
            onUnequip={handleUnequip}
          />
        ))}
      </div>
      
      {/* Equipment bonuses summary */}
      {(equipmentStats.clickDamage > 0 || equipmentStats.autoDamage > 0 || equipmentStats.autoSpeed > 0 || 
        equipmentStats.critChance > 0 || equipmentStats.goldBonus > 0 || equipmentStats.xpBonus > 0) && (
        <div className="equipment-bonuses">
          <div className="bonuses-title">Equipment Bonuses</div>
          <div className="bonuses-grid">
            {equipmentStats.clickDamage > 0 && <div className="bonus-item">+{equipmentStats.clickDamage} Click DMG</div>}
            {equipmentStats.autoDamage > 0 && <div className="bonus-item">+{equipmentStats.autoDamage} Auto DMG</div>}
            {equipmentStats.autoSpeed > 0 && <div className="bonus-item">+{equipmentStats.autoSpeed.toFixed(1)} Speed</div>}
            {equipmentStats.critChance > 0 && <div className="bonus-item">+{equipmentStats.critChance}% Crit</div>}
            {equipmentStats.goldBonus > 0 && <div className="bonus-item">+{(equipmentStats.goldBonus * 100).toFixed(0)}% Gold</div>}
            {equipmentStats.xpBonus > 0 && <div className="bonus-item">+{(equipmentStats.xpBonus * 100).toFixed(0)}% XP</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default EquipmentPanel