import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ZoneProgress {
  zoneId: number
  level: number // How many times this zone has been cleared
  isUnlocked: boolean
  bestTime?: number
}

interface ZoneProgressionState {
  zoneProgress: Record<number, ZoneProgress>
  currentZone: number | null
  showZoneSelection: boolean
  prestigeLevel: number
  prestigeTokens: number
  
  // Zone management
  initializeZone: (zoneId: number) => void
  unlockZone: (zoneId: number) => void
  clearZone: (zoneId: number) => void
  selectZone: (zoneId: number) => void
  showZoneSelect: () => void
  hideZoneSelect: () => void
  
  // Prestige system
  canPrestige: () => boolean
  performPrestige: () => void
  
  // Utility functions
  getZoneLevel: (zoneId: number) => number
  getZoneDifficultyMultiplier: (zoneId: number) => number
  getZoneRewardMultiplier: (zoneId: number) => number
  isZoneUnlocked: (zoneId: number) => boolean
}

export const useZoneProgression = create<ZoneProgressionState>()(persist((set, get) => ({
  zoneProgress: {
    1: { zoneId: 1, level: 1, isUnlocked: true } // Start with zone 1 unlocked
  },
  currentZone: 1,
  showZoneSelection: false,
  prestigeLevel: 0,
  prestigeTokens: 0,

  initializeZone: (zoneId: number) => {
    const { zoneProgress } = get()
    if (!zoneProgress[zoneId]) {
      set({
        zoneProgress: {
          ...zoneProgress,
          [zoneId]: { zoneId, level: 1, isUnlocked: false }
        }
      })
    }
  },

  unlockZone: (zoneId: number) => {
    const { zoneProgress } = get()
    const existingProgress = zoneProgress[zoneId]
    
    set({
      zoneProgress: {
        ...zoneProgress,
        [zoneId]: existingProgress 
          ? { ...existingProgress, isUnlocked: true }
          : { zoneId, level: 1, isUnlocked: true }
      }
    })
  },

  clearZone: (zoneId: number) => {
    const { zoneProgress } = get()
    const currentProgress = zoneProgress[zoneId] || { zoneId, level: 1, isUnlocked: true }
    
    set({
      zoneProgress: {
        ...zoneProgress,
        [zoneId]: {
          ...currentProgress,
          level: currentProgress.level + 1
        }
      },
      showZoneSelection: true
    })

    // Auto-unlock next zone if it exists and meets requirements
    const nextZoneId = zoneId + 1
    if (nextZoneId <= 11) { // Max zone ID
      get().unlockZone(nextZoneId)
    }
  },

  selectZone: (zoneId: number) => {
    set({ 
      currentZone: zoneId,
      showZoneSelection: false 
    })
    // Notify combat store of zone change
    setTimeout(async () => {
      const { useCombat } = await import('./combatStore')
      useCombat.getState().changeZone()
    }, 0)
  },

  showZoneSelect: () => set({ showZoneSelection: true }),
  hideZoneSelect: () => set({ showZoneSelection: false }),

  canPrestige: () => {
    const { zoneProgress } = get()
    const voidNexusProgress = zoneProgress[11]
    return voidNexusProgress?.level >= 2 // Must clear Void Nexus at least once
  },

  performPrestige: () => {
    const { prestigeLevel, prestigeTokens, zoneProgress } = get()
    
    // Calculate prestige tokens based on progression depth
    // Formula: Base tokens + bonus per zone + bonus per zone level + prestige multiplier
    let earnedTokens = 10 // Base tokens
    
    // Add tokens for each zone unlocked (exponential scaling)
    for (const progress of Object.values(zoneProgress)) {
      if (progress.isUnlocked) {
        const zoneBonus = Math.floor(progress.zoneId * 2) // 2 tokens per zone
        const levelBonus = Math.floor((progress.level - 1) * 1.5) // 1.5 tokens per clear beyond first
        earnedTokens += zoneBonus + levelBonus
      }
    }
    
    // Apply prestige multiplier (gets better each prestige)
    const prestigeMultiplier = 1 + (prestigeLevel * 0.15) // +15% per previous prestige
    earnedTokens = Math.floor(earnedTokens * prestigeMultiplier)
    
    // Log the prestige
    const newPrestigeLevel = prestigeLevel + 1
    setTimeout(async () => {
      const { logPrestige } = await import('./logStore')
      logPrestige(newPrestigeLevel, earnedTokens)
    }, 0)
    
    // Reset progress but keep prestige rewards
    set({
      zoneProgress: {
        1: { zoneId: 1, level: 1, isUnlocked: true }
      },
      currentZone: 1,
      showZoneSelection: false,
      prestigeLevel: prestigeLevel + 1,
      prestigeTokens: prestigeTokens + earnedTokens,
    })

    // Reset character level and stats via charStore
    setTimeout(async () => {
      const { useChar } = await import('./charStore')
      const charState = useChar.getState()
      
      // Reset to level 1 but keep some base stats based on prestige level
      charState.resetForPrestige(prestigeLevel + 1)
    }, 0)
  },

  getZoneLevel: (zoneId: number) => {
    const { zoneProgress } = get()
    return zoneProgress[zoneId]?.level || 1
  },

  getZoneDifficultyMultiplier: (zoneId: number) => {
    const level = get().getZoneLevel(zoneId)
    // Changed from 1.5 to 2.5 for much steeper scaling
    // Level 1: 1x, Level 2: 2.5x, Level 3: 6.25x, Level 5: 39x, Level 10: 9,537x
    // This creates a challenging exponential curve similar to Clicker Heroes
    return Math.pow(2.5, level - 1)
  },

  getZoneRewardMultiplier: (zoneId: number) => {
    const level = get().getZoneLevel(zoneId)
    // Increased from 30% to 80% to match the steeper difficulty
    // This ensures rewards feel worth the increased challenge
    return 1 + (level - 1) * 0.8 // 80% more rewards each level
  },

  isZoneUnlocked: (zoneId: number) => {
    const { zoneProgress } = get()
    return zoneProgress[zoneId]?.isUnlocked || false
  }

}), { name: 'zone-progression-store' }))