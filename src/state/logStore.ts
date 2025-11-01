import { create } from 'zustand'

export type LogType = 
  | 'monster_death' 
  | 'zone_upgrade' 
  | 'crafting_success' 
  | 'crafting_failure' 
  | 'item_drop' 
  | 'level_up'
  | 'town_upgrade'
  | 'tavern_quest'
  | 'achievement'
  | 'prestige'
  | 'daily_quest'
  | 'compendium'

export type LogCategory = 'combat' | 'crafting' | 'town' | 'tavern' | 'progression' | 'general'

// Map log types to categories
export const getLogCategory = (type: LogType): LogCategory => {
  switch (type) {
    case 'monster_death':
    case 'zone_upgrade':
    case 'compendium':
      return 'combat'
    case 'crafting_success':
    case 'crafting_failure':
      return 'crafting'
    case 'town_upgrade':
      return 'town'
    case 'tavern_quest':
    case 'daily_quest':
      return 'tavern'
    case 'level_up':
    case 'item_drop':
    case 'achievement':
    case 'prestige':
      return 'progression'
    default:
      return 'general'
  }
}

export interface LogEntry {
  id: string
  type: LogType
  category: LogCategory
  message: string
  timestamp: number
  data?: any // Additional data for context
}

interface LogStore {
  logs: LogEntry[]
  maxLogs: number
  activeFilter: LogCategory | 'all'
  addLog: (type: LogType, message: string, data?: any) => void
  clearLogs: () => void
  getLogs: () => LogEntry[]
  getFilteredLogs: () => LogEntry[]
  setFilter: (filter: LogCategory | 'all') => void
}

export const useLog = create<LogStore>((set, get) => ({
  logs: [],
  maxLogs: 100, // Keep last 100 logs
  activeFilter: 'all',

  addLog: (type: LogType, message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      type,
      category: getLogCategory(type),
      message,
      timestamp: Date.now(),
      data
    }

    set(state => {
      const newLogs = [newLog, ...state.logs].slice(0, state.maxLogs)
      return { logs: newLogs }
    })
  },

  clearLogs: () => set({ logs: [] }),

  getLogs: () => get().logs,

  getFilteredLogs: () => {
    const { logs, activeFilter } = get()
    if (activeFilter === 'all') return logs
    return logs.filter(log => log.category === activeFilter)
  },

  setFilter: (filter: LogCategory | 'all') => set({ activeFilter: filter })
}))

// Helper functions for common log types
export const logMonsterDeath = (monsterName: string, xpGained: number, goldGained: number) => {
  useLog.getState().addLog(
    'monster_death',
    `Defeated ${monsterName}! (+${xpGained} XP, +${goldGained} gold)`,
    { monsterName, xpGained, goldGained }
  )
}

export const logZoneUpgrade = (newZone: number) => {
  useLog.getState().addLog(
    'zone_upgrade',
    `Advanced to Zone ${newZone}!`,
    { newZone }
  )
}

export const logCraftingSuccess = (itemName: string, skillXpGained: number) => {
  useLog.getState().addLog(
    'crafting_success',
    `Successfully crafted ${itemName}! (+${skillXpGained} Crafting XP)`,
    { itemName, skillXpGained }
  )
}

export const logCraftingFailure = (itemName: string) => {
  useLog.getState().addLog(
    'crafting_failure',
    `Failed to craft ${itemName}`,
    { itemName }
  )
}

export const logItemDrop = (itemName: string, rarity: string) => {
  useLog.getState().addLog(
    'item_drop',
    `Found ${itemName} (${rarity})!`,
    { itemName, rarity }
  )
}

export const logLevelUp = (newLevel: number, statPointsGained: number) => {
  useLog.getState().addLog(
    'level_up',
    `Level up! Now level ${newLevel} (+${statPointsGained} stat points)`,
    { newLevel, statPointsGained }
  )
}

export const logTownUpgrade = (buildingName: string, newLevel: number) => {
  useLog.getState().addLog(
    'town_upgrade',
    `Upgraded ${buildingName} to level ${newLevel}!`,
    { buildingName, newLevel }
  )
}

export const logTavernQuest = (questName: string, reward: string) => {
  useLog.getState().addLog(
    'tavern_quest',
    `Completed quest: ${questName} (${reward})`,
    { questName, reward }
  )
}

export const logDailyQuest = (questName: string, reward: string) => {
  useLog.getState().addLog(
    'daily_quest',
    `Daily Quest Complete: ${questName} (${reward})`,
    { questName, reward }
  )
}

export const logAchievement = (achievementName: string) => {
  useLog.getState().addLog(
    'achievement',
    `Achievement Unlocked: ${achievementName}!`,
    { achievementName }
  )
}

export const logPrestige = (prestigeLevel: number, tokensEarned: number) => {
  useLog.getState().addLog(
    'prestige',
    `Performed Prestige! Now Prestige Level ${prestigeLevel} (+${tokensEarned} tokens)`,
    { prestigeLevel, tokensEarned }
  )
}

export const logCompendiumDiscovery = (monsterName: string, zone: number) => {
  useLog.getState().addLog(
    'compendium',
    `New Discovery: ${monsterName} in Zone ${zone}!`,
    { monsterName, zone }
  )
}