export interface NPCTrait {
  id: string
  name: string
  description: string
  effects: {
    speed?: number // Multiplier for quest completion time
    yield?: number // Multiplier for quest rewards
    specialization?: string // Quest type this NPC is specialized for
  }
}

export interface NPC {
  id: string
  name: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  traits: NPCTrait[]
  baseStats: {
    speed: number // Base speed multiplier (1.0 = normal)
    yield: number // Base yield multiplier (1.0 = normal)
  }
  levelingStats: {
    maxLevel: number // Maximum level this NPC can reach
    xpPerLevel: number // Base XP needed per level (increases per level)
    statGrowth: {
      speedPerLevel: number // Speed improvement per level
      yieldPerLevel: number // Yield improvement per level
    }
  }
  unlockRequirements?: {
    level?: number
    buildings?: Array<{ id: string; level: number }>
    completedQuests?: string[]
  }
  recruitmentCost: {
    gold: number
  }
  recruitmentChance: {
    base: number // Base chance to recruit (0-1), affected by Constitution
    constitutionWeight: number // How much CON affects this NPC (0-1)
  }
}

export interface Quest {
  id: string
  name: string
  description: string
  type: 'gathering' | 'combat' | 'crafting' | 'exploration'
  baseDuration: number // In seconds
  baseRewards: {
    gold?: number
    materials?: Record<string, number>
    experience?: number
  }
  requirements?: {
    level?: number
    buildings?: Array<{ id: string; level: number }>
    materials?: Record<string, number>
  }
  repeatable: boolean
}

// NPC Traits
export const npcTraits: NPCTrait[] = [
  {
    id: 'quick_hands',
    name: 'Quick Hands',
    description: 'Completes tasks 25% faster',
    effects: { speed: 1.25 }
  },
  {
    id: 'efficient',
    name: 'Efficient',
    description: 'Produces 20% more resources',
    effects: { yield: 1.2 }
  },
  {
    id: 'gatherer',
    name: 'Gatherer',
    description: 'Specialized in gathering quests, +50% yield',
    effects: { specialization: 'gathering', yield: 1.5 }
  },
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Specialized in combat quests, completes 40% faster',
    effects: { specialization: 'combat', speed: 1.4 }
  },
  {
    id: 'artisan',
    name: 'Artisan',
    description: 'Specialized in crafting quests, +75% yield',
    effects: { specialization: 'crafting', yield: 1.75 }
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Specialized in exploration quests, completes 30% faster',
    effects: { specialization: 'exploration', speed: 1.3 }
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'Sometimes finds extra rewards (+25% yield)',
    effects: { yield: 1.25 }
  },
  {
    id: 'hardworking',
    name: 'Hardworking',
    description: 'Works 15% faster and produces 10% more',
    effects: { speed: 1.15, yield: 1.1 }
  }
]

// NPCs
export const npcs: NPC[] = [
  {
    id: 'gareth',
    name: 'Gareth the Woodcutter',
    description: 'A sturdy woodsman with calloused hands and a keen eye for quality timber.',
    rarity: 'common',
    traits: [npcTraits[2]], // Gatherer
    baseStats: { speed: 1, yield: 1 },
    levelingStats: {
      maxLevel: 20,
      xpPerLevel: 100,
      statGrowth: {
        speedPerLevel: 0.02, // +2% speed per level
        yieldPerLevel: 0.03  // +3% yield per level
      }
    },
    recruitmentCost: { gold: 100 },
    recruitmentChance: { base: 0.95, constitutionWeight: 0.2 } // Easy to recruit
  },
  {
    id: 'elena',
    name: 'Elena Swiftblade',
    description: 'A nimble fighter who has seen many battles.',
    rarity: 'uncommon',
    traits: [npcTraits[3], npcTraits[0]], // Warrior, Quick Hands
    baseStats: { speed: 1.1, yield: 0.9 },
    levelingStats: {
      maxLevel: 25,
      xpPerLevel: 150,
      statGrowth: {
        speedPerLevel: 0.025,
        yieldPerLevel: 0.02
      }
    },
    recruitmentCost: { gold: 250 },
    recruitmentChance: { base: 0.75, constitutionWeight: 0.4 } // Moderate difficulty
  },
  {
    id: 'marcus',
    name: 'Marcus the Smith',
    description: 'A master craftsman whose hammer rings true.',
    rarity: 'rare',
    traits: [npcTraits[4]], // Artisan
    baseStats: { speed: 0.9, yield: 1.2 },
    levelingStats: {
      maxLevel: 30,
      xpPerLevel: 200,
      statGrowth: {
        speedPerLevel: 0.015,
        yieldPerLevel: 0.04
      }
    },
    recruitmentCost: { gold: 500 },
    recruitmentChance: { base: 0.60, constitutionWeight: 0.6 }, // Hard to recruit
    unlockRequirements: {
      buildings: [{ id: 'blacksmith', level: 3 }]
    }
  },
  {
    id: 'lydia',
    name: 'Lydia Stormwind',
    description: 'An experienced explorer who has mapped distant lands.',
    rarity: 'rare',
    traits: [npcTraits[5], npcTraits[6]], // Explorer, Lucky
    baseStats: { speed: 1, yield: 1.1 },
    levelingStats: {
      maxLevel: 30,
      xpPerLevel: 200,
      statGrowth: {
        speedPerLevel: 0.03,
        yieldPerLevel: 0.025
      }
    },
    recruitmentCost: { gold: 500 },
    recruitmentChance: { base: 0.65, constitutionWeight: 0.5 }, // Moderate-hard to recruit
    unlockRequirements: {
      level: 10
    }
  },
  {
    id: 'thorin',
    name: 'Thorin Ironbeard',
    description: 'A legendary dwarf whose work ethic is unmatched.',
    rarity: 'epic',
    traits: [npcTraits[7], npcTraits[1]], // Hardworking, Efficient
    baseStats: { speed: 1.2, yield: 1.3 },
    levelingStats: {
      maxLevel: 40,
      xpPerLevel: 300,
      statGrowth: {
        speedPerLevel: 0.03,
        yieldPerLevel: 0.035
      }
    },
    recruitmentCost: { gold: 1000 },
    recruitmentChance: { base: 0.40, constitutionWeight: 0.8 }, // Very hard to recruit
    unlockRequirements: {
      level: 15,
      buildings: [{ id: 'mine', level: 5 }]
    }
  }
]

// Quests
export const quests: Quest[] = [
  {
    id: 'gather_wood',
    name: 'Gather Wood',
    description: 'Collect wood from the nearby forest.',
    type: 'gathering',
    baseDuration: 300, // 5 minutes
    baseRewards: {
      materials: { wood: 8 },
      experience: 10
    },
    repeatable: true
  },
  {
    id: 'mine_iron',
    name: 'Mine Iron',
    description: 'Extract iron ore from the mountain mines.',
    type: 'gathering',
    baseDuration: 420, // 7 minutes
    baseRewards: {
      materials: { iron: 5 },
      experience: 15
    },
    requirements: {
      buildings: [{ id: 'mine', level: 1 }]
    },
    repeatable: true
  },
  {
    id: 'patrol_roads',
    name: 'Patrol the Roads',
    description: 'Clear bandits from the trade routes.',
    type: 'combat',
    baseDuration: 480, // 8 minutes
    baseRewards: {
      gold: 150,
      experience: 25
    },
    requirements: {
      level: 5
    },
    repeatable: true
  },
  {
    id: 'forge_tools',
    name: 'Forge Tools',
    description: 'Create basic tools for the townspeople.',
    type: 'crafting',
    baseDuration: 600, // 10 minutes
    baseRewards: {
      gold: 200,
      materials: { iron: 2 },
      experience: 20
    },
    requirements: {
      buildings: [{ id: 'blacksmith', level: 2 }],
      materials: { iron: 3, wood: 2 }
    },
    repeatable: true
  },
  {
    id: 'scout_lands',
    name: 'Scout New Lands',
    description: 'Explore uncharted territories for resources.',
    type: 'exploration',
    baseDuration: 900, // 15 minutes
    baseRewards: {
      gold: 100,
      materials: { crystal: 2, wood: 5 },
      experience: 30
    },
    requirements: {
      level: 8
    },
    repeatable: true
  },
  {
    id: 'collect_herbs',
    name: 'Collect Herbs',
    description: 'Gather medicinal herbs from the countryside.',
    type: 'gathering',
    baseDuration: 240, // 4 minutes
    baseRewards: {
      materials: { fiber: 10 },
      experience: 8
    },
    repeatable: true
  },
  // Advanced Material Gathering Quests
  {
    id: 'harvest_crystals',
    name: 'Harvest Mystical Crystals',
    description: 'Journey to the Crystal Caves to extract rare crystals.',
    type: 'gathering',
    baseDuration: 1200, // 20 minutes
    baseRewards: {
      materials: { crystal: 6, magic_dust: 3 },
      experience: 50,
      gold: 200
    },
    requirements: {
      level: 12,
      buildings: [{ id: 'mine', level: 5 }]
    },
    repeatable: true
  },
  {
    id: 'mine_obsidian',
    name: 'Mine Volcanic Obsidian',
    description: 'Brave the volcanic fields to extract rare obsidian.',
    type: 'gathering',
    baseDuration: 1500, // 25 minutes
    baseRewards: {
      materials: { obsidian: 4, fire_crystal: 5, sulfur: 6 },
      experience: 65,
      gold: 250
    },
    requirements: {
      level: 15,
      buildings: [{ id: 'mine', level: 7 }]
    },
    repeatable: true
  },
  {
    id: 'collect_ice_shards',
    name: 'Collect Frozen Shards',
    description: 'Venture into the frozen tundra to gather ice crystals and frozen wood.',
    type: 'gathering',
    baseDuration: 1400, // 23 minutes
    baseRewards: {
      materials: { ice_crystal: 7, frozen_wood: 5, ice_essence: 3 },
      experience: 60,
      gold: 230
    },
    requirements: {
      level: 18,
      buildings: [{ id: 'warehouse', level: 5 }]
    },
    repeatable: true
  },
  {
    id: 'delve_demon_realm',
    name: 'Delve into Demon Realm',
    description: 'Enter the demon realm to extract demon cores and soul crystals.',
    type: 'combat',
    baseDuration: 2400, // 40 minutes
    baseRewards: {
      materials: { demon_core: 2, soul_crystal: 3, hell_fire: 4 },
      experience: 120,
      gold: 500
    },
    requirements: {
      level: 25,
      buildings: [{ id: 'barracks', level: 8 }]
    },
    repeatable: true
  },
  {
    id: 'sky_expedition',
    name: 'Sky Islands Expedition',
    description: 'Ascend to the sky islands to harvest sky metal and wind crystals.',
    type: 'exploration',
    baseDuration: 1800, // 30 minutes
    baseRewards: {
      materials: { sky_metal: 5, wind_crystal: 6, cloud_essence: 4 },
      experience: 85,
      gold: 350
    },
    requirements: {
      level: 22,
      buildings: [{ id: 'tavern', level: 6 }]
    },
    repeatable: true
  },
  {
    id: 'mystic_grove_harvest',
    name: 'Harvest Mystic Grove',
    description: 'Collect enchanted materials from the magical grove.',
    type: 'gathering',
    baseDuration: 1600, // 27 minutes
    baseRewards: {
      materials: { mystic_wood: 6, enchanted_leaf: 8, magic_dust: 5 },
      experience: 70,
      gold: 280
    },
    requirements: {
      level: 20,
      buildings: [{ id: 'library', level: 5 }]
    },
    repeatable: true
  },
  {
    id: 'ancient_ruins_excavation',
    name: 'Ancient Ruins Excavation',
    description: 'Excavate the desert ruins for ancient treasures and artifacts.',
    type: 'exploration',
    baseDuration: 2000, // 33 minutes
    baseRewards: {
      materials: { sand_glass: 7, ancient_coin: 4, dried_herb: 6 },
      experience: 95,
      gold: 400
    },
    requirements: {
      level: 21,
      buildings: [{ id: 'library', level: 6 }]
    },
    repeatable: true
  },
  {
    id: 'forge_specialized_alloys',
    name: 'Forge Specialized Alloys',
    description: 'Craft rare alloys and materials for legendary equipment.',
    type: 'crafting',
    baseDuration: 2200, // 37 minutes
    baseRewards: {
      materials: { sky_metal: 3, soul_crystal: 2, fire_crystal: 4 },
      experience: 100,
      gold: 450
    },
    requirements: {
      level: 24,
      buildings: [{ id: 'blacksmith', level: 10 }],
      materials: { iron: 10, crystal: 8, obsidian: 5 }
    },
    repeatable: true
  },
  {
    id: 'void_expedition',
    name: 'Void Realm Expedition',
    description: 'Travel to the void realm to extract reality-bending materials. Extremely dangerous!',
    type: 'exploration',
    baseDuration: 3000, // 50 minutes
    baseRewards: {
      materials: { void_essence: 3, reality_shard: 2, time_crystal: 2 },
      experience: 150,
      gold: 800
    },
    requirements: {
      level: 30,
      buildings: [{ id: 'tower', level: 8 }]
    },
    repeatable: true
  }
]

// Helper functions
export function getNPC(id: string): NPC | undefined {
  return npcs.find(npc => npc.id === id)
}

export function getQuest(id: string): Quest | undefined {
  return quests.find(quest => quest.id === id)
}

export function getAvailableNPCs(playerLevel: number, townBuildings: Array<{ id: string; level: number }>, completedQuests: string[]): NPC[] {
  return npcs.filter(npc => {
    if (!npc.unlockRequirements) return true
    
    // Check level requirement
    if (npc.unlockRequirements.level && playerLevel < npc.unlockRequirements.level) {
      return false
    }
    
    // Check building requirements
    if (npc.unlockRequirements.buildings) {
      for (const req of npc.unlockRequirements.buildings) {
        const building = townBuildings.find(b => b.id === req.id)
        if (!building || building.level < req.level) {
          return false
        }
      }
    }
    
    // Check completed quests
    if (npc.unlockRequirements.completedQuests) {
      for (const questId of npc.unlockRequirements.completedQuests) {
        if (!completedQuests.includes(questId)) {
          return false
        }
      }
    }
    
    return true
  })
}

export function getAvailableQuests(playerLevel: number, townBuildings: Array<{ id: string; level: number }>, materials: Record<string, number>): Quest[] {
  return quests.filter(quest => {
    if (!quest.requirements) return true
    
    // Check level requirement
    if (quest.requirements.level && playerLevel < quest.requirements.level) {
      return false
    }
    
    // Check building requirements
    if (quest.requirements.buildings) {
      for (const req of quest.requirements.buildings) {
        const building = townBuildings.find(b => b.id === req.id)
        if (!building || building.level < req.level) {
          return false
        }
      }
    }
    
    // Check material requirements (for starting the quest)
    if (quest.requirements.materials) {
      for (const [materialId, amount] of Object.entries(quest.requirements.materials)) {
        if ((materials[materialId] || 0) < amount) {
          return false
        }
      }
    }
    
    return true
  })
}

export function calculateQuestEffectiveness(npc: NPC, quest: Quest): { speedMultiplier: number; yieldMultiplier: number } {
  let speedMultiplier = npc.baseStats.speed
  let yieldMultiplier = npc.baseStats.yield
  
  for (const trait of npc.traits) {
    // Apply speed bonus
    if (trait.effects.speed) {
      // If the trait has a specialization, only apply if it matches the quest type
      if (trait.effects.specialization) {
        if (trait.effects.specialization === quest.type) {
          speedMultiplier *= trait.effects.speed
        }
      } else {
        speedMultiplier *= trait.effects.speed
      }
    }
    
    // Apply yield bonus
    if (trait.effects.yield) {
      // If the trait has a specialization, only apply if it matches the quest type
      if (trait.effects.specialization) {
        if (trait.effects.specialization === quest.type) {
          yieldMultiplier *= trait.effects.yield
        }
      } else {
        yieldMultiplier *= trait.effects.yield
      }
    }
  }
  
  return { speedMultiplier, yieldMultiplier }
}

// NPC Leveling System Functions
export function calculateNPCStatsAtLevel(npc: NPC, level: number): { speed: number; yield: number } {
  const levelsGained = Math.max(0, level - 1) // Level 1 is base stats
  
  return {
    speed: npc.baseStats.speed + (npc.levelingStats.statGrowth.speedPerLevel * levelsGained),
    yield: npc.baseStats.yield + (npc.levelingStats.statGrowth.yieldPerLevel * levelsGained)
  }
}

export function calculateXPForLevel(npc: NPC, level: number): number {
  // XP required increases by 10% each level
  return Math.floor(npc.levelingStats.xpPerLevel * Math.pow(1.1, level - 1))
}

export function calculateTotalXPForLevel(npc: NPC, targetLevel: number): number {
  let totalXP = 0
  for (let level = 1; level < targetLevel; level++) {
    totalXP += calculateXPForLevel(npc, level)
  }
  return totalXP
}

export function calculateQuestXPReward(quest: Quest): number {
  // Base XP reward is the quest duration / 60 (1 XP per minute)
  return Math.floor(quest.baseDuration / 60)
}

// Calculate recruitment success chance based on Constitution
export function calculateRecruitmentChance(npc: NPC, constitutionStat: number): number {
  // Each point of Constitution adds bonus to recruitment chance
  // Formula: baseChance + (CON * constitutionWeight * 0.01)
  // Example: 20 CON with 0.5 weight = +10% chance
  const conBonus = constitutionStat * npc.recruitmentChance.constitutionWeight * 0.01
  const totalChance = npc.recruitmentChance.base + conBonus
  
  // Clamp between 10% and 99% (never guaranteed, never impossible)
  return Math.max(0.1, Math.min(0.99, totalChance))
}