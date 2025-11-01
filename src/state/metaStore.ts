import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MetaUpgrade {
  id: string
  name: string
  description: string
  currentLevel: number
  maxLevel: number
  baseCost: number
  costMultiplier: number
  effect: (level: number) => number
  getDescription: (level: number) => string
}

interface MetaUpgradeState {
  upgrades: Record<string, MetaUpgrade>
  
  // Actions
  purchaseUpgrade: (upgradeId: string) => boolean
  getUpgradeCost: (upgradeId: string) => number
  canAffordUpgrade: (upgradeId: string) => boolean
  
  // Meta effects (computed values)
  getGlobalDpsMultiplier: () => number
  getAutoSpeedMultiplier: () => number
  getQuestEfficiencyMultiplier: () => number
  getOfflineProgressMultiplier: () => number
}

const createMetaUpgrades = (): Record<string, MetaUpgrade> => ({
  globalDps: {
    id: 'globalDps',
    name: 'Eternal Strength',
    description: 'Increases all damage permanently',
    currentLevel: 0,
    maxLevel: 50,
    baseCost: 10,
    costMultiplier: 1.5,
    effect: (level: number) => 1 + level * 0.2, // +20% DPS per level
    getDescription: (level: number) => `+${((level * 0.2) * 100).toFixed(0)}% damage`
  },
  
  autoSpeed: {
    id: 'autoSpeed',
    name: 'Temporal Acceleration',
    description: 'Increases auto-attack speed permanently',
    currentLevel: 0,
    maxLevel: 25,
    baseCost: 15,
    costMultiplier: 1.75,
    effect: (level: number) => 1 + level * 0.15, // +15% speed per level
    getDescription: (level: number) => `+${((level * 0.15) * 100).toFixed(0)}% auto speed`
  },
  
  questEfficiency: {
    id: 'questEfficiency',
    name: 'Diplomatic Mastery',
    description: 'Increases quest rewards and completion speed',
    currentLevel: 0,
    maxLevel: 30,
    baseCost: 20,
    costMultiplier: 1.6,
    effect: (level: number) => 1 + level * 0.25, // +25% quest efficiency per level
    getDescription: (level: number) => `+${((level * 0.25) * 100).toFixed(0)}% quest rewards & speed`
  },
  
  offlineProgress: {
    id: 'offlineProgress',
    name: 'Mystic Presence',
    description: 'Improves offline progress generation',
    currentLevel: 0,
    maxLevel: 20,
    baseCost: 25,
    costMultiplier: 2.0,
    effect: (level: number) => 0.5 + level * 0.05, // Base 50% + 5% per level, max 150%
    getDescription: (level: number) => `${((0.5 + level * 0.05) * 100).toFixed(0)}% offline progress rate`
  },
  
  prestigeBonus: {
    id: 'prestigeBonus',
    name: 'Cosmic Insight',
    description: 'Increases prestige token gain',
    currentLevel: 0,
    maxLevel: 15,
    baseCost: 30,
    costMultiplier: 2.5,
    effect: (level: number) => 1 + level * 0.3, // +30% more tokens per level
    getDescription: (level: number) => `+${((level * 0.3) * 100).toFixed(0)}% prestige tokens`
  }
})

export const useMetaStore = create<MetaUpgradeState>()(persist((set, get) => ({
  upgrades: createMetaUpgrades(),

  purchaseUpgrade: (upgradeId: string) => {
    const { upgrades } = get()
    const upgrade = upgrades[upgradeId]
    const cost = get().getUpgradeCost(upgradeId)
    
    if (!upgrade || !get().canAffordUpgrade(upgradeId)) {
      return false
    }
    
    // Import zone progression store to spend tokens
    import('./zoneProgressionStore').then(({ useZoneProgression }) => {
      const { prestigeTokens } = useZoneProgression.getState()
      if (prestigeTokens >= cost) {
        // Spend the tokens
        useZoneProgression.setState(state => ({
          prestigeTokens: state.prestigeTokens - cost
        }))
        
        // Upgrade the meta upgrade
        set({
          upgrades: {
            ...upgrades,
            [upgradeId]: {
              ...upgrade,
              currentLevel: upgrade.currentLevel + 1
            }
          }
        })
      }
    })
    
    return true
  },

  getUpgradeCost: (upgradeId: string) => {
    const { upgrades } = get()
    const upgrade = upgrades[upgradeId]
    if (!upgrade) return Infinity
    
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.currentLevel))
  },

  canAffordUpgrade: (upgradeId: string) => {
    const { upgrades } = get()
    const upgrade = upgrades[upgradeId]
    if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel) return false
    
    // This is a bit of a hack since we can't import synchronously in the store
    // In practice, this should be checked by the UI component that has access to both stores
    return true // Will be properly checked in purchaseUpgrade
  },

  // Meta effect getters
  getGlobalDpsMultiplier: () => {
    const { upgrades } = get()
    return upgrades.globalDps.effect(upgrades.globalDps.currentLevel)
  },

  getAutoSpeedMultiplier: () => {
    const { upgrades } = get()
    return upgrades.autoSpeed.effect(upgrades.autoSpeed.currentLevel)
  },

  getQuestEfficiencyMultiplier: () => {
    const { upgrades } = get()
    return upgrades.questEfficiency.effect(upgrades.questEfficiency.currentLevel)
  },

  getOfflineProgressMultiplier: () => {
    const { upgrades } = get()
    return upgrades.offlineProgress.effect(upgrades.offlineProgress.currentLevel)
  }

}), { name: 'meta-store' }))