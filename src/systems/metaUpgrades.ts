// Utility functions to apply meta upgrades to game stats
// This avoids circular dependency issues between stores

import { useMetaStore } from '../state/metaStore'
import { useMonsterCompendium } from '../state/monsterCompendiumStore'

export function applyMetaUpgrades(stats: any): any {
  try {
    const metaStore = useMetaStore.getState()
    
    const globalDpsMultiplier = metaStore.getGlobalDpsMultiplier()
    const autoSpeedMultiplier = metaStore.getAutoSpeedMultiplier()
    
    // Get compendium bonuses
    const compendiumBonuses = getCompendiumBonuses()
    const damageBonusMultiplier = 1 + (compendiumBonuses.damageBonus / 100)
    
    return {
      ...stats,
      clickDamage: Math.floor((stats.clickDamage || 0) * globalDpsMultiplier * damageBonusMultiplier),
      autoDamage: Math.floor((stats.autoDamage || 0) * globalDpsMultiplier * damageBonusMultiplier),
      autoSpeed: Math.floor((stats.autoSpeed || 0) * autoSpeedMultiplier),
      goldBonus: (stats.goldBonus || 0) + (compendiumBonuses.goldBonus / 100),
      xpBonus: (stats.xpBonus || 0) + (compendiumBonuses.xpBonus / 100),
      critChance: (stats.critChance || 0) + compendiumBonuses.critChanceBonus
    }
  } catch {
    // Return stats unchanged if meta store is not available
    return stats
  }
}

export function getCompendiumBonuses() {
  try {
    const compendiumStore = useMonsterCompendium.getState()
    return compendiumStore.getCompendiumBonuses()
  } catch {
    return {
      damageBonus: 0,
      goldBonus: 0,
      xpBonus: 0,
      critChanceBonus: 0
    }
  }
}

export function getQuestEfficiencyMultiplier(): number {
  try {
    const metaStore = useMetaStore.getState()
    return metaStore.getQuestEfficiencyMultiplier()
  } catch {
    return 1
  }
}

export function getOfflineProgressMultiplier(): number {
  try {
    const metaStore = useMetaStore.getState()
    return metaStore.getOfflineProgressMultiplier()
  } catch {
    return 0.5 // Default 50% offline progress
  }
}