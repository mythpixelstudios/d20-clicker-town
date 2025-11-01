import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SessionMetrics {
  sessionStartTime: number
  totalSessionTime: number // accumulated across all sessions
  sessionsCount: number
  zonesCleared: number
  monstersKilled: number
  goldEarned: number
  xpGained: number
  itemsCrafted: number
  questsCompleted: number
  prestigeCount: number
  averageSessionLength: number // in minutes
  zonesPerMinute: number
  lastActiveDate: string
}

interface AnalyticsState {
  metrics: SessionMetrics
  currentSessionStartTime: number
  
  // Actions
  startSession: () => void
  endSession: () => void
  recordZoneCleared: () => void
  recordMonsterKilled: () => void
  recordGoldEarned: (amount: number) => void
  recordXpGained: (amount: number) => void
  recordItemCrafted: () => void
  recordQuestCompleted: () => void
  recordPrestige: () => void
  getSessionStats: () => {
    currentSessionTime: number
    zonesPerMinute: number
    goldPerMinute: number
    xpPerMinute: number
  }
  getDailyStats: () => {
    sessionsToday: number
    timePlayedToday: number
    zonesPerDay: number
  }
}

const defaultMetrics: SessionMetrics = {
  sessionStartTime: 0,
  totalSessionTime: 0,
  sessionsCount: 0,
  zonesCleared: 0,
  monstersKilled: 0,
  goldEarned: 0,
  xpGained: 0,
  itemsCrafted: 0,
  questsCompleted: 0,
  prestigeCount: 0,
  averageSessionLength: 0,
  zonesPerMinute: 0,
  lastActiveDate: new Date().toISOString().split('T')[0]
}

export const useAnalytics = create<AnalyticsState>()(persist((set, get) => ({
  metrics: defaultMetrics,
  currentSessionStartTime: 0,

  startSession: () => {
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]
    
    set(state => ({
      currentSessionStartTime: now,
      metrics: {
        ...state.metrics,
        sessionStartTime: now,
        sessionsCount: state.metrics.sessionsCount + 1,
        lastActiveDate: today
      }
    }))
  },

  endSession: () => {
    const { currentSessionStartTime, metrics } = get()
    const now = Date.now()
    const sessionDuration = now - currentSessionStartTime
    
    if (sessionDuration > 0) {
      const newTotalTime = metrics.totalSessionTime + sessionDuration
      const newAverageLength = newTotalTime / metrics.sessionsCount / (1000 * 60) // minutes
      
      set(state => ({
        currentSessionStartTime: 0,
        metrics: {
          ...state.metrics,
          totalSessionTime: newTotalTime,
          averageSessionLength: newAverageLength,
          zonesPerMinute: state.metrics.zonesCleared / (newTotalTime / (1000 * 60)) || 0
        }
      }))
    }
  },

  recordZoneCleared: () => {
    set(state => ({
      metrics: {
        ...state.metrics,
        zonesCleared: state.metrics.zonesCleared + 1
      }
    }))
  },

  recordMonsterKilled: () => {
    set(state => ({
      metrics: {
        ...state.metrics,
        monstersKilled: state.metrics.monstersKilled + 1
      }
    }))
  },

  recordGoldEarned: (amount: number) => {
    set(state => ({
      metrics: {
        ...state.metrics,
        goldEarned: state.metrics.goldEarned + amount
      }
    }))
  },

  recordXpGained: (amount: number) => {
    set(state => ({
      metrics: {
        ...state.metrics,
        xpGained: state.metrics.xpGained + amount
      }
    }))
  },

  recordItemCrafted: () => {
    set(state => ({
      metrics: {
        ...state.metrics,
        itemsCrafted: state.metrics.itemsCrafted + 1
      }
    }))
  },

  recordQuestCompleted: () => {
    set(state => ({
      metrics: {
        ...state.metrics,
        questsCompleted: state.metrics.questsCompleted + 1
      }
    }))
  },

  recordPrestige: () => {
    set(state => ({
      metrics: {
        ...state.metrics,
        prestigeCount: state.metrics.prestigeCount + 1
      }
    }))
  },

  getSessionStats: () => {
    const { currentSessionStartTime, metrics } = get()
    const currentSessionTime = currentSessionStartTime > 0 
      ? Date.now() - currentSessionStartTime 
      : 0
    
    const sessionMinutes = currentSessionTime / (1000 * 60)
    
    return {
      currentSessionTime: Math.floor(sessionMinutes),
      zonesPerMinute: sessionMinutes > 0 ? metrics.zonesCleared / sessionMinutes : 0,
      goldPerMinute: sessionMinutes > 0 ? metrics.goldEarned / sessionMinutes : 0,
      xpPerMinute: sessionMinutes > 0 ? metrics.xpGained / sessionMinutes : 0
    }
  },

  getDailyStats: () => {
    const { metrics } = get()
    const today = new Date().toISOString().split('T')[0]
    
    // Simple implementation - assumes all activity is from today
    // In a real implementation, you'd track daily breakdowns
    const isToday = metrics.lastActiveDate === today
    
    return {
      sessionsToday: isToday ? metrics.sessionsCount : 0,
      timePlayedToday: isToday ? metrics.totalSessionTime / (1000 * 60) : 0, // minutes
      zonesPerDay: isToday ? metrics.zonesCleared : 0
    }
  }

}), { name: 'analytics-store' }))