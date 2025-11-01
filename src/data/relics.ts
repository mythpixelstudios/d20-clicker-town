export type RelicRarity = 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type RelicCategory = 'combat' | 'economy' | 'progression' | 'exploration' | 'crafting'

export interface RelicEffect {
  id: string
  description: string
  // Global modifiers that apply when relic is equipped
  stats?: {
    // Combat stats
    damageMultiplier?: number // Multiplicative damage bonus (1.1 = 10% more damage)
    critChanceBonus?: number // Additive crit chance (0.05 = +5%)
    critDamageMultiplier?: number // Multiplicative crit damage (1.5 = 50% more crit damage)
    autoSpeedMultiplier?: number // Multiplicative auto attack speed (1.2 = 20% faster)
    
    // Economy
    goldMultiplier?: number // Multiplicative gold gain (1.15 = 15% more gold)
    materialDropChance?: number // Additive material drop chance (0.1 = +10%)
    
    // Progression
    xpMultiplier?: number // Multiplicative XP gain (1.2 = 20% more XP)
    prestigeTokenMultiplier?: number // Multiplicative prestige tokens (1.1 = 10% more tokens)
    
    // Crafting
    craftingSpeedMultiplier?: number // Multiplicative crafting speed (1.3 = 30% faster)
    craftingQualityChance?: number // Chance to improve rarity when crafting (0.05 = 5%)
    
    // Special
    offlineProgressMultiplier?: number // Multiplicative offline gains (1.25 = 25% more offline progress)
    dailyQuestRewardMultiplier?: number // Multiplicative daily quest rewards
    expeditionSpeedMultiplier?: number // Multiplicative expedition speed
  }
  
  // Special conditional effects
  conditionalEffects?: Array<{
    condition: string // Description of condition
    effect: string // Description of effect
    value?: number // Numeric value if applicable
  }>
}

export interface Relic {
  id: string
  name: string
  description: string
  lore?: string // Flavor text about the relic's origin
  rarity: RelicRarity
  category: RelicCategory
  icon: string // Emoji or icon identifier
  effects: RelicEffect[]
  
  // Discovery requirements
  discoveryRequirements?: {
    level?: number
    zone?: number
    bossDefeats?: Record<string, number> // Boss ID -> number of defeats
    achievementIds?: string[]
    prestigeLevel?: number
  }
  
  // Some relics may have level scaling
  maxLevel?: number
  levelScaling?: {
    statsPerLevel: Partial<RelicEffect['stats']>
  }
}

// Rarity information for relics (colorblind-friendly)
export const relicRarityInfo = {
  uncommon: { 
    color: '#10b981', 
    pattern: 'diagonal-lines',
    glowIntensity: 0.3,
    maxSlots: 2 // Can equip up to 2 uncommon relics
  },
  rare: { 
    color: '#3b82f6', 
    pattern: 'dots',
    glowIntensity: 0.5,
    maxSlots: 2
  },
  epic: { 
    color: '#a855f7', 
    pattern: 'cross-hatch',
    glowIntensity: 0.7,
    maxSlots: 1
  },
  legendary: { 
    color: '#eab308', 
    pattern: 'sparkles',
    glowIntensity: 0.9,
    maxSlots: 1
  },
  mythic: { 
    color: '#f97316', 
    pattern: 'animated-stars',
    glowIntensity: 1,
    maxSlots: 1
  }
}

// Relic database - easily expandable
export const relics: Relic[] = [
  // Combat Relics
  {
    id: 'warriors_spirit',
    name: "Warrior's Spirit",
    description: "An ancient medallion that pulses with battle fervor",
    lore: "Forged in the fires of a thousand battles, this medallion has absorbed the determination of fallen warriors.",
    rarity: 'rare',
    category: 'combat',
    icon: '⚔️',
    effects: [
      {
        id: 'damage_boost',
        description: 'Increases all damage by 15%',
        stats: {
          damageMultiplier: 1.15
        }
      }
    ],
    discoveryRequirements: {
      level: 10,
      zone: 3
    }
  },
  {
    id: 'critical_edge',
    name: 'Critical Edge',
    description: 'A razor-sharp crystal that seeks vital points',
    lore: "This crystalline fragment was found embedded in a dragon's heart, forever seeking weakness.",
    rarity: 'epic',
    category: 'combat',
    icon: '💎',
    effects: [
      {
        id: 'crit_bonus',
        description: 'Increases critical strike chance by 8% and critical damage by 30%',
        stats: {
          critChanceBonus: 0.08,
          critDamageMultiplier: 1.3
        }
      }
    ],
    discoveryRequirements: {
      level: 20,
      bossDefeats: {
        'dragon_boss': 1
      }
    }
  },
  {
    id: 'berserkers_rage',
    name: "Berserker's Rage",
    description: 'A blood-red gem that amplifies aggression',
    lore: "Warriors who wield this relic fight with unmatched fury, attacking faster than thought itself.",
    rarity: 'legendary',
    category: 'combat',
    icon: '🔴',
    effects: [
      {
        id: 'attack_speed',
        description: 'Increases auto attack speed by 40%',
        stats: {
          autoSpeedMultiplier: 1.4
        }
      }
    ],
    discoveryRequirements: {
      level: 35,
      zone: 7,
      achievementIds: ['speed_demon']
    }
  },

  // Economy Relics
  {
    id: 'merchants_charm',
    name: "Merchant's Charm",
    description: 'A golden coin that always returns with friends',
    lore: "Legend says this coin was the first ever minted, blessed by the god of commerce.",
    rarity: 'uncommon',
    category: 'economy',
    icon: '🪙',
    effects: [
      {
        id: 'gold_boost',
        description: 'Increases gold gained by 20%',
        stats: {
          goldMultiplier: 1.2
        }
      }
    ],
    discoveryRequirements: {
      level: 5
    }
  },
  {
    id: 'treasure_hunters_compass',
    name: "Treasure Hunter's Compass",
    description: 'Always points toward hidden riches',
    lore: "Crafted by a legendary explorer who never returned empty-handed from any expedition.",
    rarity: 'rare',
    category: 'economy',
    icon: '🧭',
    effects: [
      {
        id: 'gold_and_materials',
        description: 'Increases gold by 25% and material drop chance by 10%',
        stats: {
          goldMultiplier: 1.25,
          materialDropChance: 0.10
        }
      }
    ],
    discoveryRequirements: {
      level: 15,
      zone: 4
    }
  },
  {
    id: 'dragons_hoard',
    name: "Dragon's Hoard",
    description: 'A scale from the wealthiest dragon',
    lore: "Dragons are drawn to wealth like moths to flame. This scale carries that insatiable greed.",
    rarity: 'legendary',
    category: 'economy',
    icon: '🐉',
    effects: [
      {
        id: 'massive_gold',
        description: 'Increases gold gained by 50%',
        stats: {
          goldMultiplier: 1.5
        }
      }
    ],
    discoveryRequirements: {
      level: 40,
      bossDefeats: {
        'dragon_boss': 5
      }
    }
  },

  // Progression Relics
  {
    id: 'scholars_tome',
    name: "Scholar's Tome",
    description: 'An ancient book that teaches as you fight',
    lore: "Every battle writes itself into this tome, creating an ever-growing compendium of knowledge.",
    rarity: 'uncommon',
    category: 'progression',
    icon: '📖',
    effects: [
      {
        id: 'xp_boost',
        description: 'Increases XP gained by 25%',
        stats: {
          xpMultiplier: 1.25
        }
      }
    ],
    discoveryRequirements: {
      level: 8
    }
  },
  {
    id: 'time_keepers_hourglass',
    name: "Time Keeper's Hourglass",
    description: 'Sand flows upward, defying nature',
    lore: "Time works differently for those who carry this artifact - even absence brings progress.",
    rarity: 'epic',
    category: 'progression',
    icon: '⏳',
    effects: [
      {
        id: 'offline_boost',
        description: 'Increases offline progress by 50%',
        stats: {
          offlineProgressMultiplier: 1.5
        }
      }
    ],
    discoveryRequirements: {
      level: 25,
      zone: 6
    }
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    description: 'Burns with rebirth energy',
    lore: "Like the phoenix, this feather represents the power of renewal and transformation.",
    rarity: 'legendary',
    category: 'progression',
    icon: '🔥',
    effects: [
      {
        id: 'prestige_boost',
        description: 'Increases prestige tokens earned by 25%',
        stats: {
          prestigeTokenMultiplier: 1.25
        }
      }
    ],
    discoveryRequirements: {
      prestigeLevel: 1,
      level: 50
    }
  },

  // Crafting Relics
  {
    id: 'smiths_hammer',
    name: "Smith's Hammer",
    description: 'Strikes true, every time',
    lore: "The first hammer ever used, now imbued with the skill of ten thousand master smiths.",
    rarity: 'rare',
    category: 'crafting',
    icon: '🔨',
    effects: [
      {
        id: 'crafting_speed',
        description: 'Increases crafting speed by 30%',
        stats: {
          craftingSpeedMultiplier: 1.3
        }
      }
    ],
    discoveryRequirements: {
      level: 12,
      zone: 3
    }
  },
  {
    id: 'quality_gem',
    name: 'Gem of Quality',
    description: 'Improves everything it touches',
    lore: "Miners speak in hushed tones of a gem that turns common ore into legendary metal.",
    rarity: 'epic',
    category: 'crafting',
    icon: '💠',
    effects: [
      {
        id: 'quality_chance',
        description: '10% chance to improve item rarity when crafting',
        stats: {
          craftingQualityChance: 0.10
        }
      }
    ],
    discoveryRequirements: {
      level: 30,
      achievementIds: ['master_crafter']
    }
  },

  // Exploration Relics
  {
    id: 'explorers_map',
    name: "Explorer's Map",
    description: 'Shows paths not yet traveled',
    lore: "This map updates itself, revealing new destinations to brave adventurers.",
    rarity: 'uncommon',
    category: 'exploration',
    icon: '🗺️',
    effects: [
      {
        id: 'expedition_speed',
        description: 'Increases expedition completion speed by 20%',
        stats: {
          expeditionSpeedMultiplier: 1.2
        }
      }
    ],
    discoveryRequirements: {
      level: 10
    }
  },
  {
    id: 'lucky_clover',
    name: 'Four-Leaf Clover',
    description: 'Fortune favors the bold',
    lore: "Found in a field where heroes trained, this clover carries their accumulated luck.",
    rarity: 'rare',
    category: 'exploration',
    icon: '🍀',
    effects: [
      {
        id: 'daily_quest_boost',
        description: 'Increases daily quest rewards by 40%',
        stats: {
          dailyQuestRewardMultiplier: 1.4
        }
      }
    ],
    discoveryRequirements: {
      level: 18,
      zone: 5
    }
  },

  // Mythic Relics (Extremely Rare)
  {
    id: 'crown_of_eternity',
    name: 'Crown of Eternity',
    description: 'Time bends to your will',
    lore: "Worn by the first monarch, this crown grants mastery over progression itself.",
    rarity: 'mythic',
    category: 'progression',
    icon: '👑',
    effects: [
      {
        id: 'ultimate_progression',
        description: 'Increases XP by 40%, prestige tokens by 30%, and offline progress by 50%',
        stats: {
          xpMultiplier: 1.4,
          prestigeTokenMultiplier: 1.3,
          offlineProgressMultiplier: 1.5
        }
      }
    ],
    discoveryRequirements: {
      prestigeLevel: 5,
      level: 100,
      achievementIds: ['master_of_all']
    }
  },
  {
    id: 'infinity_blade',
    name: 'Infinity Blade',
    description: 'A fragment of the weapon that created reality',
    lore: "They say the universe was forged with this blade. Even a shard of it contains infinite power.",
    rarity: 'mythic',
    category: 'combat',
    icon: '⚡',
    effects: [
      {
        id: 'ultimate_combat',
        description: 'Increases damage by 35%, crit chance by 10%, and attack speed by 25%',
        stats: {
          damageMultiplier: 1.35,
          critChanceBonus: 0.10,
          autoSpeedMultiplier: 1.25
        }
      }
    ],
    discoveryRequirements: {
      prestigeLevel: 10,
      level: 100,
      zone: 10
    }
  }
]

// Helper function to get relics by category
export function getRelicsByCategory(category: RelicCategory): Relic[] {
  return relics.filter(r => r.category === category)
}

// Helper function to get relics by rarity
export function getRelicsByRarity(rarity: RelicRarity): Relic[] {
  return relics.filter(r => r.rarity === rarity)
}

// Helper function to get a relic by ID
export function getRelicById(id: string): Relic | undefined {
  return relics.find(r => r.id === id)
}

// Calculate total stats from equipped relics
export function calculateRelicStats(equippedRelicIds: string[]): RelicEffect['stats'] {
  const totalStats: RelicEffect['stats'] = {}
  
  equippedRelicIds.forEach(relicId => {
    const relic = getRelicById(relicId)
    if (!relic) return
    
    relic.effects.forEach(effect => {
      if (!effect.stats) return
      
      Object.entries(effect.stats).forEach(([key, value]) => {
        if (value === undefined) return
        
        const statKey = key as keyof NonNullable<RelicEffect['stats']>
        // Multiplicative bonuses stack multiplicatively, additive bonuses stack additively
        if (statKey.includes('Multiplier')) {
          totalStats[statKey] = ((totalStats[statKey] as number) || 1) * value
        } else {
          totalStats[statKey] = ((totalStats[statKey] as number) || 0) + value
        }
      })
    })
  })
  
  return totalStats
}
