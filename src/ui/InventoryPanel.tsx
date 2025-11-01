import { useEconomy } from '@/state/economyStore'
import { useChar } from '@/state/charStore'
import { rarityInfo } from '@/data/equipment'
import type { InventoryItem } from '@/state/economyStore'

type InventorySlotProps = {
  readonly item?: InventoryItem
  readonly onEquip?: (item: InventoryItem) => void
}

function InventorySlot({ item, onEquip }: InventorySlotProps) {
  if (!item) {
    return <div className="inventory-slot empty"></div>
  }

  const handleClick = () => {
    if (item.isEquipment && onEquip) {
      onEquip(item)
    }
  }

  return (
    <div 
      className={`inventory-slot filled ${item.isEquipment ? 'equipment' : ''}`}
      onClick={handleClick}
      style={{
        borderColor: item.isEquipment && item.equipment 
          ? rarityInfo[item.equipment.rarity].color 
          : undefined,
        cursor: item.isEquipment ? 'pointer' : 'default'
      }}
    >
      <div className="item-name">{item.label}</div>
      {item.qty && item.qty > 1 && (
        <div className="item-quantity">{item.qty}</div>
      )}
      {item.isEquipment && (
        <div className="equipment-indicator">⚔️</div>
      )}
    </div>
  )
}

export const InventoryPanel = () => {
  const { inventory } = useEconomy()
  const { equipItem } = useChar()

  const handleEquip = (item: InventoryItem) => {
    if (!item.isEquipment || !item.equipment) return
    
    const unequippedItem = equipItem(item.equipment)
    
    // Remove equipped item from inventory
    const economy = useEconomy.getState()
    const newInventory = economy.inventory.filter(invItem => invItem.id !== item.id)
    
    // Add unequipped item back to inventory if there was one
    if (unequippedItem) {
      newInventory.push({
        id: unequippedItem.id,
        label: unequippedItem.name,
        equipment: unequippedItem,
        isEquipment: true
      })
    }
    
    economy.addInventory = (items) => {
      useEconomy.setState({ inventory: [...newInventory, ...items] })
    }
    
    // Just update the inventory directly
    useEconomy.setState({ inventory: newInventory })
  }
  const gold = useEconomy((state) => state.gold)

  // Create a 5x8 grid (40 slots total)
  const maxSlots = 40
  const slots = Array.from({ length: maxSlots }, (_, index) => {
    const item = inventory[index]
    return <InventorySlot key={index} item={item} />
  })

  return (
    <div className="card">
      <div>Money: {gold}</div>
      <div style={{ marginBottom: 8 }}>
        <b>Inventory</b>
        <div className="muted">{inventory.length}/{maxSlots} items</div>
      </div>
      <div className="inventory-grid">
        {slots}
      </div>
    </div>
  )
}

export default InventoryPanel