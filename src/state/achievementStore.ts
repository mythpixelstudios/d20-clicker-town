import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useChar } from './charStore'
import { useCombat } from './combatStore'
import { useTown } from './townStore'
import { useZoneProgression } from './zoneProgressionStore'
import { useEconomy } from './economyStore'

export interface Achievement {
  id: string
  name: string
  description: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  condition: () => boolean
  reward: AchievementReward
  category: 'combat' | 'progression' | 'crafting' | 'town' | 'general'
  isHidden?: boolean // Hidden until unlocked
}

export interface AchievementReward {
  type: 'gold' | 'xp' | 'stat_points' | 'items'
  amount: number
  description: string
}

export interface CompletedAchievement {
  id: string
  completedAt: number
  claimed: boolean
}

interface AchievementState {
  completed: Record<string, CompletedAchievement>
  lastChecked: number
  
  // Actions
  checkAchievements: () => string[] // Returns newly completed achievement IDs
  claimReward: (achievementId: string) => void
  isCompleted: (achievementId: string) => boolean
  isClaimed: (achievementId: string) => boolean
  getCompletedCount: () => number
  getUnclaimedRewards: () => string[]
}

// Achievement definitions - Phase 1 micro-achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_stat',
    name: 'Growing Stronger',
    description: 'Assign your first stat point',
    tier: 'bronze',
    category: 'progression',
    condition: () => {
      const stats = useChar.getState().stats
      const hasStats = stats.str > 0 || stats.dex > 0 || stats.con > 0 || stats.int > 0 || stats.wis > 0
      console.log('First stat achievement check:', { stats, hasStats })
      return hasStats
    },
    reward: { type: 'gold', amount: 10, description: '+10 Gold' }
  },
  {
    id: 'first_kill',
    name: 'First Blood',
    description: 'Kill your first monster',
    tier: 'bronze',
    category: 'combat',
    condition: () => useCombat.getState().killCount > 0,
    reward: { type: 'xp', amount: 25, description: '+25 XP' }
  },
  {
    id: 'kill_5_monsters',
    name: 'Monster Slayer',
    description: 'Kill 5 monsters',
    tier: 'bronze',
    category: 'combat',
    condition: () => useCombat.getState().killCount >= 5,
    reward: { type: 'gold', amount: 50, description: '+50 Gold' }
  },
  {
    id: 'reach_zone_3',
    name: 'Deeper Venture',
    description: 'Reach Zone 3',
    tier: 'silver',
    category: 'progression',
    condition: () => (useZoneProgression.getState().currentZone || 1) >= 3,
    reward: { type: 'stat_points', amount: 1, description: '+1 Stat Point' }
  },
  {
    id: 'upgrade_building',
    name: 'Town Developer',
    description: 'Upgrade any building',
    tier: 'bronze',
    category: 'town',
    condition: () => {
      const buildings = useTown.getState().buildings
      return buildings.some(building => building.level > 0)
    },
    reward: { type: 'gold', amount: 75, description: '+75 Gold' }
  },
  {
    id: 'craft_first_item',
    name: 'Apprentice Crafter',
    description: 'Craft your first item',
    tier: 'bronze',
    category: 'crafting',
    condition: () => useChar.getState().skills.crafting.xp > 0,
    reward: { type: 'xp', amount: 50, description: '+50 XP' }
  },
  {
    id: 'equip_weapon',
    name: 'Armed and Ready',
    description: 'Equip your first weapon',
    tier: 'bronze',
    category: 'general',
    condition: () => useChar.getState().equipped.weapon !== undefined,
    reward: { type: 'gold', amount: 30, description: '+30 Gold' }
  },
  {
    id: 'level_up',
    name: 'Level Up',
    description: 'Reach level 2',
    tier: 'bronze',
    category: 'progression',
    condition: () => useChar.getState().level >= 2,
    reward: { type: 'stat_points', amount: 1, description: '+1 Stat Point' }
  },
  {
    id: 'gold_hoarder',
    name: 'Gold Hoarder',
    description: 'Accumulate 100 gold',
    tier: 'silver',
    category: 'general',
    condition: () => useEconomy.getState().gold >= 100,
    reward: { type: 'gold', amount: 25, description: '+25 Gold' }
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat your first boss',
    tier: 'silver',
    category: 'combat',
    condition: () => (useZoneProgression.getState().currentZone || 1) >= 5, // Bosses appear every 5 zones
    reward: { type: 'xp', amount: 100, description: '+100 XP' }
  },
  {
    id: 'kill_50_monsters',
    name: 'Experienced Hunter',
    description: 'Kill 50 monsters',
    tier: 'silver',
    category: 'combat',
    condition: () => useCombat.getState().killCount >= 50,
    reward: { type: 'gold', amount: 200, description: '+200 Gold' }
  },
  {
    id: 'reach_zone_6',
    name: 'Seasoned Adventurer',
    description: 'Reach Zone 6',
    tier: 'gold',
    category: 'progression',
    condition: () => (useZoneProgression.getState().currentZone || 1) >= 6,
    reward: { type: 'stat_points', amount: 2, description: '+2 Stat Points' }
  },
  {
    id: 'level_5',
    name: 'Rising Power',
    description: 'Reach level 5',
    tier: 'silver',
    category: 'progression',
    condition: () => useChar.getState().level >= 5,
    reward: { type: 'gold', amount: 150, description: '+150 Gold' }
  },
  {
    id: 'craft_5_items',
    name: 'Skilled Crafter',
    description: 'Successfully craft 5 items',
    tier: 'silver',
    category: 'crafting',
    condition: () => {
      const craftingXp = useChar.getState().skills.crafting.xp
      // Assuming 10 XP per craft minimum, 5 crafts = 50 XP
      return craftingXp >= 50
    },
    reward: { type: 'xp', amount: 100, description: '+100 XP' }
  },
  {
    id: 'gold_collector',
    name: 'Gold Collector',
    description: 'Accumulate 1000 gold',
    tier: 'gold',
    category: 'general',
    condition: () => useEconomy.getState().gold >= 1000,
    reward: { type: 'gold', amount: 100, description: '+100 Gold' }
  },
  {
    id: 'full_gear',
    name: 'Fully Equipped',
    description: 'Equip items in all slots',
    tier: 'gold',
    category: 'general',
    condition: () => {
      const equipped = useChar.getState().equipped
      return !!(equipped.weapon && equipped.helmet && equipped.chest && 
                equipped.legs && equipped.boots && equipped.gloves)
    },
    reward: { type: 'stat_points', amount: 2, description: '+2 Stat Points' }
  },
  {
    id: 'town_builder',
    name: 'Town Builder',
    description: 'Build 3 different buildings',
    tier: 'silver',
    category: 'town',
    condition: () => {
      const buildings = useTown.getState().buildings
      const builtCount = buildings.filter(building => building.level > 0).length
      return builtCount >= 3
    },
    reward: { type: 'gold', amount: 250, description: '+250 Gold' }
  },
  {
    id: 'max_building',
    name: 'Master Builder',
    description: 'Upgrade any building to level 5',
    tier: 'gold',
    category: 'town',
    condition: () => {
      const buildings = useTown.getState().buildings
      return buildings.some(building => building.level >= 5)
    },
    reward: { type: 'xp', amount: 200, description: '+200 XP' }
  }
]

export const useAchievements = create<AchievementState>()(
  persist(
    (set, get) => ({
      completed: {},
      lastChecked: Date.now(),

      checkAchievements: () => {
        const state = get()
        const newlyCompleted: string[] = []
        
        for (const achievement of ACHIEVEMENTS) {
          // Skip if already completed
          if (state.completed[achievement.id]) continue
          
          // Check condition
          try {
            if (achievement.condition()) {
              const completedAchievement: CompletedAchievement = {
                id: achievement.id,
                completedAt: Date.now(),
                claimed: false
              }
              
              set((state) => ({
                completed: {
                  ...state.completed,
                  [achievement.id]: completedAchievement
                }
              }))
              
              newlyCompleted.push(achievement.id)
            }
          } catch (error) {
            console.warn(`Error checking achievement ${achievement.id}:`, error)
          }
        }
        
        set({ lastChecked: Date.now() })
        return newlyCompleted
      },

      claimReward: (achievementId: string) => {
        const state = get()
        const completed = state.completed[achievementId]
        if (!completed || completed.claimed) return
        
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
        if (!achievement) return
        
        // Log the achievement
        import('./logStore').then(({ logAchievement }) => {
          logAchievement(achievement.name)
        })
        
        // Apply reward based on type
        switch (achievement.reward.type) {
          case 'gold':
            useEconomy.getState().addGold(achievement.reward.amount)
            break
          case 'xp':
            useChar.getState().addXP(achievement.reward.amount)
            break
          case 'stat_points':
            // This would need to be added to charStore if not already present
            console.log(`Would grant ${achievement.reward.amount} stat points`)
            break
        }
        
        // Mark as claimed
        set((state) => ({
          completed: {
            ...state.completed,
            [achievementId]: {
              ...completed,
              claimed: true
            }
          }
        }))
      },

      isCompleted: (achievementId: string) => {
        return !!get().completed[achievementId]
      },

      isClaimed: (achievementId: string) => {
        const completed = get().completed[achievementId]
        return completed ? completed.claimed : false
      },

      getCompletedCount: () => {
        return Object.keys(get().completed).length
      },

      getUnclaimedRewards: () => {
        const state = get()
        return Object.values(state.completed)
          .filter(comp => !comp.claimed)
          .map(comp => comp.id)
      }
    }),
    {
      name: 'achievement-store-v2',
    }
  )
)

// Helper function to get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id)
}

// Helper function to get achievements by category
export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category)
}