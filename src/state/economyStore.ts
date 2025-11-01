import create from 'zustand'
import { persist } from 'zustand/middleware'

export type InventoryItem = { 
  id: string
  label: string
  qty?: number
  mat?: string 
  equipment?: any // Equipment object
  isEquipment?: boolean
}

type EconomyState = {
  gold: number
  materials: Record<string, number>
  inventory: InventoryItem[]
  addGold: (amount: number) => void
  addMaterial: (materialId: string, amount: number) => void
  addInventory: (items: InventoryItem[]) => void
  addItem: (item: InventoryItem) => void
  breakdownEquipment: (equipmentItem: InventoryItem) => void
  resetForPrestige: () => void
}

export const useEconomy = create<EconomyState>()(persist((set, get) => ({
  gold: 0, 
  materials: {}, 
  inventory: [],

  addGold: (amount) => set({ gold: get().gold + amount }),

  addMaterial: (materialId, amount) => {
    const materials = { ...get().materials }
    materials[materialId] = (materials[materialId] || 0) + amount
    set({ materials })
  },

  addInventory: (items) => {
    const currentInventory = [...get().inventory]
    
    for (const newItem of items) {
      // Equipment items should never stack - each piece is unique
      if (newItem.isEquipment) {
        currentInventory.push({
          ...newItem,
          qty: 1 // Equipment always has qty of 1
        })
      } else {
        // Try to find existing item with same ID to stack (for materials)
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

    // Remove equipment from inventory
    const currentInventory = get().inventory
    const updatedInventory = currentInventory.filter(item => item.id !== equipmentItem.id)
    set({ inventory: updatedInventory })
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
