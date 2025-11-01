import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getOfflineProgressMultiplier } from '../systems/metaUpgrades'

interface OfflineProgressState {
  lastActiveTime: number
  offlineProgressEnabled: boolean
  maxOfflineHours: number
  
  // Actions
  setLastActiveTime: (time: number) => void
  calculateOfflineProgress: () => OfflineProgressResult | null
  enableOfflineProgress: () => void
  disableOfflineProgress: () => void
}

export interface OfflineProgressResult {
  timeOffline: number // milliseconds
  gold: number
  materials: Record<string, number>
  timeOfflineFormatted: string
  intelligenceBonus: number // Bonus from INT stat (percentage)
}

export const useOfflineProgress = create<OfflineProgressState>()(persist((set, get) => ({
  lastActiveTime: Date.now(),
  offlineProgressEnabled: true,
  maxOfflineHours: 6,

  setLastActiveTime: (time: number) => {
    set({ lastActiveTime: time })
  },

  calculateOfflineProgress: () => {
    const { lastActiveTime, offlineProgressEnabled, maxOfflineHours } = get()
    
    if (!offlineProgressEnabled) return null
    
    const now = Date.now()
    const timeOffline = now - lastActiveTime
    const oneHour = 60 * 60 * 1000
    const maxOfflineTime = maxOfflineHours * oneHour
    
    // Only calculate if offline for more than 5 minutes
    if (timeOffline < 5 * 60 * 1000) {
      return null
    }
    
    const effectiveOfflineTime = Math.min(timeOffline, maxOfflineTime)
    
    // Get current player stats for offline calculations
    // Use a simpler approach to avoid circular dependencies
    let playerLevel = 1
    let currentZone = 1
    let intelligenceStat = 0
    
    try {
      // Try to read from localStorage directly to avoid circular imports
      const charData = localStorage.getItem('char-v3')
      const zoneData = localStorage.getItem('zone-progression-store')
      
      if (charData) {
        const parsed = JSON.parse(charData)
        playerLevel = parsed.state?.level || 1
        intelligenceStat = parsed.state?.stats?.int || 0
      }
      
      if (zoneData) {
        const parsed = JSON.parse(zoneData)
        currentZone = parsed.state?.currentZone || 1
      }
    } catch {
      // Use defaults if parsing fails
    }
    
    // Calculate intelligence bonus for offline efficiency
    // Each point of INT = +2% offline efficiency (max 200% at 100 INT)
    const intelligenceBonus = Math.min(2, intelligenceStat * 0.02)
    
    // Base offline rates: 25% of online rates (1/4), modified by meta upgrades and intelligence
    const baseOfflineRate = 0.25
    const offlineMultiplier = getOfflineProgressMultiplier()
    const totalOfflineEfficiency = baseOfflineRate * offlineMultiplier * (1 + intelligenceBonus)
    
    // Calculate offline gains based on player power
    // Gold scales with zone and level
    const baseGoldPerSecond = Math.max(1, currentZone * 5 + playerLevel * 2) * totalOfflineEfficiency
    
    const totalSeconds = effectiveOfflineTime / 1000
    
    const gold = Math.floor(baseGoldPerSecond * totalSeconds)
    
    // Materials based on zone (more materials in higher zones)
    const materials: Record<string, number> = {}
    if (currentZone >= 2) {
      materials.iron = Math.floor(totalSeconds * totalOfflineEfficiency * 0.15 * currentZone)
    }
    if (currentZone >= 3) {
      materials.wood = Math.floor(totalSeconds * totalOfflineEfficiency * 0.12 * currentZone)
    }
    if (currentZone >= 4) {
      materials.fiber = Math.floor(totalSeconds * totalOfflineEfficiency * 0.1 * currentZone)
    }
    if (currentZone >= 6) {
      materials.crystal = Math.floor(totalSeconds * totalOfflineEfficiency * 0.05 * currentZone)
    }
    
    // Format time
    const formatTime = (ms: number): string => {
      const hours = Math.floor(ms / oneHour)
      const minutes = Math.floor((ms % oneHour) / (60 * 1000))
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      } else {
        return `${minutes}m`
      }
    }
    
    return {
      timeOffline: effectiveOfflineTime,
      gold,
      materials,
      timeOfflineFormatted: formatTime(effectiveOfflineTime),
      intelligenceBonus: intelligenceBonus * 100 // Convert to percentage for display
    }
  },

  enableOfflineProgress: () => {
    set({ offlineProgressEnabled: true })
  },

  disableOfflineProgress: () => {
    set({ offlineProgressEnabled: false })
  }

}), { name: 'offline-progress-store' }))