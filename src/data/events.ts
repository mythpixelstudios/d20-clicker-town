export type EventType = 'golden_meteor' | 'wandering_merchant' | 'monster_horde' | 'blessing' | 'seasonal'
export type EventRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface EventReward {
  type: 'gold' | 'xp' | 'materials' | 'relic' | 'buff' | 'equipment'
  amount?: number // For gold, XP, materials
  itemId?: string // For relic, equipment rewards
  materialIds?: Record<string, number> // For multiple materials
  buffId?: string // For buff rewards
  duration?: number // For temporary buffs (in seconds)
}

export interface EventBuff {
  id: string
  name: string
  description: string
  icon: string
  duration: number // In seconds
  effects: {
    damageMultiplier?: number
    goldMultiplier?: number
    xpMultiplier?: number
    materialDropChance?: number
    critChanceBonus?: number
    autoSpeedMultiplier?: number
  }
}

export interface GameEvent {
  id: string
  name: string
  description: string
  type: EventType
  rarity: EventRarity
  icon: string
  
  // Visual
  animationEffect?: string // CSS animation class or identifier
  soundEffect?: string
  
  // Spawn settings
  spawnChance: number // Base chance per check (0-1)
  spawnInterval: number // How often to check for spawn (in seconds)
  duration: number // How long the event lasts (in seconds)
  
  // Requirements to spawn
  spawnRequirements?: {
    minLevel?: number
    minZone?: number
    timeOfDay?: 'day' | 'night' | 'any'
    activeOnly?: boolean // Only spawn when player is active
  }
  
  // Interaction
  interactionType: 'click' | 'automatic' | 'choice'
  clicksRequired?: number // For click interactions
  choices?: Array<{
    id: string
    text: string
    rewards: EventReward[]
    chance?: number // Success chance (0-1), defaults to 1
  }>
  
  // Rewards
  baseRewards: EventReward[]
  bonusRewards?: EventReward[] // Additional rewards with lower chance
  bonusChance?: number // Chance for bonus rewards (0-1)
  
  // Cooldown
  cooldown?: number // Cooldown in seconds before this event can spawn again
}

// Event buffs that can be granted
export const eventBuffs: EventBuff[] = [
  {
    id: 'meteor_blessing',
    name: 'Meteor Blessing',
    description: 'The golden meteor fills you with power',
    icon: '✨',
    duration: 300, // 5 minutes
    effects: {
      damageMultiplier: 1.25,
      goldMultiplier: 1.5,
    }
  },
  {
    id: 'merchants_favor',
    name: "Merchant's Favor",
    description: 'The wandering merchant smiles upon you',
    icon: '🤝',
    duration: 600, // 10 minutes
    effects: {
      goldMultiplier: 1.3,
      materialDropChance: 0.15,
    }
  },
  {
    id: 'battle_frenzy',
    name: 'Battle Frenzy',
    description: 'The thrill of battle empowers you',
    icon: '⚔️',
    duration: 180, // 3 minutes
    effects: {
      damageMultiplier: 1.5,
      autoSpeedMultiplier: 1.3,
      critChanceBonus: 0.1,
    }
  },
  {
    id: 'divine_blessing',
    name: 'Divine Blessing',
    description: 'The gods smile upon your efforts',
    icon: '🙏',
    duration: 900, // 15 minutes
    effects: {
      xpMultiplier: 1.5,
      goldMultiplier: 1.25,
    }
  }
]

// Event definitions - easily expandable
export const gameEvents: GameEvent[] = [
  // Golden Meteor - Primary Tier 4 event
  {
    id: 'golden_meteor',
    name: 'Golden Meteor',
    description: 'A brilliant golden meteor streaks across the sky! Click it before it disappears!',
    type: 'golden_meteor',
    rarity: 'rare',
    icon: '☄️',
    animationEffect: 'meteor-fall',
    soundEffect: 'meteor_whoosh',
    
    spawnChance: 0.05, // 5% chance per check
    spawnInterval: 60, // Check every minute
    duration: 15, // 15 seconds to click
    
    spawnRequirements: {
      minLevel: 5,
      minZone: 2,
      activeOnly: true, // Only spawn when player is active
    },
    
    interactionType: 'click',
    clicksRequired: 1,
    
    baseRewards: [
      {
        type: 'gold',
        amount: 500, // Scales with level
      },
      {
        type: 'xp',
        amount: 250,
      },
      {
        type: 'buff',
        buffId: 'meteor_blessing',
        duration: 300,
      }
    ],
    bonusRewards: [
      {
        type: 'materials',
        materialIds: {
          'star_fragment': 1,
          'gold_ore': 3,
        }
      }
    ],
    bonusChance: 0.25, // 25% chance for bonus materials
    
    cooldown: 300, // 5 minute cooldown
  },

  // Wandering Merchant
  {
    id: 'wandering_merchant',
    name: 'Wandering Merchant',
    description: 'A mysterious merchant appears with rare goods!',
    type: 'wandering_merchant',
    rarity: 'uncommon',
    icon: '🧙‍♂️',
    
    spawnChance: 0.08, // 8% chance per check
    spawnInterval: 120, // Check every 2 minutes
    duration: 45, // 45 seconds to interact
    
    spawnRequirements: {
      minLevel: 10,
      minZone: 3,
    },
    
    interactionType: 'choice',
    choices: [
      {
        id: 'buy_gold',
        text: 'Exchange materials for gold',
        rewards: [
          {
            type: 'gold',
            amount: 1000,
          }
        ],
      },
      {
        id: 'buy_buff',
        text: 'Purchase a blessing',
        rewards: [
          {
            type: 'buff',
            buffId: 'merchants_favor',
            duration: 600,
          }
        ],
      },
      {
        id: 'gamble',
        text: 'Try your luck (50% chance)',
        rewards: [
          {
            type: 'gold',
            amount: 2000,
          },
          {
            type: 'materials',
            materialIds: {
              'rare_gem': 1,
            }
          }
        ],
        chance: 0.5,
      }
    ],
    
    baseRewards: [], // Rewards depend on choice
    cooldown: 600, // 10 minute cooldown
  },

  // Monster Horde
  {
    id: 'monster_horde',
    name: 'Monster Horde',
    description: 'A massive horde of monsters approaches! Defeat them for bonus rewards!',
    type: 'monster_horde',
    rarity: 'uncommon',
    icon: '👹',
    animationEffect: 'horde-shake',
    
    spawnChance: 0.06, // 6% chance per check
    spawnInterval: 90, // Check every 90 seconds
    duration: 60, // 60 seconds active
    
    spawnRequirements: {
      minLevel: 15,
      minZone: 4,
      activeOnly: true,
    },
    
    interactionType: 'automatic', // Rewards granted based on kills during event
    
    baseRewards: [
      {
        type: 'gold',
        amount: 750,
      },
      {
        type: 'xp',
        amount: 500,
      },
      {
        type: 'buff',
        buffId: 'battle_frenzy',
        duration: 180,
      }
    ],
    bonusRewards: [
      {
        type: 'materials',
        materialIds: {
          'monster_essence': 5,
        }
      }
    ],
    bonusChance: 0.4, // 40% chance for bonus materials
    
    cooldown: 450, // 7.5 minute cooldown
  },

  // Divine Blessing
  {
    id: 'divine_blessing',
    name: 'Divine Blessing',
    description: 'The heavens shine down upon you with divine favor!',
    type: 'blessing',
    rarity: 'rare',
    icon: '✝️',
    animationEffect: 'holy-light',
    
    spawnChance: 0.03, // 3% chance per check
    spawnInterval: 180, // Check every 3 minutes
    duration: 1, // Instant
    
    spawnRequirements: {
      minLevel: 20,
      minZone: 5,
    },
    
    interactionType: 'automatic',
    
    baseRewards: [
      {
        type: 'buff',
        buffId: 'divine_blessing',
        duration: 900,
      },
      {
        type: 'xp',
        amount: 1000,
      }
    ],
    bonusRewards: [
      {
        type: 'gold',
        amount: 1500,
      }
    ],
    bonusChance: 0.3,
    
    cooldown: 900, // 15 minute cooldown
  },

  // Legendary events (very rare)
  {
    id: 'ancient_portal',
    name: 'Ancient Portal',
    description: 'A mysterious portal tears through reality! What lies beyond?',
    type: 'seasonal',
    rarity: 'legendary',
    icon: '🌀',
    animationEffect: 'portal-swirl',
    
    spawnChance: 0.01, // 1% chance per check
    spawnInterval: 300, // Check every 5 minutes
    duration: 30, // 30 seconds to decide
    
    spawnRequirements: {
      minLevel: 30,
      minZone: 7,
      activeOnly: true,
    },
    
    interactionType: 'choice',
    choices: [
      {
        id: 'enter_portal',
        text: 'Enter the portal (risky)',
        rewards: [
          {
            type: 'relic',
            itemId: 'random_relic',
          },
          {
            type: 'gold',
            amount: 5000,
          }
        ],
        chance: 0.7, // 70% success rate
      },
      {
        id: 'study_portal',
        text: 'Study the portal safely',
        rewards: [
          {
            type: 'xp',
            amount: 2000,
          },
          {
            type: 'materials',
            materialIds: {
              'void_essence': 2,
            }
          }
        ],
      }
    ],
    
    baseRewards: [],
    cooldown: 1800, // 30 minute cooldown
  },
]

// Helper function to get an event by ID
export function getEventById(id: string): GameEvent | undefined {
  return gameEvents.find(e => e.id === id)
}

// Helper function to get events by type
export function getEventsByType(type: EventType): GameEvent[] {
  return gameEvents.filter(e => e.type === type)
}

// Helper function to get a buff by ID
export function getBuffById(id: string): EventBuff | undefined {
  return eventBuffs.find(b => b.id === id)
}

// Helper to calculate scaled rewards based on player level
export function getScaledEventReward(baseAmount: number, playerLevel: number): number {
  // Scale rewards by player level with diminishing returns
  return Math.floor(baseAmount * (1 + playerLevel * 0.1))
}
