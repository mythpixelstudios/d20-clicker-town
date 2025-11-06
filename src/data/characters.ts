/**
 * Character System
 * Defines all characters in the game including their portraits, roles, and associations
 * Characters can be building representatives, quest givers, or story NPCs
 */

export interface Character {
  id: string
  name: string
  title: string // e.g., "Town Mayor", "Blacksmith Master"
  role: 'building_representative' | 'story_npc' | 'quest_giver' | 'merchant'
  portrait: string // Emoji or image path for character portrait
  description: string
  personality: string // Brief personality description for dialogue consistency
  buildingId?: string // Associated building if they're a representative
  unlockRequirements?: {
    level?: number
    buildings?: Array<{ id: string; level: number }>
    completedChapters?: string[]
  }
}

export const characters: Character[] = [
  // === TOWN REPRESENTATIVES ===
  {
    id: 'mayor_aldric',
    name: 'Aldric',
    title: 'Town Mayor',
    role: 'building_representative',
    portrait: '👨‍💼',
    description: 'The wise and experienced mayor of your growing settlement. He oversees all town development and has grand visions for the future.',
    personality: 'Wise, encouraging, strategic thinker',
    buildingId: 'town_hall'
  },
  
  {
    id: 'foreman_grok',
    name: 'Grok',
    title: 'Lumber Foreman',
    role: 'building_representative',
    portrait: '🪓',
    description: 'A burly woodsman who manages the lumber mill operations. He knows the forest better than anyone.',
    personality: 'Gruff but kind, hardworking, nature-loving',
    buildingId: 'lumber_mill'
  },
  
  {
    id: 'captain_thorne',
    name: 'Captain Thorne',
    title: 'Barracks Commander',
    role: 'building_representative',
    portrait: '⚔️',
    description: 'A veteran warrior who trains your town\'s defenders. Scarred from countless battles but still standing strong.',
    personality: 'Disciplined, honorable, protective',
    buildingId: 'barracks'
  },
  
  {
    id: 'merchant_lyra',
    name: 'Lyra',
    title: 'Marketplace Overseer',
    role: 'building_representative',
    portrait: '💰',
    description: 'A shrewd but fair merchant who manages the town\'s trade. She has connections across the realm.',
    personality: 'Clever, business-minded, friendly',
    buildingId: 'marketplace'
  },
  
  {
    id: 'miner_borin',
    name: 'Borin Stonefist',
    title: 'Mine Supervisor',
    role: 'building_representative',
    portrait: '⛏️',
    description: 'A stout dwarf who oversees mining operations. He can sense valuable ore veins from miles away.',
    personality: 'Stubborn, proud, expert craftsman',
    buildingId: 'mine'
  },
  
  {
    id: 'scholar_elara',
    name: 'Elara',
    title: 'Head Librarian',
    role: 'building_representative',
    portrait: '📚',
    description: 'A brilliant scholar who curates the town\'s knowledge. She\'s always researching ancient texts and mysteries.',
    personality: 'Curious, intellectual, slightly absent-minded',
    buildingId: 'library'
  },
  
  {
    id: 'blacksmith_gareth',
    name: 'Gareth',
    title: 'Master Blacksmith',
    role: 'building_representative',
    portrait: '🔨',
    description: 'The town\'s master blacksmith, capable of forging legendary weapons and armor. His forge never goes cold.',
    personality: 'Perfectionist, passionate about craft, grumpy exterior',
    buildingId: 'blacksmith'
  },
  
  {
    id: 'architect_mira',
    name: 'Mira',
    title: 'Master Architect',
    role: 'building_representative',
    portrait: '📐',
    description: 'A visionary architect who designs the town\'s buildings. She dreams of creating architectural marvels.',
    personality: 'Creative, ambitious, detail-oriented',
    buildingId: 'workshop'
  },
  
  {
    id: 'priest_aldwin',
    name: 'Father Aldwin',
    title: 'High Priest',
    role: 'building_representative',
    portrait: '⛪',
    description: 'The spiritual leader of the town. He provides guidance and healing to all who seek it.',
    personality: 'Compassionate, wise, faithful',
    buildingId: 'temple'
  },
  
  {
    id: 'mage_zephyr',
    name: 'Zephyr',
    title: 'Archmage',
    role: 'building_representative',
    portrait: '🧙',
    description: 'A powerful mage who studies the arcane arts. His tower crackles with magical energy.',
    personality: 'Mysterious, knowledgeable, eccentric',
    buildingId: 'tower'
  },
  
  {
    id: 'alchemist_vera',
    name: 'Vera',
    title: 'Master Alchemist',
    role: 'building_representative',
    portrait: '⚗️',
    description: 'An expert in potions and elixirs. Her laboratory is filled with bubbling concoctions.',
    personality: 'Experimental, enthusiastic, slightly chaotic',
    buildingId: 'alchemy_lab'
  },
  
  {
    id: 'ranger_finn',
    name: 'Finn',
    title: 'Master Ranger',
    role: 'building_representative',
    portrait: '🏹',
    description: 'An elite ranger who trains scouts and archers. He can track anything through any terrain.',
    personality: 'Silent, observant, nature-connected',
    buildingId: 'archery_range'
  },
  
  {
    id: 'lord_commander',
    name: 'Lord Commander Valen',
    title: 'Keep Commander',
    role: 'building_representative',
    portrait: '🛡️',
    description: 'The highest military authority in the region. His presence commands respect and inspires courage.',
    personality: 'Noble, strategic, inspiring leader',
    buildingId: 'keep'
  },
  
  // === STORY NPCs ===
  {
    id: 'mysterious_stranger',
    name: '???',
    title: 'Mysterious Stranger',
    role: 'story_npc',
    portrait: '🎭',
    description: 'A hooded figure who appears at critical moments. Their true identity is unknown.',
    personality: 'Cryptic, knowledgeable, enigmatic',
    unlockRequirements: {
      completedChapters: ['chapter_1']
    }
  },
  
  {
    id: 'oracle_cassandra',
    name: 'Cassandra',
    title: 'The Oracle',
    role: 'story_npc',
    portrait: '🔮',
    description: 'A seer who can glimpse fragments of the future. She speaks in riddles and prophecies.',
    personality: 'Mystical, prophetic, otherworldly',
    unlockRequirements: {
      level: 10,
      completedChapters: ['chapter_2']
    }
  },
  
  {
    id: 'demon_lord',
    name: 'Malachar',
    title: 'The Demon Lord',
    role: 'story_npc',
    portrait: '👿',
    description: 'An ancient evil that threatens the realm. His dark influence spreads across the land.',
    personality: 'Menacing, powerful, cunning',
    unlockRequirements: {
      level: 20,
      completedChapters: ['chapter_5']
    }
  },
  
  {
    id: 'ancient_dragon',
    name: 'Auraxia',
    title: 'The Ancient Dragon',
    role: 'story_npc',
    portrait: '🐉',
    description: 'A wise and ancient dragon who has watched civilizations rise and fall. She may be an ally... or a threat.',
    personality: 'Ancient, wise, unpredictable',
    unlockRequirements: {
      level: 25,
      completedChapters: ['chapter_7']
    }
  }
]

// Helper functions
export function getCharacter(id: string): Character | undefined {
  return characters.find(char => char.id === id)
}

export function getCharacterByBuilding(buildingId: string): Character | undefined {
  return characters.find(char => char.buildingId === buildingId)
}

export function getAvailableCharacters(
  playerLevel: number,
  completedChapters: string[],
  buildings: Array<{ id: string; level: number }>
): Character[] {
  return characters.filter(char => {
    const requirements = char.unlockRequirements
    if (!requirements) return true
    
    // Check level requirement
    if (requirements.level && playerLevel < requirements.level) {
      return false
    }
    
    // Check building requirements
    if (requirements.buildings) {
      for (const req of requirements.buildings) {
        const building = buildings.find(b => b.id === req.id)
        if (!building || building.level < req.level) {
          return false
        }
      }
    }
    
    // Check completed chapters
    if (requirements.completedChapters) {
      for (const chapterId of requirements.completedChapters) {
        if (!completedChapters.includes(chapterId)) {
          return false
        }
      }
    }
    
    return true
  })
}

export function getBuildingRepresentatives(): Character[] {
  return characters.filter(char => char.role === 'building_representative')
}

export function getStoryNPCs(): Character[] {
  return characters.filter(char => char.role === 'story_npc')
}

