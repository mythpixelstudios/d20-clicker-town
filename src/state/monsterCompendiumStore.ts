import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Monster, MonsterAffix } from '../data/monsters'

export interface DiscoveredMonster {
  monsterId: string
  name: string
  zone: number
  timesEncountered: number
  timesKilled: number
  firstEncountered: number // timestamp
  lastEncountered: number // timestamp
  affixVariants: Set<string> // Set of affix combinations encountered
}

interface MonsterCompendiumState {
  discoveredMonsters: Record<string, DiscoveredMonster>
  totalMonstersEncountered: number
  totalMonstersKilled: number
  
  // Actions
  recordMonsterEncounter: (monster: Monster, zone: number, affixes?: MonsterAffix[]) => void
  recordMonsterKill: (monsterId: string) => void
  getDiscoveryPercentage: () => number
  getZoneDiscoveryPercentage: (zone: number) => number
  getMonsterStats: (monsterId: string) => DiscoveredMonster | null
  getAllDiscoveredMonsters: () => DiscoveredMonster[]
  getRecentDiscoveries: (limit?: number) => DiscoveredMonster[]
  
  // Passive bonuses
  getCompendiumBonuses: () => CompendiumBonuses
}

export interface CompendiumBonuses {
  damageBonus: number // Percentage bonus to all damage
  goldBonus: number // Percentage bonus to gold
  xpBonus: number // Percentage bonus to XP
  critChanceBonus: number // Flat bonus to crit chance
}

function createAffixKey(affixes?: MonsterAffix[]): string {
  if (!affixes || affixes.length === 0) return 'none'
  return affixes.map(a => a.id).sort((a, b) => a.localeCompare(b)).join(',')
}

export const useMonsterCompendium = create<MonsterCompendiumState>()(persist((set, get) => ({
  discoveredMonsters: {},
  totalMonstersEncountered: 0,
  totalMonstersKilled: 0,

  recordMonsterEncounter: (monster: Monster, zone: number, affixes?: MonsterAffix[]) => {
    const { discoveredMonsters } = get()
    const monsterId = monster.name // Use name as ID since monsters don't have explicit IDs
    const affixKey = createAffixKey(affixes)
    const now = Date.now()
    
    const existing = discoveredMonsters[monsterId]
    
    if (existing) {
      // Update existing entry
      const newAffixVariants = new Set([...existing.affixVariants, affixKey])
      
      set({
        discoveredMonsters: {
          ...discoveredMonsters,
          [monsterId]: {
            ...existing,
            timesEncountered: existing.timesEncountered + 1,
            lastEncountered: now,
            affixVariants: newAffixVariants
          }
        },
        totalMonstersEncountered: get().totalMonstersEncountered + 1
      })
    } else {
      // New discovery
      const newMonster: DiscoveredMonster = {
        monsterId,
        name: monster.name,
        zone,
        timesEncountered: 1,
        timesKilled: 0,
        firstEncountered: now,
        lastEncountered: now,
        affixVariants: new Set([affixKey])
      }
      
      // Log the new discovery
      import('./logStore').then(({ logCompendiumDiscovery }) => {
        logCompendiumDiscovery(monster.name, zone)
      })
      
      set({
        discoveredMonsters: {
          ...discoveredMonsters,
          [monsterId]: newMonster
        },
        totalMonstersEncountered: get().totalMonstersEncountered + 1
      })
    }
  },

  recordMonsterKill: (monsterId: string) => {
    const { discoveredMonsters } = get()
    const existing = discoveredMonsters[monsterId]
    
    if (existing) {
      set({
        discoveredMonsters: {
          ...discoveredMonsters,
          [monsterId]: {
            ...existing,
            timesKilled: existing.timesKilled + 1
          }
        },
        totalMonstersKilled: get().totalMonstersKilled + 1
      })
    }
  },

  getDiscoveryPercentage: () => {
    // This would need to be updated with the total number of unique monsters in the game
    // For now, assume there are ~50 unique monsters across all zones
    const totalUniqueMonsters = 50
    const discovered = Object.keys(get().discoveredMonsters).length
    return Math.min(100, (discovered / totalUniqueMonsters) * 100)
  },

  getZoneDiscoveryPercentage: (zone: number) => {
    const { discoveredMonsters } = get()
    const zoneMonsters = Object.values(discoveredMonsters).filter(m => m.zone === zone)
    
    // Estimate ~5 unique monsters per zone
    const estimatedMonstersPerZone = 5
    return Math.min(100, (zoneMonsters.length / estimatedMonstersPerZone) * 100)
  },

  getMonsterStats: (monsterId: string) => {
    return get().discoveredMonsters[monsterId] || null
  },

  getAllDiscoveredMonsters: () => {
    return Object.values(get().discoveredMonsters).sort((a, b) => b.lastEncountered - a.lastEncountered)
  },

  getRecentDiscoveries: (limit = 10) => {
    return get().getAllDiscoveredMonsters()
      .filter(m => m.timesEncountered === 1) // Only new discoveries
      .slice(0, limit)
  },

  getCompendiumBonuses: () => {
    const discoveryPercentage = get().getDiscoveryPercentage()
    const totalKills = get().totalMonstersKilled
    const uniqueSpecies = Object.keys(get().discoveredMonsters).length
    
    // Calculate bonuses based on discovery progress
    // +1% damage per 10% completion
    const damageBonus = Math.floor(discoveryPercentage / 10) * 1
    
    // +0.5% gold per 10% completion
    const goldBonus = Math.floor(discoveryPercentage / 10) * 0.5
    
    // +0.5% XP per 10% completion
    const xpBonus = Math.floor(discoveryPercentage / 10) * 0.5
    
    // +0.1% crit chance per 5 unique species discovered
    const critChanceBonus = Math.floor(uniqueSpecies / 5) * 0.1
    
    // Milestone bonuses for total kills
    let killMilestoneBonus = 0
    if (totalKills >= 1000) killMilestoneBonus += 2
    if (totalKills >= 5000) killMilestoneBonus += 3
    if (totalKills >= 10000) killMilestoneBonus += 5
    
    return {
      damageBonus: damageBonus + killMilestoneBonus,
      goldBonus,
      xpBonus,
      critChanceBonus
    }
  }

}), { 
  name: 'monster-compendium-store',
  // Custom storage to handle Set serialization
  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name)
      if (!str) return null
      
      const data = JSON.parse(str)
      // Convert affixVariants arrays back to Sets
      if (data.state?.discoveredMonsters) {
        Object.values(data.state.discoveredMonsters).forEach((monster: any) => {
          if (monster.affixVariants && Array.isArray(monster.affixVariants)) {
            monster.affixVariants = new Set(monster.affixVariants)
          }
        })
      }
      return data
    },
    setItem: (name, value) => {
      // Convert Sets to arrays for serialization
      const serializable = JSON.parse(JSON.stringify(value, (key, val) => {
        if (val instanceof Set) {
          return [...val]
        }
        return val
      }))
      localStorage.setItem(name, JSON.stringify(serializable))
    },
    removeItem: (name) => localStorage.removeItem(name)
  }
}))