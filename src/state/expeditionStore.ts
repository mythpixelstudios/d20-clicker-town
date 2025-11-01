import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  expeditions, 
  getExpeditionById, 
  calculateExpeditionDuration, 
  calculateExpeditionSuccessChance,
  type Expedition, 
  type ExpeditionReward,
  type ExpeditionStatus 
} from '../data/expeditions'

interface ActiveExpedition {
  expeditionId: string
  npcId: string
  startTime: number
  endTime: number
  status: ExpeditionStatus
  successChance: number
  eventsTriggered: string[]
}

interface CompletedExpedition {
  expeditionId: string
  completedAt: number
  success: boolean
  rewardsEarned: ExpeditionReward[]
  npcId: string
}

interface ExpeditionStoreState {
  // Active expeditions
  activeExpeditions: Record<string, ActiveExpedition> // keyed by unique ID
  
  // History
  completedExpeditions: CompletedExpedition[]
  expeditionCompletionCounts: Record<string, number> // expeditionId -> count
  
  // Statistics
  totalExpeditionsStarted: number
  totalExpeditionsCompleted: number
  totalExpeditionsSucceeded: number
  totalExpeditionsFailed: number
  
  // Actions
  startExpedition: (expeditionId: string, npcId: string) => boolean
  completeExpedition: (activeExpeditionId: string) => void
  cancelExpedition: (activeExpeditionId: string) => void
  applyExpeditionRewards: (rewards: ExpeditionReward[], npcId: string) => void
  
  // Utility
  canStartExpedition: (expeditionId: string, npcId: string) => { 
    canStart: boolean 
    reasons: string[] 
  }
  getExpeditionProgress: (activeExpeditionId: string) => number // 0-1
  getAvailableExpeditions: () => Expedition[]
  isNPCOnExpedition: (npcId: string) => boolean
  getActiveExpeditionForNPC: (npcId: string) => ActiveExpedition | null
  
  // Tick update (call every second)
  tick: () => void
  
  // Reset
  reset: () => void
}

let expeditionCounter = 0

export const useExpeditionStore = create<ExpeditionStoreState>()(
  persist(
    (set, get) => ({
      activeExpeditions: {},
      completedExpeditions: [],
      expeditionCompletionCounts: {},
      totalExpeditionsStarted: 0,
      totalExpeditionsCompleted: 0,
      totalExpeditionsSucceeded: 0,
      totalExpeditionsFailed: 0,

      startExpedition: (expeditionId: string, npcId: string) => {
        const expedition = getExpeditionById(expeditionId)
        if (!expedition) {
          console.warn(`Expedition ${expeditionId} not found`)
          return false
        }

        // Check if can start
        const { canStart, reasons } = get().canStartExpedition(expeditionId, npcId)
        if (!canStart) {
          console.log(`Cannot start expedition: ${reasons.join(', ')}`)
          return false
        }

        // Get NPC data
        const tavernStore = (window as any).tavernStore?.getState?.()
        const npc = tavernStore?.npcs?.[npcId]
        if (!npc) {
          console.warn(`NPC ${npcId} not found`)
          return false
        }

        // Calculate duration and success chance with NPC bonuses
        const npcTraits = npc.traits?.map((t: any) => t.id) || []
        const npcLevel = npc.level || 1
        const duration = calculateExpeditionDuration(expedition, npcTraits)
        const successChance = calculateExpeditionSuccessChance(expedition, npcTraits, npcLevel)

        // Pay costs
        const economyStore = (window as any).economyStore?.getState?.()
        if (expedition.cost.gold && economyStore) {
          if (economyStore.gold < expedition.cost.gold) {
            console.log('Not enough gold')
            return false
          }
          economyStore.subtractGold(expedition.cost.gold)
        }

        if (expedition.cost.materials && economyStore) {
          for (const [materialId, amount] of Object.entries(expedition.cost.materials)) {
            if ((economyStore.materials[materialId] || 0) < amount) {
              console.log(`Not enough ${materialId}`)
              return false
            }
            economyStore.subtractMaterial(materialId, amount)
          }
        }

        // Create active expedition
        const now = Date.now()
        const activeExpeditionId = `expedition_${++expeditionCounter}_${now}`
        
        const activeExpedition: ActiveExpedition = {
          expeditionId,
          npcId,
          startTime: now,
          endTime: now + duration * 1000,
          status: 'in_progress',
          successChance,
          eventsTriggered: [],
        }

        set({
          activeExpeditions: {
            ...get().activeExpeditions,
            [activeExpeditionId]: activeExpedition,
          },
          totalExpeditionsStarted: get().totalExpeditionsStarted + 1,
        })

        console.log(`Started expedition: ${expedition.name} with NPC ${npcId}`)
        console.log(`Duration: ${duration}s, Success chance: ${(successChance * 100).toFixed(1)}%`)

        return true
      },

      completeExpedition: (activeExpeditionId: string) => {
        const { activeExpeditions, expeditionCompletionCounts } = get()
        const activeExpedition = activeExpeditions[activeExpeditionId]
        
        if (!activeExpedition) {
          console.warn(`Active expedition ${activeExpeditionId} not found`)
          return
        }

        const expedition = getExpeditionById(activeExpedition.expeditionId)
        if (!expedition) return

        // Determine success
        const success = Math.random() < activeExpedition.successChance

        // Get rewards
        let rewards: ExpeditionReward[] = success 
          ? [...expedition.successRewards] 
          : [...(expedition.failureRewards || [])]

        // Process random events
        if (expedition.events) {
          expedition.events.forEach(event => {
            if (Math.random() < event.chance) {
              console.log(`Expedition event triggered: ${event.description}`)
              activeExpedition.eventsTriggered.push(event.id)
              
              // Apply event effects
              if (event.effects.additionalRewards) {
                rewards.push(...event.effects.additionalRewards)
              }
              
              if (event.effects.rewardMultiplier) {
                // This would need to be applied when processing rewards
              }
            }
          })
        }

        // Apply rewards
        get().applyExpeditionRewards(rewards, activeExpedition.npcId)

        // Record completion
        const completedExpedition: CompletedExpedition = {
          expeditionId: activeExpedition.expeditionId,
          completedAt: Date.now(),
          success,
          rewardsEarned: rewards,
          npcId: activeExpedition.npcId,
        }

        // Remove from active
        const newActiveExpeditions = { ...activeExpeditions }
        delete newActiveExpeditions[activeExpeditionId]

        set({
          activeExpeditions: newActiveExpeditions,
          completedExpeditions: [...get().completedExpeditions, completedExpedition],
          expeditionCompletionCounts: {
            ...expeditionCompletionCounts,
            [activeExpedition.expeditionId]: (expeditionCompletionCounts[activeExpedition.expeditionId] || 0) + 1,
          },
          totalExpeditionsCompleted: get().totalExpeditionsCompleted + 1,
          totalExpeditionsSucceeded: success ? get().totalExpeditionsSucceeded + 1 : get().totalExpeditionsSucceeded,
          totalExpeditionsFailed: !success ? get().totalExpeditionsFailed + 1 : get().totalExpeditionsFailed,
        })

        console.log(`Expedition completed: ${expedition.name} - ${success ? 'Success!' : 'Failed'}`)
      },

      applyExpeditionRewards: (rewards: ExpeditionReward[], npcId: string) => {
        const charStore = (window as any).charStore?.getState?.()
        const economyStore = (window as any).economyStore?.getState?.()
        const relicStore = (window as any).relicStore?.getState?.()
        const tavernStore = (window as any).tavernStore?.getState?.()

        rewards.forEach(reward => {
          switch (reward.type) {
            case 'gold':
              if (economyStore && reward.amount) {
                economyStore.addGold(reward.amount)
                console.log(`Earned ${reward.amount} gold from expedition`)
              }
              break

            case 'xp':
              if (charStore && reward.amount) {
                charStore.gainXP(reward.amount)
                console.log(`Earned ${reward.amount} XP from expedition`)
              }
              break

            case 'materials':
              if (economyStore && reward.materialIds) {
                Object.entries(reward.materialIds).forEach(([materialId, amount]) => {
                  economyStore.addMaterial(materialId, amount)
                  console.log(`Earned ${amount}x ${materialId} from expedition`)
                })
              }
              break

            case 'relic':
              if (relicStore && reward.itemId) {
                relicStore.discoverRelic(reward.itemId)
                console.log(`Discovered relic: ${reward.itemId}`)
              }
              break

            case 'equipment':
              // TODO: Implement equipment rewards
              console.log('Equipment reward - not yet implemented')
              break

            case 'npc_xp':
              if (tavernStore && reward.npcXpAmount) {
                // Award XP to the NPC
                tavernStore.grantNPCXP?.(npcId, reward.npcXpAmount)
                console.log(`NPC ${npcId} earned ${reward.npcXpAmount} XP`)
              }
              break
          }
        })
      },

      cancelExpedition: (activeExpeditionId: string) => {
        const { activeExpeditions } = get()
        const activeExpedition = activeExpeditions[activeExpeditionId]
        
        if (!activeExpedition) return

        // Remove from active (no rewards)
        const newActiveExpeditions = { ...activeExpeditions }
        delete newActiveExpeditions[activeExpeditionId]

        set({
          activeExpeditions: newActiveExpeditions,
        })

        console.log(`Expedition cancelled: ${activeExpedition.expeditionId}`)
      },

      canStartExpedition: (expeditionId: string, npcId: string) => {
        const expedition = getExpeditionById(expeditionId)
        if (!expedition) {
          return { canStart: false, reasons: ['Expedition not found'] }
        }

        const reasons: string[] = []

        // Check if NPC is already on expedition
        if (get().isNPCOnExpedition(npcId)) {
          reasons.push('NPC is already on an expedition')
        }

        // Check if not repeatable and already completed
        if (!expedition.repeatable) {
          const { expeditionCompletionCounts } = get()
          if ((expeditionCompletionCounts[expeditionId] || 0) > 0) {
            reasons.push('Expedition is not repeatable and has been completed')
          }
        }

        // Check requirements
        const reqs = expedition.requirements
        if (reqs) {
          const charStore = (window as any).charStore?.getState?.()
          const zoneStore = (window as any).zoneProgressionStore?.getState?.()
          const townStore = (window as any).townStore?.getState?.()
          const economyStore = (window as any).economyStore?.getState?.()
          const tavernStore = (window as any).tavernStore?.getState?.()

          if (reqs.minPlayerLevel && charStore && charStore.level < reqs.minPlayerLevel) {
            reasons.push(`Requires player level ${reqs.minPlayerLevel}`)
          }

          if (reqs.minZone && zoneStore && zoneStore.currentZone < reqs.minZone) {
            reasons.push(`Requires zone ${reqs.minZone}`)
          }

          if (reqs.npcLevel && tavernStore) {
            const npc = tavernStore.npcs?.[npcId]
            if (!npc || npc.level < reqs.npcLevel) {
              reasons.push(`Requires NPC level ${reqs.npcLevel}`)
            }
          }

          if (reqs.buildings && townStore) {
            reqs.buildings.forEach(req => {
              const building = townStore.buildings?.find((b: any) => b.id === req.id)
              if (!building || building.level < req.level) {
                reasons.push(`Requires ${req.id} level ${req.level}`)
              }
            })
          }

          if (reqs.completedExpeditions) {
            const { expeditionCompletionCounts } = get()
            reqs.completedExpeditions.forEach(expId => {
              if (!expeditionCompletionCounts[expId]) {
                reasons.push(`Requires completing ${expId} first`)
              }
            })
          }

          if (reqs.materials && economyStore) {
            Object.entries(reqs.materials).forEach(([materialId, amount]) => {
              if ((economyStore.materials[materialId] || 0) < amount) {
                reasons.push(`Requires ${amount}x ${materialId}`)
              }
            })
          }
        }

        // Check costs
        const economyStore = (window as any).economyStore?.getState?.()
        if (expedition.cost.gold && economyStore) {
          if (economyStore.gold < expedition.cost.gold) {
            reasons.push(`Not enough gold (need ${expedition.cost.gold})`)
          }
        }

        if (expedition.cost.materials && economyStore) {
          Object.entries(expedition.cost.materials).forEach(([materialId, amount]) => {
            if ((economyStore.materials[materialId] || 0) < amount) {
              reasons.push(`Not enough ${materialId} (need ${amount})`)
            }
          })
        }

        return {
          canStart: reasons.length === 0,
          reasons,
        }
      },

      getExpeditionProgress: (activeExpeditionId: string) => {
        const { activeExpeditions } = get()
        const activeExpedition = activeExpeditions[activeExpeditionId]
        
        if (!activeExpedition) return 0

        const now = Date.now()
        const total = activeExpedition.endTime - activeExpedition.startTime
        const elapsed = now - activeExpedition.startTime

        return Math.min(1, Math.max(0, elapsed / total))
      },

      getAvailableExpeditions: () => {
        return expeditions.filter(expedition => {
          // For simplicity, just check basic requirements
          const reqs = expedition.requirements
          if (!reqs) return true

          const charStore = (window as any).charStore?.getState?.()
          const zoneStore = (window as any).zoneProgressionStore?.getState?.()

          if (reqs.minPlayerLevel && charStore && charStore.level < reqs.minPlayerLevel) {
            return false
          }

          if (reqs.minZone && zoneStore && zoneStore.currentZone < reqs.minZone) {
            return false
          }

          return true
        })
      },

      isNPCOnExpedition: (npcId: string) => {
        const { activeExpeditions } = get()
        return Object.values(activeExpeditions).some(exp => exp.npcId === npcId)
      },

      getActiveExpeditionForNPC: (npcId: string) => {
        const { activeExpeditions } = get()
        const entry = Object.entries(activeExpeditions).find(([_, exp]) => exp.npcId === npcId)
        return entry ? entry[1] : null
      },

      tick: () => {
        const now = Date.now()
        const { activeExpeditions } = get()

        // Check for completed expeditions
        Object.entries(activeExpeditions).forEach(([id, expedition]) => {
          if (now >= expedition.endTime && expedition.status === 'in_progress') {
            get().completeExpedition(id)
          }
        })
      },

      reset: () => {
        set({
          activeExpeditions: {},
          completedExpeditions: [],
          expeditionCompletionCounts: {},
          totalExpeditionsStarted: 0,
          totalExpeditionsCompleted: 0,
          totalExpeditionsSucceeded: 0,
          totalExpeditionsFailed: 0,
        })
      },
    }),
    {
      name: 'clicker-town-expeditions',
      version: 1,
      partialize: (state) => ({
        // Don't persist active expeditions in progress (they'll restart on page load)
        completedExpeditions: state.completedExpeditions,
        expeditionCompletionCounts: state.expeditionCompletionCounts,
        totalExpeditionsStarted: state.totalExpeditionsStarted,
        totalExpeditionsCompleted: state.totalExpeditionsCompleted,
        totalExpeditionsSucceeded: state.totalExpeditionsSucceeded,
        totalExpeditionsFailed: state.totalExpeditionsFailed,
      })
    }
  )
)

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).expeditionStore = useExpeditionStore
}
