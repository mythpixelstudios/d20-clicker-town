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
      className="relative bg-black/30 border-2 rounded-lg p-2 cursor-pointer transition-all hover:scale-105 hover:bg-black/40"
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
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: rarityColor }}
      />
      <div className="pl-1">
        <div className="text-sm font-bold text-text truncate mb-0.5" title={item.equipment.name}>
          <span aria-hidden="true">{rarityIcon}</span> {item.equipment.name}
        </div>
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-muted">Lv {item.equipment.level}</span>
          <span
            className="font-bold"
            style={{ color: rarityColor }}
          >
            {item.equipment.rarity}
          </span>
        </div>
        <div className="text-[10px] text-muted uppercase">
          {item.equipment.slot}
        </div>
      </div>
      <button
        className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white rounded flex items-center justify-center text-sm font-bold transition-colors"
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
    <div className="relative bg-purple/10 border border-purple/30 rounded-lg p-2 text-center">
      <div className="text-xs font-medium text-purple">{item.label}</div>
      {item.qty && item.qty > 1 && (
        <div className="absolute top-1 right-1 bg-purple/80 text-white text-[9px] font-bold px-1 rounded">x{item.qty}</div>
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
      <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card">
        <div className="flex justify-between items-center mb-4">
          <b className="text-text">Inventory</b>
          <div className="text-muted text-sm">{inventory.length} items</div>
        </div>

        {/* Equipment Section */}
        {equipment.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gold">Equipment ({equipment.length})</span>
              <span className="text-[10px] text-muted">Click to compare • Right-click for options</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {equipment.map((item, index) => (
                <div key={item.id || `equipment-${index}`} className="flex-1 min-w-[140px] max-w-[200px]">
                  <EquipmentCard
                    item={item}
                    onShowTooltip={handleShowTooltip}
                    onBreakdown={handleQuickBreakdown}
                    onShowComparison={handleShowComparison}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials Section */}
        {materials.length > 0 && (
          <div className="mb-4">
            <div className="mb-2">
              <span className="text-sm font-bold text-purple">Materials ({materials.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {materials.map((item, index) => (
                <div key={item.id || `material-${index}`} className="flex-1 min-w-[80px] max-w-[120px]">
                  <MaterialCard
                    item={item}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {inventory.length === 0 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-2">📦</div>
            <div className="text-text font-bold mb-1">Your inventory is empty</div>
            <div className="text-sm text-muted">Defeat monsters and craft items to fill it up!</div>
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