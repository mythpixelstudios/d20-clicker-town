import create from 'zustand'
import { persist } from 'zustand/middleware'
import type { Equipment } from '@/data/equipment'

export type InventoryItem = {
  id: string
  label: string
  qty?: number
  mat?: string
  equipment?: Equipment // Equipment object
  isEquipment?: boolean
}

type EconomyState = {
  gold: number
  materials: Record<string, number>
  inventory: InventoryItem[]
  maxInventorySize: number
  addGold: (amount: number) => void
  addMaterial: (materialId: string, amount: number) => void
  addInventory: (items: InventoryItem[]) => void
  addItem: (item: InventoryItem) => void
  breakdownEquipment: (equipmentItem: InventoryItem) => void
  resetForPrestige: () => void
}

// Helper function to extract base template ID from equipment ID
// Equipment IDs are in format: "template_id_timestamp_random"
function getBaseTemplateId(equipmentId: string): string {
  const parts = equipmentId.split('_')
  // Find the last occurrence of a timestamp-like pattern and take everything before it
  // This handles multi-word template IDs like "rusty_sword"
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!isNaN(Number(parts[i])) && parts[i].length >= 13) {
      // Found timestamp, return everything before it
      return parts.slice(0, i).join('_')
    }
  }
  // If no timestamp found, return the whole ID (for crafted items)
  return equipmentId
}

export const useEconomy = create<EconomyState>()(persist((set, get) => ({
  gold: 0,
  materials: {},
  inventory: [],
  maxInventorySize: 50,

  addGold: (amount) => set({ gold: get().gold + amount }),

  addMaterial: (materialId, amount) => {
    const materials = { ...get().materials }
    materials[materialId] = (materials[materialId] || 0) + amount
    set({ materials })
  },

  addInventory: (items) => {
    const currentInventory = [...get().inventory]
    const maxSize = get().maxInventorySize

    for (const newItem of items) {
      // Check inventory capacity before adding
      if (currentInventory.length >= maxSize) {
        console.warn('Inventory is full! Cannot add more items.')
        break // Stop adding items if inventory is full
      }

      if (newItem.isEquipment && newItem.equipment) {
        const equipment = newItem.equipment

        // Stack common equipment with the same base template
        if (equipment.rarity === 'common') {
          const baseTemplateId = getBaseTemplateId(equipment.id)

          // Find existing common equipment with same base template
          const existingIndex = currentInventory.findIndex(item =>
            item.isEquipment &&
            item.equipment?.rarity === 'common' &&
            getBaseTemplateId(item.equipment.id) === baseTemplateId
          )

          if (existingIndex !== -1) {
            // Stack with existing common equipment
            const existingItem = currentInventory[existingIndex]
            currentInventory[existingIndex] = {
              ...existingItem,
              qty: (existingItem.qty || 1) + 1
            }
          } else {
            // Add as new stack
            currentInventory.push({
              ...newItem,
              qty: 1
            })
          }
        } else {
          // Uncommon and above: each item is unique, don't stack
          currentInventory.push({
            ...newItem,
            qty: 1
          })
        }
      } else {
        // Non-equipment items (materials, etc.)
        // Try to find existing item with same ID to stack
        const existingIndex = currentInventory.findIndex(item =>
          item.id === newItem.id && !item.isEquipment
        )

        if (existingIndex !== -1) {
          // Stack with existing item
          const existingItem = currentInventory[existingIndex]
          currentInventory[existingIndex] = {
            ...existingItem,
            qty: (existingItem.qty || 1) + (newItem.qty || 1)
          }
        } else {
          // Add as new item
          currentInventory.push({
            ...newItem,
            qty: newItem.qty || 1
          })
        }
      }
    }

    set({ inventory: currentInventory })
  },

  // Helper function to add a single item
  addItem: (item: InventoryItem) => {
    get().addInventory([item])
  },

  // Breakdown equipment into materials
  breakdownEquipment: (equipmentItem: InventoryItem) => {
    if (!equipmentItem.isEquipment || !equipmentItem.equipment) return

    const equipment = equipmentItem.equipment
    const { addMaterial } = get()

    // Calculate breakdown rewards based on equipment level and rarity
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

    // Add bonus materials for higher rarity
    if (equipment.rarity === 'rare' || equipment.rarity === 'epic' || equipment.rarity === 'legendary') {
      baseRewards['crystal'] = Math.max(1, Math.floor(equipment.level * 0.1 * multiplier))
    }
    if (equipment.rarity === 'epic' || equipment.rarity === 'legendary') {
      baseRewards['magic dust'] = Math.max(1, Math.floor(equipment.level * 0.05 * multiplier))
    }
    if (equipment.rarity === 'legendary') {
      baseRewards['gemstones'] = Math.max(1, Math.floor(equipment.level * 0.03 * multiplier))
    }

    // Add materials to inventory
    Object.entries(baseRewards).forEach(([material, amount]) => {
      addMaterial(material, amount)
    })

    // Handle stacked items - only remove one from the stack
    const currentInventory = get().inventory
    const itemIndex = currentInventory.findIndex(item => item.id === equipmentItem.id)

    if (itemIndex !== -1) {
      const item = currentInventory[itemIndex]
      const qty = item.qty || 1

      if (qty > 1) {
        // Decrement quantity
        const updatedInventory = [...currentInventory]
        updatedInventory[itemIndex] = {
          ...item,
          qty: qty - 1
        }
        set({ inventory: updatedInventory })
      } else {
        // Remove item completely
        const updatedInventory = currentInventory.filter(item => item.id !== equipmentItem.id)
        set({ inventory: updatedInventory })
      }
    }
  },

  resetForPrestige: () => {
    // Reset economy to starting state
    // Players lose all gold, materials, and inventory on prestige
    set({
      gold: 0,
      materials: {},
      inventory: []
    })
  }
}), { name: 'econ-v2' }))
