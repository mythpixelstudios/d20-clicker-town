import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { gameEvents, getEventById, getBuffById, getScaledEventReward, type GameEvent, type EventBuff, type EventReward } from '../data/events'

interface ActiveEvent {
  eventId: string
  startTime: number
  expiryTime: number
  interacted: boolean
  clicksRemaining?: number
}

interface ActiveBuff {
  buffId: string
  startTime: number
  expiryTime: number
  effects: EventBuff['effects']
}

interface EventHistory {
  eventId: string
  triggeredAt: number
  rewardsEarned: EventReward[]
  choiceSelected?: string
}

interface EventStoreState {
  // Active event state
  activeEvent: ActiveEvent | null
  activeBuffs: Record<string, ActiveBuff>
  
  // Tracking
  eventHistory: EventHistory[]
  lastSpawnChecks: Record<string, number> // eventId -> timestamp
  eventCooldowns: Record<string, number> // eventId -> expiry timestamp
  
  // Statistics
  totalEventsTriggered: number
  totalEventInteractions: number
  
  // Actions
  checkForEventSpawns: () => void
  interactWithEvent: (choiceId?: string) => void
  dismissEvent: () => void
  applyEventRewards: (rewards: EventReward[]) => void
  
  // Buff management
  addBuff: (buffId: string) => void
  removeBuff: (buffId: string) => void
  getActiveBuffMultipliers: () => {
    damageMultiplier: number
    goldMultiplier: number
    xpMultiplier: number
    materialDropChance: number
    critChanceBonus: number
    autoSpeedMultiplier: number
  }
  
  // Utility
  isEventOnCooldown: (eventId: string) => boolean
  canEventSpawn: (event: GameEvent) => boolean
  
  // Tick update (call every second)
  tick: () => void
  
  // Reset
  reset: () => void
}

export const useEventStore = create<EventStoreState>()(
  persist(
    (set, get) => ({
      activeEvent: null,
      activeBuffs: {},
      eventHistory: [],
      lastSpawnChecks: {},
      eventCooldowns: {},
      totalEventsTriggered: 0,
      totalEventInteractions: 0,

      checkForEventSpawns: () => {
        const now = Date.now()
        const { activeEvent, lastSpawnChecks, canEventSpawn } = get()
        
        // Don't spawn if there's already an active event
        if (activeEvent) return
        
        // Check each event for spawning
        for (const event of gameEvents) {
          const lastCheck = lastSpawnChecks[event.id] || 0
          const timeSinceCheck = (now - lastCheck) / 1000
          
          // Check if enough time has passed since last check
          if (timeSinceCheck < event.spawnInterval) continue
          
          // Update last check time
          set({
            lastSpawnChecks: {
              ...get().lastSpawnChecks,
              [event.id]: now,
            }
          })
          
          // Check if event can spawn
          if (!canEventSpawn(event)) continue
          
          // Roll for spawn
          if (Math.random() < event.spawnChance) {
            // Event spawns!
            const newActiveEvent: ActiveEvent = {
              eventId: event.id,
              startTime: now,
              expiryTime: now + event.duration * 1000,
              interacted: false,
              clicksRemaining: event.clicksRequired,
            }
            
            set({
              activeEvent: newActiveEvent,
              totalEventsTriggered: get().totalEventsTriggered + 1,
            })
            
            console.log(`Event spawned: ${event.name}`)
            
            // If automatic event, trigger rewards immediately
            if (event.interactionType === 'automatic') {
              setTimeout(() => {
                get().interactWithEvent()
              }, 100)
            }
            
            break // Only spawn one event at a time
          }
        }
      },

      interactWithEvent: (choiceId?: string) => {
        const { activeEvent } = get()
        if (!activeEvent || activeEvent.interacted) return
        
        const event = getEventById(activeEvent.eventId)
        if (!event) return
        
        const now = Date.now()
        
        // Check if event has expired
        if (now > activeEvent.expiryTime) {
          get().dismissEvent()
          return
        }
        
        let rewards: EventReward[] = []
        let success = true
        
        // Handle different interaction types
        if (event.interactionType === 'click') {
          // For click events, track clicks
          const clicksRemaining = (activeEvent.clicksRemaining || 1) - 1
          
          if (clicksRemaining > 0) {
            set({
              activeEvent: {
                ...activeEvent,
                clicksRemaining,
              }
            })
            return
          }
          
          rewards = [...event.baseRewards]
        } else if (event.interactionType === 'choice' && event.choices) {
          // Handle choice-based events
          const choice = event.choices.find(c => c.id === choiceId)
          if (!choice) return
          
          // Check success chance
          if (choice.chance !== undefined && Math.random() > choice.chance) {
            success = false
            console.log(`Event choice ${choiceId} failed (chance: ${choice.chance})`)
          } else {
            rewards = [...choice.rewards]
          }
        } else if (event.interactionType === 'automatic') {
          rewards = [...event.baseRewards]
        }
        
        // Roll for bonus rewards
        if (success && event.bonusRewards && event.bonusChance) {
          if (Math.random() < event.bonusChance) {
            rewards.push(...event.bonusRewards)
            console.log('Bonus rewards earned!')
          }
        }
        
        // Apply rewards
        if (success) {
          get().applyEventRewards(rewards)
        }
        
        // Mark as interacted and set cooldown
        set({
          activeEvent: {
            ...activeEvent,
            interacted: true,
          },
          totalEventInteractions: get().totalEventInteractions + 1,
          eventCooldowns: {
            ...get().eventCooldowns,
            [event.id]: now + (event.cooldown || 0) * 1000,
          },
          eventHistory: [
            ...get().eventHistory,
            {
              eventId: event.id,
              triggeredAt: now,
              rewardsEarned: rewards,
              choiceSelected: choiceId,
            }
          ]
        })
        
        // Dismiss event after a short delay
        setTimeout(() => {
          get().dismissEvent()
        }, 2000)
      },

      applyEventRewards: (rewards: EventReward[]) => {
        const charStore = (window as any).charStore?.getState?.()
        const economyStore = (window as any).economyStore?.getState?.()
        const relicStore = (window as any).relicStore?.getState?.()
        
        rewards.forEach(reward => {
          switch (reward.type) {
            case 'gold':
              if (economyStore && reward.amount) {
                const scaled = getScaledEventReward(reward.amount, charStore?.level || 1)
                economyStore.addGold(scaled)
                console.log(`Earned ${scaled} gold from event`)
              }
              break
              
            case 'xp':
              if (charStore && reward.amount) {
                const scaled = getScaledEventReward(reward.amount, charStore?.level || 1)
                charStore.gainXP(scaled)
                console.log(`Earned ${scaled} XP from event`)
              }
              break
              
            case 'materials':
              if (economyStore && reward.materialIds) {
                Object.entries(reward.materialIds).forEach(([materialId, amount]) => {
                  economyStore.addMaterial(materialId, amount)
                  console.log(`Earned ${amount}x ${materialId} from event`)
                })
              }
              break
              
            case 'buff':
              if (reward.buffId) {
                get().addBuff(reward.buffId)
              }
              break
              
            case 'relic':
              if (relicStore && reward.itemId) {
                // For random relics, pick one based on player level
                if (reward.itemId === 'random_relic') {
                  // TODO: Implement random relic selection based on player level
                  console.log('Random relic reward - not yet implemented')
                } else {
                  relicStore.discoverRelic(reward.itemId)
                }
              }
              break
              
            case 'equipment':
              // TODO: Implement equipment rewards
              console.log('Equipment reward - not yet implemented')
              break
          }
        })
      },

      dismissEvent: () => {
        set({ activeEvent: null })
      },

      addBuff: (buffId: string) => {
        const buff = getBuffById(buffId)
        if (!buff) return
        
        const now = Date.now()
        const activeBuff: ActiveBuff = {
          buffId,
          startTime: now,
          expiryTime: now + buff.duration * 1000,
          effects: buff.effects,
        }
        
        set({
          activeBuffs: {
            ...get().activeBuffs,
            [buffId]: activeBuff,
          }
        })
        
        console.log(`Buff activated: ${buff.name} (${buff.duration}s)`)
      },

      removeBuff: (buffId: string) => {
        const { activeBuffs } = get()
        const newBuffs = { ...activeBuffs }
        delete newBuffs[buffId]
        
        set({ activeBuffs: newBuffs })
        console.log(`Buff expired: ${buffId}`)
      },

      getActiveBuffMultipliers: () => {
        const { activeBuffs } = get()
        const now = Date.now()
        
        const multipliers = {
          damageMultiplier: 1,
          goldMultiplier: 1,
          xpMultiplier: 1,
          materialDropChance: 0,
          critChanceBonus: 0,
          autoSpeedMultiplier: 1,
        }
        
        Object.values(activeBuffs).forEach(buff => {
          // Skip expired buffs
          if (now > buff.expiryTime) return
          
          // Stack multiplicative bonuses multiplicatively
          if (buff.effects.damageMultiplier) {
            multipliers.damageMultiplier *= buff.effects.damageMultiplier
          }
          if (buff.effects.goldMultiplier) {
            multipliers.goldMultiplier *= buff.effects.goldMultiplier
          }
          if (buff.effects.xpMultiplier) {
            multipliers.xpMultiplier *= buff.effects.xpMultiplier
          }
          if (buff.effects.autoSpeedMultiplier) {
            multipliers.autoSpeedMultiplier *= buff.effects.autoSpeedMultiplier
          }
          
          // Stack additive bonuses additively
          if (buff.effects.materialDropChance) {
            multipliers.materialDropChance += buff.effects.materialDropChance
          }
          if (buff.effects.critChanceBonus) {
            multipliers.critChanceBonus += buff.effects.critChanceBonus
          }
        })
        
        return multipliers
      },

      isEventOnCooldown: (eventId: string) => {
        const { eventCooldowns } = get()
        const cooldownExpiry = eventCooldowns[eventId]
        if (!cooldownExpiry) return false
        
        return Date.now() < cooldownExpiry
      },

      canEventSpawn: (event: GameEvent) => {
        // Check cooldown
        if (get().isEventOnCooldown(event.id)) return false
        
        // Check requirements
        const reqs = event.spawnRequirements
        if (!reqs) return true
        
        const charStore = (window as any).charStore?.getState?.()
        const zoneStore = (window as any).zoneProgressionStore?.getState?.()
        
        if (reqs.minLevel && (!charStore || charStore.level < reqs.minLevel)) {
          return false
        }
        
        if (reqs.minZone && (!zoneStore || zoneStore.currentZone < reqs.minZone)) {
          return false
        }
        
        // Check active only requirement
        // TODO: Implement activity tracking
        if (reqs.activeOnly) {
          // For now, always consider active
        }
        
        return true
      },

      tick: () => {
        const now = Date.now()
        const { activeEvent, activeBuffs } = get()
        
        // Check for expired event
        if (activeEvent && now > activeEvent.expiryTime && !activeEvent.interacted) {
          console.log('Event expired without interaction')
          get().dismissEvent()
        }
        
        // Remove expired buffs
        Object.entries(activeBuffs).forEach(([buffId, buff]) => {
          if (now > buff.expiryTime) {
            get().removeBuff(buffId)
          }
        })
        
        // Check for new event spawns (less frequently)
        if (Math.random() < 0.1) { // 10% chance per tick to check
          get().checkForEventSpawns()
        }
      },

      reset: () => {
        set({
          activeEvent: null,
          activeBuffs: {},
          eventHistory: [],
          lastSpawnChecks: {},
          eventCooldowns: {},
          totalEventsTriggered: 0,
          totalEventInteractions: 0,
        })
      },
    }),
    {
      name: 'clicker-town-events',
      version: 1,
      partialize: (state) => ({
        // Don't persist active state, only history and cooldowns
        eventHistory: state.eventHistory,
        eventCooldowns: state.eventCooldowns,
        totalEventsTriggered: state.totalEventsTriggered,
        totalEventInteractions: state.totalEventInteractions,
      })
    }
  )
)

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).eventStore = useEventStore
}
