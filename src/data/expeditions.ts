export type ExpeditionType = 'exploration' | 'gathering' | 'combat' | 'diplomatic' | 'treasure_hunt'
export type ExpeditionDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'legendary'
export type ExpeditionStatus = 'available' | 'in_progress' | 'completed' | 'failed'

export interface ExpeditionReward {
  type: 'gold' | 'xp' | 'materials' | 'relic' | 'equipment' | 'npc_xp'
  amount?: number
  itemId?: string
  materialIds?: Record<string, number>
  npcXpAmount?: number // XP for the NPC that completed it
}

export interface ExpeditionRequirements {
  minPlayerLevel?: number
  minZone?: number
  npcLevel?: number // Min level for assigned NPC
  npcTraits?: string[] // Preferred NPC traits
  completedExpeditions?: string[] // Prerequisites
  buildings?: Array<{ id: string; level: number }> // Required building levels
  materials?: Record<string, number> // Required materials to unlock
}

export interface ExpeditionEvent {
  id: string
  description: string
  chance: number // Chance this event occurs (0-1)
  effects: {
    durationMultiplier?: number // Modify expedition duration
    rewardMultiplier?: number // Modify rewards
    successChanceModifier?: number // Modify success chance
    additionalRewards?: ExpeditionReward[]
  }
}

export interface Expedition {
  id: string
  name: string
  description: string
  lore?: string
  type: ExpeditionType
  difficulty: ExpeditionDifficulty
  icon: string
  
  // Duration and success
  baseDuration: number // In seconds
  baseSuccessChance: number // Base success rate (0-1)
  
  // Requirements
  requirements?: ExpeditionRequirements
  
  // Costs
  cost: {
    gold?: number
    materials?: Record<string, number>
  }
  
  // Rewards
  successRewards: ExpeditionReward[]
  failureRewards?: ExpeditionReward[] // Partial rewards on failure
  
  // Special mechanics
  events?: ExpeditionEvent[] // Random events during expedition
  repeatable: boolean // Can be done multiple times
  
  // Modifiers based on NPC
  npcSynergy?: {
    traitBonuses: Record<string, {
      durationReduction?: number // Percentage reduction (0.2 = 20% faster)
      successBonus?: number // Additive success chance (0.1 = +10%)
      rewardBonus?: number // Multiplicative reward bonus (1.2 = 20% more)
    }>
  }
}

// Difficulty information
export const expeditionDifficultyInfo = {
  easy: {
    color: '#10b981',
    successChance: 0.9,
    durationMultiplier: 1,
    rewardMultiplier: 1,
  },
  medium: {
    color: '#3b82f6',
    successChance: 0.75,
    durationMultiplier: 1.5,
    rewardMultiplier: 1.5,
  },
  hard: {
    color: '#a855f7',
    successChance: 0.6,
    durationMultiplier: 2,
    rewardMultiplier: 2.5,
  },
  expert: {
    color: '#eab308',
    successChance: 0.4,
    durationMultiplier: 3,
    rewardMultiplier: 4,
  },
  legendary: {
    color: '#ef4444',
    successChance: 0.25,
    durationMultiplier: 4,
    rewardMultiplier: 6,
  }
}

// Expedition database - easily expandable
export const expeditions: Expedition[] = [
  // Exploration expeditions
  {
    id: 'scout_forest',
    name: 'Scout the Dark Forest',
    description: 'Send an NPC to scout the mysterious dark forest',
    lore: 'Strange sounds have been heard from the forest. Someone should investigate.',
    type: 'exploration',
    difficulty: 'easy',
    icon: '🌲',
    baseDuration: 300, // 5 minutes
    baseSuccessChance: 0.85,
    cost: {
      gold: 50,
    },
    successRewards: [
      {
        type: 'xp',
        amount: 100,
      },
      {
        type: 'gold',
        amount: 150,
      },
      {
        type: 'materials',
        materialIds: {
          'wood': 10,
          'herbs': 5,
        }
      },
      {
        type: 'npc_xp',
        npcXpAmount: 50,
      }
    ],
    failureRewards: [
      {
        type: 'materials',
        materialIds: {
          'wood': 3,
        }
      }
    ],
    repeatable: true,
    npcSynergy: {
      traitBonuses: {
        'scout': {
          durationReduction: 0.25,
          successBonus: 0.1,
        },
        'survivalist': {
          successBonus: 0.15,
        }
      }
    }
  },

  {
    id: 'cave_expedition',
    name: 'Explore Ancient Caves',
    description: 'Delve into long-forgotten caves in search of treasure',
    lore: 'Ancient ruins lie deep within these caves, along with untold riches.',
    type: 'exploration',
    difficulty: 'medium',
    icon: '⛏️',
    baseDuration: 600, // 10 minutes
    baseSuccessChance: 0.7,
    requirements: {
      minPlayerLevel: 10,
      minZone: 3,
    },
    cost: {
      gold: 200,
      materials: {
        'torch': 3,
      }
    },
    successRewards: [
      {
        type: 'gold',
        amount: 500,
      },
      {
        type: 'materials',
        materialIds: {
          'iron_ore': 15,
          'gems': 5,
          'ancient_relic_fragment': 2,
        }
      },
      {
        type: 'npc_xp',
        npcXpAmount: 150,
      }
    ],
    repeatable: true,
    events: [
      {
        id: 'cave_treasure',
        description: 'Your NPC discovered a hidden treasure room!',
        chance: 0.15,
        effects: {
          additionalRewards: [
            {
              type: 'gold',
              amount: 300,
            }
          ]
        }
      },
      {
        id: 'cave_collapse',
        description: 'A cave-in slowed progress!',
        chance: 0.1,
        effects: {
          durationMultiplier: 1.3,
        }
      }
    ],
    npcSynergy: {
      traitBonuses: {
        'brave': {
          successBonus: 0.1,
        },
        'treasure_hunter': {
          rewardBonus: 1.3,
        }
      }
    }
  },

  // Gathering expeditions
  {
    id: 'herb_gathering',
    name: 'Rare Herb Gathering',
    description: 'Collect rare medicinal herbs from dangerous regions',
    type: 'gathering',
    difficulty: 'easy',
    icon: '🌿',
    baseDuration: 240, // 4 minutes
    baseSuccessChance: 0.9,
    cost: {
      gold: 30,
    },
    successRewards: [
      {
        type: 'materials',
        materialIds: {
          'rare_herbs': 8,
          'medicinal_root': 4,
        }
      },
      {
        type: 'npc_xp',
        npcXpAmount: 40,
      }
    ],
    repeatable: true,
    npcSynergy: {
      traitBonuses: {
        'herbalist': {
          durationReduction: 0.3,
          rewardBonus: 1.5,
        },
        'nature_affinity': {
          successBonus: 0.15,
        }
      }
    }
  },

  {
    id: 'mining_expedition',
    name: 'Deep Mine Expedition',
    description: 'Mine precious ores from the deepest veins',
    type: 'gathering',
    difficulty: 'medium',
    icon: '⚒️',
    baseDuration: 900, // 15 minutes
    baseSuccessChance: 0.75,
    requirements: {
      minPlayerLevel: 15,
      buildings: [
        { id: 'mine', level: 3 }
      ]
    },
    cost: {
      gold: 150,
      materials: {
        'pickaxe': 1,
      }
    },
    successRewards: [
      {
        type: 'materials',
        materialIds: {
          'iron_ore': 30,
          'gold_ore': 10,
          'rare_gems': 3,
        }
      },
      {
        type: 'npc_xp',
        npcXpAmount: 200,
      }
    ],
    repeatable: true,
    npcSynergy: {
      traitBonuses: {
        'miner': {
          durationReduction: 0.25,
          rewardBonus: 1.4,
        },
        'strong': {
          durationReduction: 0.15,
        }
      }
    }
  },

  // Combat expeditions
  {
    id: 'bandit_camp',
    name: 'Clear Bandit Camp',
    description: 'Eliminate bandits terrorizing the trade routes',
    type: 'combat',
    difficulty: 'medium',
    icon: '⚔️',
    baseDuration: 480, // 8 minutes
    baseSuccessChance: 0.65,
    requirements: {
      minPlayerLevel: 12,
      npcLevel: 3,
    },
    cost: {
      gold: 100,
    },
    successRewards: [
      {
        type: 'gold',
        amount: 400,
      },
      {
        type: 'xp',
        amount: 200,
      },
      {
        type: 'materials',
        materialIds: {
          'weapon_parts': 5,
          'leather': 10,
        }
      },
      {
        type: 'npc_xp',
        npcXpAmount: 180,
      }
    ],
    failureRewards: [
      {
        type: 'gold',
        amount: 50,
      }
    ],
    repeatable: true,
    events: [
      {
        id: 'bandit_leader',
        description: 'The bandit leader appeared with reinforcements!',
        chance: 0.2,
        effects: {
          successChanceModifier: -0.15,
          additionalRewards: [
            {
              type: 'gold',
              amount: 300,
            },
            {
              type: 'equipment',
              itemId: 'bandit_blade',
            }
          ]
        }
      }
    ],
    npcSynergy: {
      traitBonuses: {
        'warrior': {
          successBonus: 0.2,
          durationReduction: 0.1,
        },
        'tactician': {
          successBonus: 0.15,
        }
      }
    }
  },

  {
    id: 'monster_hunt',
    name: 'Legendary Beast Hunt',
    description: 'Track and hunt a legendary beast',
    type: 'combat',
    difficulty: 'hard',
    icon: '🐉',
    baseDuration: 1200, // 20 minutes
    baseSuccessChance: 0.5,
    requirements: {
      minPlayerLevel: 25,
      minZone: 6,
      npcLevel: 5,
    },
    cost: {
      gold: 500,
      materials: {
        'bait': 3,
        'trap': 2,
      }
    },
    successRewards: [
      {
        type: 'gold',
        amount: 2000,
      },
      {
        type: 'xp',
        amount: 800,
      },
      {
        type: 'materials',
        materialIds: {
          'beast_hide': 5,
          'beast_fang': 3,
          'monster_essence': 10,
        }
      },
      {
        type: 'relic',
        itemId: 'hunters_trophy',
      },
      {
        type: 'npc_xp',
        npcXpAmount: 400,
      }
    ],
    failureRewards: [
      {
        type: 'materials',
        materialIds: {
          'beast_tracks': 2,
        }
      }
    ],
    repeatable: true,
    npcSynergy: {
      traitBonuses: {
        'hunter': {
          successBonus: 0.25,
          durationReduction: 0.2,
        },
        'brave': {
          successBonus: 0.15,
        },
        'tracker': {
          durationReduction: 0.25,
        }
      }
    }
  },

  // Diplomatic expeditions
  {
    id: 'trade_negotiation',
    name: 'Trade Negotiations',
    description: 'Negotiate favorable trade deals with neighboring towns',
    type: 'diplomatic',
    difficulty: 'medium',
    icon: '🤝',
    baseDuration: 720, // 12 minutes
    baseSuccessChance: 0.7,
    requirements: {
      minPlayerLevel: 18,
      buildings: [
        { id: 'marketplace', level: 2 }
      ]
    },
    cost: {
      gold: 300,
    },
    successRewards: [
      {
        type: 'gold',
        amount: 800,
      },
      {
        type: 'materials',
        materialIds: {
          'trade_goods': 20,
          'exotic_spices': 5,
        }
      },
      {
        type: 'npc_xp',
        npcXpAmount: 250,
      }
    ],
    repeatable: true,
    npcSynergy: {
      traitBonuses: {
        'charismatic': {
          successBonus: 0.2,
          rewardBonus: 1.3,
        },
        'merchant': {
          rewardBonus: 1.5,
        },
        'diplomat': {
          successBonus: 0.25,
        }
      }
    }
  },

  // Treasure hunt expeditions
  {
    id: 'lost_treasure',
    name: 'Search for Lost Treasure',
    description: 'Follow an ancient map to buried treasure',
    type: 'treasure_hunt',
    difficulty: 'hard',
    icon: '💎',
    baseDuration: 1800, // 30 minutes
    baseSuccessChance: 0.45,
    requirements: {
      minPlayerLevel: 30,
      minZone: 7,
      materials: {
        'ancient_map': 1,
      }
    },
    cost: {
      gold: 1000,
      materials: {
        'ancient_map': 1,
        'shovel': 1,
      }
    },
    successRewards: [
      {
        type: 'gold',
        amount: 5000,
      },
      {
        type: 'materials',
        materialIds: {
          'rare_gems': 15,
          'ancient_coins': 20,
          'treasure_chest': 1,
        }
      },
      {
        type: 'relic',
        itemId: 'pirates_compass',
      },
      {
        type: 'npc_xp',
        npcXpAmount: 500,
      }
    ],
    failureRewards: [
      {
        type: 'gold',
        amount: 500,
      },
      {
        type: 'materials',
        materialIds: {
          'old_coins': 5,
        }
      }
    ],
    repeatable: false,
    events: [
      {
        id: 'treasure_guardian',
        description: 'An ancient guardian protects the treasure!',
        chance: 0.3,
        effects: {
          successChanceModifier: -0.2,
          additionalRewards: [
            {
              type: 'relic',
              itemId: 'guardians_key',
            }
          ]
        }
      },
      {
        id: 'treasure_double',
        description: 'The treasure is even larger than expected!',
        chance: 0.1,
        effects: {
          rewardMultiplier: 2,
        }
      }
    ],
    npcSynergy: {
      traitBonuses: {
        'treasure_hunter': {
          successBonus: 0.3,
          rewardBonus: 1.5,
        },
        'lucky': {
          successBonus: 0.2,
        },
        'archaeologist': {
          successBonus: 0.15,
          durationReduction: 0.2,
        }
      }
    }
  },

  // Legendary expeditions
  {
    id: 'dragons_lair',
    name: "Dragon's Lair Expedition",
    description: 'Enter the lair of an ancient dragon',
    type: 'combat',
    difficulty: 'legendary',
    icon: '🐲',
    baseDuration: 3600, // 60 minutes
    baseSuccessChance: 0.2,
    requirements: {
      minPlayerLevel: 50,
      minZone: 10,
      npcLevel: 10,
      completedExpeditions: ['monster_hunt'],
    },
    cost: {
      gold: 5000,
      materials: {
        'dragon_bait': 1,
        'fireproof_potion': 3,
      }
    },
    successRewards: [
      {
        type: 'gold',
        amount: 20000,
      },
      {
        type: 'xp',
        amount: 5000,
      },
      {
        type: 'materials',
        materialIds: {
          'dragon_scale': 10,
          'dragon_fang': 5,
          'dragon_heart': 1,
        }
      },
      {
        type: 'relic',
        itemId: 'dragons_hoard',
      },
      {
        type: 'npc_xp',
        npcXpAmount: 1000,
      }
    ],
    failureRewards: [
      {
        type: 'materials',
        materialIds: {
          'dragon_scale': 2,
        }
      }
    ],
    repeatable: true,
    npcSynergy: {
      traitBonuses: {
        'dragonslayer': {
          successBonus: 0.4,
        },
        'brave': {
          successBonus: 0.2,
        },
        'legendary_hero': {
          successBonus: 0.3,
          rewardBonus: 1.5,
        }
      }
    }
  },
]

// Helper functions
export function getExpeditionById(id: string): Expedition | undefined {
  return expeditions.find(e => e.id === id)
}

export function getExpeditionsByType(type: ExpeditionType): Expedition[] {
  return expeditions.filter(e => e.type === type)
}

export function getExpeditionsByDifficulty(difficulty: ExpeditionDifficulty): Expedition[] {
  return expeditions.filter(e => e.difficulty === difficulty)
}

// Calculate final duration with NPC bonuses
export function calculateExpeditionDuration(
  expedition: Expedition,
  npcTraits: string[]
): number {
  let duration = expedition.baseDuration
  
  if (expedition.npcSynergy) {
    npcTraits.forEach(trait => {
      const bonus = expedition.npcSynergy?.traitBonuses[trait]
      if (bonus?.durationReduction) {
        duration *= (1 - bonus.durationReduction)
      }
    })
  }
  
  return Math.floor(duration)
}

// Calculate success chance with NPC bonuses
export function calculateExpeditionSuccessChance(
  expedition: Expedition,
  npcTraits: string[],
  npcLevel: number
): number {
  let successChance = expedition.baseSuccessChance
  
  // Add NPC level bonus (1% per level)
  successChance += npcLevel * 0.01
  
  // Add trait bonuses
  if (expedition.npcSynergy) {
    npcTraits.forEach(trait => {
      const bonus = expedition.npcSynergy?.traitBonuses[trait]
      if (bonus?.successBonus) {
        successChance += bonus.successBonus
      }
    })
  }
  
  return Math.min(0.95, Math.max(0.05, successChance)) // Clamp between 5% and 95%
}
