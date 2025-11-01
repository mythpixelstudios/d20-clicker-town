import { useEconomy } from '@/state/economyStore'
import { useChar } from '@/state/charStore'
import { rarityInfo, type Equipment } from '@/data/equipment'
import EquipmentTooltip from '@/ui/EquipmentTooltip'
import { useItemComparison } from '@/ui/components/ItemComparison'
import { useState } from 'react'
import type { InventoryItem } from '@/state/economyStore'

type EquipmentCardProps = {
  readonly item: InventoryItem
  readonly onShowTooltip: (item: InventoryItem) => void
  readonly onBreakdown: (item: InventoryItem) => void
  readonly onShowComparison: (item: InventoryItem, event: React.MouseEvent) => void
}

function EquipmentCard({ item, onShowTooltip, onBreakdown, onShowComparison }: EquipmentCardProps) {
  if (!item.equipment) return null

  const rarityData = rarityInfo[item.equipment.rarity as keyof typeof rarityInfo]
  const rarityColor = rarityData?.color || '#9ca3af'
  const glowIntensity = rarityData?.glowIntensity || 0
  const rarityIcon = rarityData?.icon || '●'

  const handleClick = (e: React.MouseEvent) => {
    onShowComparison(item, e)
  }
  
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onShowTooltip(item)
  }
  
  const handleBreakdown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBreakdown(item)
  }

  const glowStyle = glowIntensity > 0 ? {
    boxShadow: `0 0 ${8 * glowIntensity}px ${rarityColor}${Math.floor(glowIntensity * 100).toString(16).padStart(2, '0')}, 
                inset 0 0 ${4 * glowIntensity}px ${rarityColor}${Math.floor(glowIntensity * 50).toString(16).padStart(2, '0')}`
  } : {}

  return (
    <div 
      className={`equipment-card rarity-${item.equipment.rarity}`}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      role="button"
      tabIndex={0}
      aria-label={`${item.equipment.name}, ${item.equipment.rarity} ${item.equipment.slot}, Level ${item.equipment.level}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e as any)
        }
      }}
      style={{
        borderColor: rarityColor,
        background: `linear-gradient(135deg, ${rarityColor}20, ${rarityColor}05)`,
        ...glowStyle
      }}
    >
      <div 
        className="equipment-rarity-bar"
        style={{ backgroundColor: rarityColor }}
      />
      <div className="equipment-info">
        <div className="equipment-name" title={item.equipment.name}>
          <span aria-hidden="true">{rarityIcon}</span> {item.equipment.name}
        </div>
        <div className="equipment-meta">
          <span className="equipment-level">Lv {item.equipment.level}</span>
          <span 
            className="equipment-rarity-text"
            style={{ color: rarityColor }}
          >
            {item.equipment.rarity}
          </span>
        </div>
        <div className="equipment-slot-type">
          {item.equipment.slot}
        </div>
      </div>
      <button 
        className="equipment-breakdown-btn"
        onClick={handleBreakdown}
        title="Breakdown item for materials"
        aria-label={`Breakdown ${item.equipment.name} for materials`}
      >
        ×
      </button>
    </div>
  )
}

type MaterialCardProps = {
  readonly item: InventoryItem
}

function MaterialCard({ item }: MaterialCardProps) {
  return (
    <div className="material-card">
      <div className="material-name">{item.label}</div>
      {item.qty && item.qty > 1 && (
        <div className="material-quantity">x{item.qty}</div>
      )}
    </div>
  )
}

export const InventoryPanel = () => {
  const { inventory, breakdownEquipment } = useEconomy()
  const { equipItem } = useChar()
  const [selectedEquipment, setSelectedEquipment] = useState<InventoryItem | null>(null)
  
  const handleEquipFromComparison = (equipment: Equipment) => {
    const unequippedItem = equipItem(equipment)
    
    // Remove equipped item from inventory
    const economy = useEconomy.getState()
    const newInventory = economy.inventory.filter(invItem => invItem.equipment?.id !== equipment.id)
    
    // Add unequipped item back to inventory if there was one
    if (unequippedItem) {
      newInventory.push({
        id: unequippedItem.id,
        label: unequippedItem.name,
        equipment: unequippedItem,
        isEquipment: true
      })
    }
    
    // Update inventory
    useEconomy.setState({ inventory: newInventory })
    setSelectedEquipment(null)
  }
  
  const handleEquipFromTooltip = () => {
    if (selectedEquipment?.equipment) {
      handleEquipFromComparison(selectedEquipment.equipment)
    }
  }
  
  const { showComparison, hideComparison, ComparisonTooltip } = useItemComparison(handleEquipFromComparison)

  const handleShowTooltip = (item: InventoryItem) => {
    setSelectedEquipment(item)
  }
  
  const handleShowComparison = (item: InventoryItem, event: React.MouseEvent) => {
    if (item.equipment) {
      showComparison(item.equipment, event)
    }
  }

  const handleBreakdown = () => {
    if (selectedEquipment) {
      breakdownEquipment(selectedEquipment)
      setSelectedEquipment(null)
    }
  }

  const handleQuickBreakdown = (item: InventoryItem) => {
    breakdownEquipment(item)
  }

  const handleCloseTooltip = () => {
    setSelectedEquipment(null)
  }

  // Separate equipment and materials
  const equipment = inventory.filter(item => item.isEquipment)
  const materials = inventory.filter(item => !item.isEquipment)

  return (
    <>
      <div className="card">
        <div className="inventory-header">
          <b>Inventory</b>
          <div className="muted inventory-count">{inventory.length} items</div>
        </div>

        {/* Equipment Section */}
        {equipment.length > 0 && (
          <div className="inventory-section">
            <div className="section-header">
              <span className="section-title">Equipment ({equipment.length})</span>
              <span className="section-hint">Click to compare • Right-click for options</span>
            </div>
            <div className="equipment-grid">
              {equipment.map((item, index) => (
                <EquipmentCard
                  key={item.id || `equipment-${index}`}
                  item={item}
                  onShowTooltip={handleShowTooltip}
                  onBreakdown={handleQuickBreakdown}
                  onShowComparison={handleShowComparison}
                />
              ))}
            </div>
          </div>
        )}

        {/* Materials Section */}
        {materials.length > 0 && (
          <div className="inventory-section">
            <div className="section-header">
              <span className="section-title">Materials ({materials.length})</span>
            </div>
            <div className="materials-grid">
              {materials.map((item, index) => (
                <MaterialCard
                  key={item.id || `material-${index}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {inventory.length === 0 && (
          <div className="empty-inventory">
            <div className="empty-icon">📦</div>
            <div className="empty-text">Your inventory is empty</div>
            <div className="empty-hint">Defeat monsters and craft items to fill it up!</div>
          </div>
        )}
      </div>

      {selectedEquipment && selectedEquipment.isEquipment && selectedEquipment.equipment && (
        <EquipmentTooltip
          equipment={selectedEquipment.equipment}
          onEquip={handleEquipFromTooltip}
          onBreakdown={handleBreakdown}
          onClose={handleCloseTooltip}
        />
      )}
      
      {ComparisonTooltip}
    </>
  )
}

export default InventoryPanel