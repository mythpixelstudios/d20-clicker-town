import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getRelicById, calculateRelicStats, type Relic, type RelicRarity, type RelicEffect } from '../data/relics'

interface DiscoveredRelic {
  id: string
  discoveredAt: number // Timestamp
  level: number // For scalable relics
}

interface RelicSlot {
  rarity: RelicRarity
  maxCount: number
  equipped: string[] // Array of relic IDs
}

interface RelicStoreState {
  // Discovered relics
  discoveredRelics: Record<string, DiscoveredRelic>
  
  // Equipped relics (limited by rarity)
  relicSlots: Record<RelicRarity, RelicSlot>
  
  // Cached stats from equipped relics
  cachedStats: RelicEffect['stats']
  
  // UI state
  selectedRelicId: string | null
  showRelicPanel: boolean
  
  // Actions
  discoverRelic: (relicId: string) => void
  equipRelic: (relicId: string) => boolean
  unequipRelic: (relicId: string) => void
  upgradeRelic: (relicId: string) => void
  
  // Utility
  checkRelicRequirements: (relicId: string) => {
    met: boolean
    missing: string[]
  }
  getTotalStats: () => RelicEffect['stats']
  getEquippedRelics: () => Relic[]
  getAvailableSlots: (rarity: RelicRarity) => number
  
  // UI actions
  selectRelic: (relicId: string | null) => void
  setShowRelicPanel: (show: boolean) => void
  
  // Reset
  reset: () => void
}

const initialRelicSlots: Record<RelicRarity, RelicSlot> = {
  uncommon: { rarity: 'uncommon', maxCount: 2, equipped: [] },
  rare: { rarity: 'rare', maxCount: 2, equipped: [] },
  epic: { rarity: 'epic', maxCount: 1, equipped: [] },
  legendary: { rarity: 'legendary', maxCount: 1, equipped: [] },
  mythic: { rarity: 'mythic', maxCount: 1, equipped: [] },
}

export const useRelicStore = create<RelicStoreState>()(
  persist(
    (set, get) => ({
      discoveredRelics: {},
      relicSlots: initialRelicSlots,
      cachedStats: {},
      selectedRelicId: null,
      showRelicPanel: false,

      discoverRelic: (relicId: string) => {
        const relic = getRelicById(relicId)
        if (!relic) {
          console.warn(`Relic ${relicId} not found`)
          return
        }

        const { discoveredRelics } = get()
        if (discoveredRelics[relicId]) {
          console.log(`Relic ${relicId} already discovered`)
          return
        }

        set({
          discoveredRelics: {
            ...discoveredRelics,
            [relicId]: {
              id: relicId,
              discoveredAt: Date.now(),
              level: 1,
            },
          },
        })

        console.log(`Discovered ${relic.rarity} relic: ${relic.name}!`)
      },

      equipRelic: (relicId: string) => {
        const relic = getRelicById(relicId)
        if (!relic) return false

        const { discoveredRelics, relicSlots } = get()
        if (!discoveredRelics[relicId]) {
          console.warn(`Cannot equip undiscovered relic: ${relicId}`)
          return false
        }

        const slot = relicSlots[relic.rarity]
        
        // Check if already equipped
        if (slot.equipped.includes(relicId)) {
          console.log(`Relic ${relicId} already equipped`)
          return false
        }

        // Check if slot is full
        if (slot.equipped.length >= slot.maxCount) {
          console.log(`No available ${relic.rarity} relic slots. Unequip a relic first.`)
          return false
        }

        // Equip the relic
        const newSlots = {
          ...relicSlots,
          [relic.rarity]: {
            ...slot,
            equipped: [...slot.equipped, relicId],
          },
        }

        // Recalculate stats
        const allEquippedIds = Object.values(newSlots).flatMap(s => s.equipped)
        const newStats = calculateRelicStats(allEquippedIds)

        set({
          relicSlots: newSlots,
          cachedStats: newStats,
        })

        console.log(`Equipped ${relic.name}`)
        return true
      },

      unequipRelic: (relicId: string) => {
        const relic = getRelicById(relicId)
        if (!relic) return

        const { relicSlots } = get()
        const slot = relicSlots[relic.rarity]

        if (!slot.equipped.includes(relicId)) {
          console.warn(`Relic ${relicId} is not equipped`)
          return
        }

        // Unequip the relic
        const newSlots = {
          ...relicSlots,
          [relic.rarity]: {
            ...slot,
            equipped: slot.equipped.filter(id => id !== relicId),
          },
        }

        // Recalculate stats
        const allEquippedIds = Object.values(newSlots).flatMap(s => s.equipped)
        const newStats = calculateRelicStats(allEquippedIds)

        set({
          relicSlots: newSlots,
          cachedStats: newStats,
        })

        console.log(`Unequipped ${relic.name}`)
      },

      upgradeRelic: (relicId: string) => {
        const relic = getRelicById(relicId)
        if (!relic || !relic.maxLevel) return

        const { discoveredRelics } = get()
        const discoveredRelic = discoveredRelics[relicId]
        if (!discoveredRelic) return

        if (discoveredRelic.level >= relic.maxLevel) {
          console.log(`${relic.name} is already at max level`)
          return
        }

        // Upgrade the relic
        set({
          discoveredRelics: {
            ...discoveredRelics,
            [relicId]: {
              ...discoveredRelic,
              level: discoveredRelic.level + 1,
            },
          },
        })

        // Recalculate stats if equipped
        const { relicSlots } = get()
        const allEquippedIds = Object.values(relicSlots).flatMap(s => s.equipped)
        if (allEquippedIds.includes(relicId)) {
          const newStats = calculateRelicStats(allEquippedIds)
          set({ cachedStats: newStats })
        }

        console.log(`Upgraded ${relic.name} to level ${discoveredRelic.level + 1}`)
      },

      checkRelicRequirements: (relicId: string) => {
        const relic = getRelicById(relicId)
        if (!relic) return { met: false, missing: ['Relic not found'] }

        const missing: string[] = []
        const reqs = relic.discoveryRequirements

        if (!reqs) return { met: true, missing: [] }

        // Check level requirement
        if (reqs.level !== undefined) {
          const charStore = (window as any).charStore?.getState?.()
          const playerLevel = charStore?.level || 0
          if (playerLevel < reqs.level) {
            missing.push(`Requires level ${reqs.level}`)
          }
        }

        // Check zone requirement
        if (reqs.zone !== undefined) {
          const zoneStore = (window as any).zoneProgressionStore?.getState?.()
          const currentZone = zoneStore?.currentZone || 1
          if (currentZone < reqs.zone) {
            missing.push(`Requires reaching zone ${reqs.zone}`)
          }
        }

        // Check prestige level
        if (reqs.prestigeLevel !== undefined) {
          const metaStore = (window as any).metaStore?.getState?.()
          const prestigeLevel = metaStore?.prestigeLevel || 0
          if (prestigeLevel < reqs.prestigeLevel) {
            missing.push(`Requires prestige level ${reqs.prestigeLevel}`)
          }
        }

        // Check boss defeats
        if (reqs.bossDefeats) {
          const combatStore = (window as any).combatStore?.getState?.()
          const bossDefeats = combatStore?.bossDefeats || {}
          
          Object.entries(reqs.bossDefeats).forEach(([bossId, requiredCount]) => {
            const actualCount = bossDefeats[bossId] || 0
            if (actualCount < requiredCount) {
              missing.push(`Defeat ${bossId} ${requiredCount} times (${actualCount}/${requiredCount})`)
            }
          })
        }

        // Check achievements
        if (reqs.achievementIds) {
          const achievementStore = (window as any).achievementStore?.getState?.()
          const unlockedAchievements = achievementStore?.unlockedAchievements || []
          
          reqs.achievementIds.forEach(achId => {
            if (!unlockedAchievements.includes(achId)) {
              missing.push(`Requires achievement: ${achId}`)
            }
          })
        }

        return {
          met: missing.length === 0,
          missing,
        }
      },

      getTotalStats: () => {
        return get().cachedStats
      },

      getEquippedRelics: () => {
        const { relicSlots } = get()
        const equippedIds = Object.values(relicSlots).flatMap(s => s.equipped)
        return equippedIds.map(id => getRelicById(id)).filter((r): r is Relic => r !== undefined)
      },

      getAvailableSlots: (rarity: RelicRarity) => {
        const { relicSlots } = get()
        const slot = relicSlots[rarity]
        return slot.maxCount - slot.equipped.length
      },

      selectRelic: (relicId: string | null) => {
        set({ selectedRelicId: relicId })
      },

      setShowRelicPanel: (show: boolean) => {
        set({ showRelicPanel: show })
      },

      reset: () => {
        set({
          discoveredRelics: {},
          relicSlots: initialRelicSlots,
          cachedStats: {},
          selectedRelicId: null,
        })
      },
    }),
    {
      name: 'clicker-town-relics',
      version: 1,
    }
  )
)

// Export for global access (for requirement checking)
if (typeof window !== 'undefined') {
  (window as any).relicStore = useRelicStore
}
