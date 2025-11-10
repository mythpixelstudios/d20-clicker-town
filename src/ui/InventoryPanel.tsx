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
    return <div className="w-12 h-12 bg-black/20 border border-white/5 rounded"></div>
  }

  const handleClick = () => {
    if (item.isEquipment && onEquip) {
      onEquip(item)
    }
  }

  return (
    <div
      className={`relative w-12 h-12 bg-black/30 border rounded p-1 flex flex-col items-center justify-center text-center transition-all ${
        item.isEquipment ? 'cursor-pointer hover:scale-105 hover:bg-black/40' : 'cursor-default'
      }`}
      onClick={handleClick}
      style={{
        borderColor: item.isEquipment && item.equipment
          ? rarityInfo[item.equipment.rarity].color
          : 'rgba(255,255,255,0.1)'
      }}
    >
      <div className="text-[10px] text-text font-medium truncate w-full px-0.5">{item.label}</div>
      {item.qty && item.qty > 1 && (
        <div className="absolute top-0.5 right-0.5 bg-black/70 text-gold text-[9px] font-bold px-1 rounded">{item.qty}</div>
      )}
      {item.isEquipment && (
        <div className="absolute bottom-0.5 right-0.5 text-xs">⚔️</div>
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

    // Handle stacked items - only remove one from the stack
    const economy = useEconomy.getState()
    const itemIndex = economy.inventory.findIndex(invItem => invItem.id === item.id)

    let newInventory = [...economy.inventory]

    if (itemIndex !== -1) {
      const inventoryItem = newInventory[itemIndex]
      const qty = inventoryItem.qty || 1

      if (qty > 1) {
        // Decrement quantity
        newInventory[itemIndex] = {
          ...inventoryItem,
          qty: qty - 1
        }
      } else {
        // Remove item completely
        newInventory = newInventory.filter(invItem => invItem.id !== item.id)
      }
    }

    // Add unequipped item back to inventory if there was one
    if (unequippedItem) {
      // Use addInventory to properly handle stacking
      economy.addInventory([{
        id: unequippedItem.id,
        label: unequippedItem.name,
        equipment: unequippedItem,
        isEquipment: true
      }])
    } else {
      // Update inventory only if we didn't add an unequipped item
      useEconomy.setState({ inventory: newInventory })
    }
  }
  const gold = useEconomy((state) => state.gold)
  const maxInventorySize = useEconomy((state) => state.maxInventorySize)

  // Create inventory slots
  const slots = Array.from({ length: maxInventorySize }, (_, index) => {
    const item = inventory[index]
    return <InventorySlot key={index} item={item} />
  })

  return (
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card">
      <div className="text-gold font-bold mb-2">Money: {gold}</div>
      <div className="mb-3">
        <b className="text-text">Inventory</b>
        <div className="text-muted text-sm">{inventory.length}/{maxInventorySize} items</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {slots}
      </div>
    </div>
  )
}

export default InventoryPanel