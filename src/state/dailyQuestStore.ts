import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getQuestEfficiencyMultiplier } from '../systems/metaUpgrades'

export interface DailyQuest {
  id: string
  title: string
  description: string
  type: 'kill' | 'collect' | 'upgrade' | 'zone' | 'prestige'
  target: number
  progress: number
  reward: {
    gold?: number
    xp?: number
    materials?: Record<string, number>
    prestigeTokens?: number
  }
  completed: boolean
  claimed: boolean
}

interface DailyQuestState {
  quests: DailyQuest[]
  lastQuestDate: string
  rerollsUsed: number
  maxRerolls: number
  loginStreak: number
  lastLoginDate: string
  
  // Actions
  generateDailyQuests: () => void
  updateQuestProgress: (questId: string, amount: number) => void
  claimQuestReward: (questId: string) => DailyQuest['reward'] | null
  rerollQuest: (questId: string) => void
  checkDailyLogin: () => void
  getLoginStreakReward: () => { gold: number; prestigeTokens?: number } | null
}

const questTemplates = [
  {
    type: 'kill' as const,
    title: 'Monster Slayer',
    description: 'Defeat {target} monsters',
    baseTarget: 50,
    reward: { gold: 500, xp: 200 }
  },
  {
    type: 'collect' as const,
    title: 'Resource Gatherer',
    description: 'Collect {target} materials',
    baseTarget: 20,
    reward: { gold: 300, materials: { iron: 5 } }
  },
  {
    type: 'upgrade' as const,
    title: 'Town Builder',
    description: 'Upgrade buildings {target} times',
    baseTarget: 3,
    reward: { gold: 800, xp: 300 }
  },
  {
    type: 'zone' as const,
    title: 'Explorer',
    description: 'Clear {target} zones',
    baseTarget: 10,
    reward: { gold: 1000, xp: 400 }
  },
  {
    type: 'prestige' as const,
    title: 'Ascension',
    description: 'Perform prestige {target} time(s)',
    baseTarget: 1,
    reward: { prestigeTokens: 5, gold: 2000 }
  }
]

function generateRandomQuest(): DailyQuest {
  const template = questTemplates[Math.floor(Math.random() * questTemplates.length)]
  const difficultyMultiplier = 0.5 + Math.random() * 1.5 // 0.5x to 2x difficulty
  const target = Math.max(1, Math.floor(template.baseTarget * difficultyMultiplier))
  
  const reward = { ...template.reward }
  
  // Scale rewards based on difficulty
  if (reward.gold) reward.gold = Math.floor(reward.gold * difficultyMultiplier)
  if (reward.xp) reward.xp = Math.floor(reward.xp * difficultyMultiplier)
  if (reward.materials) {
    Object.keys(reward.materials).forEach(key => {
      const materials = reward.materials as Record<string, number>
      materials[key] = Math.max(1, Math.floor(materials[key] * difficultyMultiplier))
    })
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    title: template.title,
    description: template.description.replace('{target}', target.toString()),
    type: template.type,
    target,
    progress: 0,
    reward,
    completed: false,
    claimed: false
  }
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export const useDailyQuests = create<DailyQuestState>()(persist((set, get) => ({
  quests: [],
  lastQuestDate: '',
  rerollsUsed: 0,
  maxRerolls: 1,
  loginStreak: 0,
  lastLoginDate: '',

  generateDailyQuests: () => {
    const today = getTodayString()
    const { lastQuestDate } = get()
    
    if (lastQuestDate !== today) {
      const newQuests = Array.from({ length: 5 }, () => generateRandomQuest())
      set({
        quests: newQuests,
        lastQuestDate: today,
        rerollsUsed: 0
      })
    }
  },

  updateQuestProgress: (questId: string, amount: number) => {
    const { quests } = get()
    const updatedQuests = quests.map(quest => {
      if (quest.id === questId && !quest.completed) {
        const newProgress = Math.min(quest.target, quest.progress + amount)
        const isCompleted = newProgress >= quest.target
        
        return {
          ...quest,
          progress: newProgress,
          completed: isCompleted
        }
      }
      return quest
    })
    
    set({ quests: updatedQuests })
  },

  claimQuestReward: (questId: string) => {
    const { quests } = get()
    const quest = quests.find(q => q.id === questId)
    
    if (!quest || !quest.completed || quest.claimed) return null
    
    // Apply quest efficiency multiplier from meta upgrades
    const efficiency = getQuestEfficiencyMultiplier()
    
    // Mark quest as claimed
    const updatedQuests = quests.map(q => 
      q.id === questId ? { ...q, claimed: true } : q
    )
    
    set({ quests: updatedQuests })
    
    // Return scaled rewards for the UI to apply
    const scaledReward = { ...quest.reward }
    if (scaledReward.gold) scaledReward.gold = Math.floor(scaledReward.gold * efficiency)
    if (scaledReward.xp) scaledReward.xp = Math.floor(scaledReward.xp * efficiency)
    if (scaledReward.materials) {
      Object.keys(scaledReward.materials).forEach(key => {
        const materials = scaledReward.materials as Record<string, number>
        materials[key] = Math.floor(materials[key] * efficiency)
      })
    }
    
    return scaledReward
  },

  rerollQuest: (questId: string) => {
    const { quests, rerollsUsed, maxRerolls } = get()
    
    if (rerollsUsed >= maxRerolls) return
    
    const newQuest = generateRandomQuest()
    const updatedQuests = quests.map(quest => 
      quest.id === questId ? newQuest : quest
    )
    
    set({
      quests: updatedQuests,
      rerollsUsed: rerollsUsed + 1
    })
  },

  checkDailyLogin: () => {
    const today = getTodayString()
    const { lastLoginDate, loginStreak } = get()
    
    if (lastLoginDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split('T')[0]
      
      let newStreak = 1
      if (lastLoginDate === yesterdayString) {
        // Consecutive day
        newStreak = loginStreak + 1
      }
      
      set({
        lastLoginDate: today,
        loginStreak: newStreak
      })
      
      // Apply login streak rewards
      const reward = get().getLoginStreakReward()
      if (reward) {
        // Apply rewards asynchronously to avoid circular dependency
        setTimeout(async () => {
          const { useEconomy } = await import('./economyStore')
          const { useZoneProgression } = await import('./zoneProgressionStore')
          
          useEconomy.getState().addGold(reward.gold)
          
          if (reward.prestigeTokens) {
            useZoneProgression.setState(state => ({
              prestigeTokens: state.prestigeTokens + (reward.prestigeTokens || 0)
            }))
          }
        }, 0)
      }
      
      // Also generate daily quests
      get().generateDailyQuests()
    }
  },

  getLoginStreakReward: () => {
    const { loginStreak } = get()
    
    if (loginStreak === 0) return null
    
    // Rewards based on streak
    const baseGold = 100 * loginStreak
    let reward: { gold: number; prestigeTokens?: number } = { gold: baseGold }
    
    // Bonus prestige tokens every 7 days
    if (loginStreak % 7 === 0) {
      reward.prestigeTokens = Math.floor(loginStreak / 7)
    }
    
    return reward
  }

}), { name: 'daily-quests-store' }))