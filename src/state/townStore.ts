import create from 'zustand'
import { persist } from 'zustand/middleware'
import { useEconomy } from './economyStore'
import { useChar } from './charStore'
import { buildings, getBuilding, getCostForLevel, isBuildingUnlocked } from '@/data/buildings'
import { trackBuildingUpgrade } from '@/systems/storyQuestTracking'
import type { Building } from '@/data/buildings'

export type TownBuilding = {
  id: string
  level: number
}

type TownState = { 
  buildings: TownBuilding[]
  getBuilding: (id: string) => TownBuilding | undefined
  getBuildingData: (id: string) => Building | undefined
  canUpgrade: (id: string) => boolean
  upgrade: (buildingId: string) => void
  getAvailableBuildings: () => Building[]
  hasUpgradeAvailable: () => boolean
  isBuildingBuilt: (buildingId: string) => boolean
}

// Initialize town buildings with level 0 for all buildings
const initialTownBuildings: TownBuilding[] = buildings.map(building => ({
  id: building.id,
  level: 0
}))

export const useTown = create<TownState>()(persist((set, get) => ({
  buildings: initialTownBuildings,

  getBuilding: (id: string) => {
    return get().buildings.find(b => b.id === id)
  },

  getBuildingData: (id: string) => {
    return getBuilding(id)
  },

  canUpgrade: (id: string) => {
    const townBuilding = get().getBuilding(id)
    const buildingData = get().getBuildingData(id)
    const economy = useEconomy.getState()
    
    if (!townBuilding || !buildingData) return false
    if (townBuilding.level >= buildingData.maxLevel) return false
    
    const cost = getCostForLevel(buildingData, townBuilding.level)
    
    // Check gold cost
    if (cost.gold && economy.gold < cost.gold) return false
    
    // Check material costs
    if (cost.materials) {
      for (const [materialId, amount] of Object.entries(cost.materials)) {
        if ((economy.materials[materialId] || 0) < amount) {
          return false
        }
      }
    }
    
    return true
  },

  upgrade: (buildingId) => set((state) => {
    const townBuilding = state.buildings.find(b => b.id === buildingId)
    const buildingData = getBuilding(buildingId)
    const economy = useEconomy.getState()
    
    if (!townBuilding || !buildingData) return state
    if (townBuilding.level >= buildingData.maxLevel) return state
    if (!get().canUpgrade(buildingId)) return state
    
    const cost = getCostForLevel(buildingData, townBuilding.level)
    
    // Deduct costs
    if (cost.gold) {
      economy.addGold(-cost.gold)
    }
    
    if (cost.materials) {
      for (const [materialId, amount] of Object.entries(cost.materials)) {
        economy.addMaterial(materialId, -amount)
      }
    }
    
    // Upgrade building
    const newBuildings = state.buildings.map(b =>
      b.id === buildingId ? { ...b, level: b.level + 1 } : b
    )

    // Log the upgrade
    const newLevel = (townBuilding.level || 0) + 1
    import('./logStore').then(({ logTownUpgrade }) => {
      logTownUpgrade(buildingData.name, newLevel)
    })

    // Track story quest progress
    trackBuildingUpgrade(buildingId, newLevel)

    return { buildings: newBuildings }
  }),

  getAvailableBuildings: () => {
    const char = useChar.getState()
    const economy = useEconomy.getState()
    const townBuildings = get().buildings
    
    return buildings.filter(building => 
      isBuildingUnlocked(building, char.level, townBuildings, economy.materials)
    )
  },

  hasUpgradeAvailable: () => {
    const availableBuildings = get().getAvailableBuildings()
    return availableBuildings.some(building => get().canUpgrade(building.id))
  },

  isBuildingBuilt: (buildingId: string) => {
    const building = get().getBuilding(buildingId)
    
    if (!building) return false
    
    // Simply check if building has at least level 1
    return building.level > 0
  }
}), { name: 'town-v3' }))
