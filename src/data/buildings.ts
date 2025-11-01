export interface Building {
  id: string
  name: string
  description: string
  maxLevel: number
  category: 'production' | 'military' | 'utility' | 'research'
  unlockRequirements?: {
    level?: number
    buildings?: Array<{ id: string; level: number }>
    materials?: Record<string, number>
  }
  costs: Array<{
    gold?: number
    materials?: Record<string, number>
  }>
  effects: Array<{
    type: 'click_damage' | 'auto_damage' | 'auto_speed' | 'crit_chance' | 'gold_bonus' | 'xp_bonus' | 'material_bonus' | 'auto_clicker' | 'crafting_speed' | 'quest_efficiency'
    operation: 'add' | 'multiply'
    value: number
  }>
  synergies?: Array<{
    requiresBuilding: string // Building ID that must exist
    minimumLevel?: number    // Minimum level of the required building
    effect: {
      type: 'click_damage' | 'auto_damage' | 'auto_speed' | 'crit_chance' | 'gold_bonus' | 'xp_bonus' | 'material_bonus' | 'auto_clicker' | 'crafting_speed' | 'quest_efficiency'
      operation: 'add' | 'multiply'
      value: number
    }
  }>
}

export const buildings: Building[] = [
  // === CORE BUILDING - Always Available ===
  {
    id: 'town_hall',
    name: 'Town Hall',
    description: 'The heart of your settlement. Upgrading unlocks new buildings and opportunities.',
    maxLevel: 20,
    category: 'utility',
    costs: Array.from({ length: 20 }, (_, i) => ({
      gold: 100 * Math.pow(2.0, i), // INCREASED: was 50 * 1.8^i, now 100 * 2.0^i
      materials: i === 0 ? {} : { 
        wood: Math.floor(5 * Math.pow(1.7, i)), // INCREASED: was 2 * 1.5^i
        ...(i > 3 ? { stone: Math.floor(3 * Math.pow(1.6, i - 3)) } : {}) // INCREASED: was 1 * 1.4^i
      }
    })),
    effects: [
      { type: 'gold_bonus', operation: 'add', value: 2 },
      { type: 'xp_bonus', operation: 'add', value: 2 }
    ]
  },

  // === TIER 1 - Unlocked by Town Hall L1 ===
  {
    id: 'lumber_mill',
    name: 'Lumber Mill',
    description: 'Processes wood and increases material gathering efficiency',
    maxLevel: 15,
    category: 'production',
    unlockRequirements: {
      buildings: [{ id: 'town_hall', level: 1 }]
    },
    costs: Array.from({ length: 15 }, (_, i) => {
      const cost: { gold?: number; materials?: Record<string, number> } = {
        gold: 50 * Math.pow(1.9, i) // INCREASED: was 25 * 1.7^i
      }
      if (i > 0) {
        cost.materials = { wood: Math.floor(3 * Math.pow(1.6, i)) } // INCREASED: was 1.2 * 1.4^i
      }
      return cost
    }),
    effects: [
      { type: 'material_bonus', operation: 'multiply', value: 1.1 }
    ],
    synergies: [
      {
        requiresBuilding: 'marketplace',
        minimumLevel: 1,
        effect: { type: 'quest_efficiency', operation: 'multiply', value: 1.15 }
      }
    ]
  },

  {
    id: 'barracks',
    name: 'Barracks',
    description: 'Trains soldiers who assist in combat',
    maxLevel: 18,
    category: 'military',
    unlockRequirements: {
      buildings: [{ id: 'town_hall', level: 1 }]
    },
    costs: Array.from({ length: 18 }, (_, i) => {
      const cost: { gold?: number; materials?: Record<string, number> } = {
        gold: 150 * Math.pow(2.1, i), // INCREASED: was 75 * 1.9^i
        materials: { wood: Math.floor(3 * Math.pow(1.5, i)) } // INCREASED: was 1.2 * 1.3^i
      }
      if (i > 1) {
        cost.materials!.iron = Math.floor(2 * Math.pow(1.6, i)) // INCREASED: was 1 * 1.4^i
      }
      return cost
    }),
    effects: [
      { type: 'auto_clicker', operation: 'add', value: 0.5 },
      { type: 'auto_speed', operation: 'add', value: 0.1 },
      { type: 'auto_damage', operation: 'multiply', value: 1.05 }
    ]
  },

  // === TIER 2 - Unlocked by Town Hall L2-3 ===
  {
    id: 'blacksmith',
    name: 'Blacksmith',
    description: 'Forges weapons and armor, increasing damage output',
    maxLevel: 20,
    category: 'production',
    unlockRequirements: {
      buildings: [
        { id: 'town_hall', level: 2 },
        { id: 'lumber_mill', level: 2 }
      ]
    },
    costs: Array.from({ length: 20 }, (_, i) => {
      const cost: { gold?: number; materials?: Record<string, number> } = {
        gold: 100 * Math.pow(2.1, i) // INCREASED: was 50 * 1.9^i
      }
      if (i > 2) {
        cost.materials = { 
          iron: Math.floor(5 * Math.pow(1.9, i)), // INCREASED: was 2 * 1.7^i
          wood: Math.floor(2 * Math.pow(1.5, i)) // INCREASED: was 0.4 * 1.3^i
        }
      } else {
        cost.materials = { wood: Math.floor(2 * Math.pow(1.4, i)) } // INCREASED: was 0.8 * 1.2^i
      }
      return cost
    }),
    effects: [
      { type: 'click_damage', operation: 'add', value: 2 },
      { type: 'auto_damage', operation: 'add', value: 1 },
      { type: 'crafting_speed', operation: 'multiply', value: 1.1 }
    ],
    synergies: [
      {
        requiresBuilding: 'mine',
        minimumLevel: 2,
        effect: { type: 'crafting_speed', operation: 'multiply', value: 1.15 }
      },
      {
        requiresBuilding: 'lumber_mill',
        minimumLevel: 3,
        effect: { type: 'material_bonus', operation: 'multiply', value: 1.1 }
      }
    ]
  },

  {
    id: 'tavern',
    name: 'Tavern',
    description: 'A lively establishment where NPCs gather. Recruit heroes to complete quests for rewards!',
    maxLevel: 10,
    category: 'utility',
    unlockRequirements: {
      buildings: [{ id: 'town_hall', level: 3 }]
    },
    costs: Array.from({ length: 10 }, (_, i) => ({
      gold: 150 * Math.pow(2.0, i),
      materials: { 
        wood: Math.floor(3 * Math.pow(1.4, i)), 
        fiber: Math.floor(2 * Math.pow(1.3, i)) 
      }
    })),
    effects: [
      { type: 'quest_efficiency', operation: 'add', value: 1 }
    ],
    synergies: [
      {
        requiresBuilding: 'marketplace',
        minimumLevel: 3,
        effect: { type: 'gold_bonus', operation: 'multiply', value: 1.05 }
      }
    ]
  },

  // === TIER 3 - Unlocked by Town Hall L4-5 ===
  {
    id: 'mine',
    name: 'Mine',
    description: 'Extracts valuable minerals and gems from the earth',
    maxLevel: 12,
    category: 'production',
    unlockRequirements: {
      buildings: [
        { id: 'town_hall', level: 4 },
        { id: 'blacksmith', level: 3 }
      ]
    },
    costs: Array.from({ length: 12 }, (_, i) => {
      const cost: { gold?: number; materials?: Record<string, number> } = {
        gold: 100 * Math.pow(2.0, i),
        materials: { wood: Math.floor(1.5 * Math.pow(1.5, i)) }
      }
      if (i > 0) {
        cost.materials!.iron = Math.floor(2 * Math.pow(1.6, i))
      }
      return cost
    }),
    effects: [
      { type: 'gold_bonus', operation: 'multiply', value: 1.15 }
    ]
  },

  {
    id: 'archery_range',
    name: 'Archery Range',
    description: 'Improves precision and critical hit chances',
    maxLevel: 15,
    category: 'military',
    unlockRequirements: {
      buildings: [
        { id: 'town_hall', level: 4 },
        { id: 'barracks', level: 5 }
      ]
    },
    costs: Array.from({ length: 15 }, (_, i) => ({
      gold: 120 * Math.pow(1.9, i),
      materials: { 
        wood: Math.floor(1.5 * Math.pow(1.4, i)), 
        fiber: Math.floor(2 * Math.pow(1.5, i)) 
      }
    })),
    effects: [
      { type: 'crit_chance', operation: 'add', value: 2 }
    ]
  },

  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Increases gold income from all sources',
    maxLevel: 12,
    category: 'utility',
    unlockRequirements: {
      buildings: [{ id: 'town_hall', level: 5 }]
    },
    costs: Array.from({ length: 12 }, (_, i) => ({
      gold: 200 * Math.pow(2.2, i),
      materials: { 
        wood: Math.floor(2.5 * Math.pow(1.5, i)), 
        fiber: Math.floor(3 * Math.pow(1.6, i)) 
      }
    })),
    effects: [
      { type: 'gold_bonus', operation: 'multiply', value: 1.25 }
    ]
  },

  // === TIER 4 - Unlocked by Town Hall L6-8 ===
  {
    id: 'library',
    name: 'Library',
    description: 'Repository of knowledge that unlocks advanced technologies',
    maxLevel: 10,
    category: 'research',
    unlockRequirements: {
      buildings: [{ id: 'town_hall', level: 6 }]
    },
    costs: Array.from({ length: 10 }, (_, i) => {
      const cost: { gold?: number; materials?: Record<string, number> } = {
        gold: 250 * Math.pow(2.8, i),
        materials: { 
          wood: Math.floor(3 * Math.pow(1.4, i)), 
          fiber: Math.floor(6 * Math.pow(1.5, i))
        }
      }
      if (i > 2) {
        cost.materials!.crystal = Math.floor(2 * Math.pow(1.4, i - 2))
      }
      return cost
    }),
    effects: [
      { type: 'xp_bonus', operation: 'add', value: 5 }
    ]
  },

  {
    id: 'foundry',
    name: 'Foundry',
    description: 'Advanced metalworking facility that enhances crafting capabilities',
    maxLevel: 10,
    category: 'production',
    unlockRequirements: {
      buildings: [
        { id: 'town_hall', level: 7 },
        { id: 'mine', level: 5 }
      ]
    },
    costs: Array.from({ length: 10 }, (_, i) => ({
      gold: 400 * Math.pow(2.2, i),
      materials: { 
        iron: Math.floor(8 * Math.pow(1.6, i)), 
        wood: Math.floor(4 * Math.pow(1.4, i))
      }
    })),
    effects: [
      { type: 'crafting_speed', operation: 'multiply', value: 1.15 }
    ],
    synergies: [
      {
        requiresBuilding: 'blacksmith',
        minimumLevel: 1,
        effect: { type: 'crafting_speed', operation: 'multiply', value: 1.1 }
      }
    ]
  },

  {
    id: 'temple',
    name: 'Temple',
    description: 'Sacred building that increases experience gain',
    maxLevel: 8,
    category: 'utility',
    unlockRequirements: {
      buildings: [{ id: 'town_hall', level: 8 }],
      materials: { crystal: 5 }
    },
    costs: Array.from({ length: 8 }, (_, i) => {
      const cost: { gold?: number; materials?: Record<string, number> } = {
        gold: 300 * Math.pow(3.5, i),
        materials: { 
          wood: Math.floor(5 * Math.pow(1.5, i)), 
          crystal: Math.floor(3 * Math.pow(1.5, i))
        }
      }
      if (i > 0) {
        cost.materials!.magic_dust = Math.floor(2 * Math.pow(1.4, i))
      }
      return cost
    }),
    effects: [
      { type: 'xp_bonus', operation: 'multiply', value: 1.3 }
    ]
  },

  // === TIER 5 - Unlocked by Town Hall L10+ ===
  {
    id: 'fortress',
    name: 'Fortress',
    description: 'Massive defensive structure that enhances all combat abilities',
    maxLevel: 10,
    category: 'military',
    unlockRequirements: {
      buildings: [
        { id: 'town_hall', level: 10 },
        { id: 'barracks', level: 10 },
        { id: 'blacksmith', level: 8 }
      ]
    },
    costs: Array.from({ length: 10 }, (_, i) => ({
      gold: 500 * Math.pow(2.5, i),
      materials: { 
        wood: Math.floor(6 * Math.pow(1.5, i)), 
        iron: Math.floor(10 * Math.pow(1.7, i)), 
        stone: Math.floor(8 * Math.pow(1.6, i)) 
      }
    })),
    effects: [
      { type: 'click_damage', operation: 'multiply', value: 1.2 },
      { type: 'auto_damage', operation: 'multiply', value: 1.15 },
      { type: 'auto_speed', operation: 'multiply', value: 1.1 }
    ]
  },

  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Advanced crafting facility for creating powerful equipment',
    maxLevel: 12,
    category: 'research',
    unlockRequirements: {
      buildings: [
        { id: 'town_hall', level: 10 },
        { id: 'library', level: 5 },
        { id: 'blacksmith', level: 10 }
      ]
    },
    costs: Array.from({ length: 12 }, (_, i) => {
      const cost: { gold?: number; materials?: Record<string, number> } = {
        gold: 600 * Math.pow(4, i),
        materials: { 
          iron: Math.floor(15 * Math.pow(1.8, i)), 
          crystal: Math.floor(6 * Math.pow(1.6, i)),
          magic_dust: Math.floor(4 * Math.pow(1.5, i))
        }
      }
      if (i > 3) {
        cost.materials!.gemstone = Math.floor(2 * Math.pow(1.3, i - 3))
      }
      return cost
    }),
    effects: [
      { type: 'click_damage', operation: 'multiply', value: 1.1 },
      { type: 'auto_damage', operation: 'multiply', value: 1.1 },
      { type: 'crit_chance', operation: 'add', value: 3 }
    ]
  },

  {
    id: 'keep',
    name: 'Keep',
    description: 'Central fortress that serves as the heart of your domain',
    maxLevel: 8,
    category: 'military',
    unlockRequirements: {
      buildings: [
        { id: 'town_hall', level: 12 },
        { id: 'barracks', level: 8 }
      ]
    },
    costs: Array.from({ length: 8 }, (_, i) => ({
      gold: 800 * Math.pow(3.0, i),
      materials: { 
        stone: Math.floor(12 * Math.pow(1.7, i)), 
        iron: Math.floor(8 * Math.pow(1.5, i)),
        wood: Math.floor(6 * Math.pow(1.4, i))
      }
    })),
    effects: [
      { type: 'xp_bonus', operation: 'multiply', value: 1.2 }
    ],
    synergies: [
      {
        requiresBuilding: 'temple',
        minimumLevel: 1,
        effect: { type: 'xp_bonus', operation: 'multiply', value: 1.15 }
      },
      {
        requiresBuilding: 'library',
        minimumLevel: 1,
        effect: { type: 'xp_bonus', operation: 'multiply', value: 1.1 }
      }
    ]
  }
]


// Helper functions
export function getBuilding(id: string): Building | undefined {
  return buildings.find(building => building.id === id)
}

export function getBuildingsByCategory(category: Building['category']): Building[] {
  return buildings.filter(building => building.category === category)
}

export function getCostForLevel(building: Building, level: number): { gold?: number; materials?: Record<string, number> } {
  if (level < 0 || level >= building.costs.length) {
    return {}
  }
  return building.costs[level] || {}
}

export function isBuildingUnlocked(building: Building, playerLevel: number, townBuildings: Array<{ id: string; level: number }>, materials: Record<string, number>): boolean {
  const requirements = building.unlockRequirements
  if (!requirements) return true

  // Check level requirement
  if (requirements.level && playerLevel < requirements.level) {
    return false
  }

  // Check building requirements
  if (requirements.buildings) {
    for (const req of requirements.buildings) {
      const townBuilding = townBuildings.find(b => b.id === req.id)
      if (!townBuilding || townBuilding.level < req.level) {
        return false
      }
    }
  }

  // Check material requirements
  if (requirements.materials) {
    for (const [materialId, requiredAmount] of Object.entries(requirements.materials)) {
      if ((materials[materialId] || 0) < requiredAmount) {
        return false
      }
    }
  }

  return true
}

// Generate dynamic description showing current building benefits
export function generateBuildingDescription(buildingId: string, currentLevel: number, townBuildings: Array<{ id: string; level: number }>): string {
  const buildingData = getBuilding(buildingId)
  if (!buildingData) return 'Unknown building'
  
  let description = buildingData.description
  
  if (currentLevel === 0) {
    // For unbuilt buildings, show what effects they would provide at level 1
    const effects = calculateSingleBuildingEffects(buildingData, 1, townBuildings)
    description += '\n\n' + formatEffectsDescription(effects, 'Will provide')
  } else {
    // For built buildings, show current effects
    const currentEffects = calculateSingleBuildingEffects(buildingData, currentLevel, townBuildings)
    description += '\n\n' + formatEffectsDescription(currentEffects, 'Currently provides')
    
    // Show next level preview if not at max level
    if (currentLevel < buildingData.maxLevel) {
      const nextLevelEffects = calculateSingleBuildingEffects(buildingData, currentLevel + 1, townBuildings)
      const improvement = calculateEffectsDifference(nextLevelEffects, currentEffects)
      if (Object.values(improvement).some(v => v !== 0)) {
        description += '\n\n' + formatEffectsDescription(improvement, 'Next level adds', true)
      }
    }
  }
  
  return description
}

// Calculate effects for a single building at a specific level
function calculateSingleBuildingEffects(buildingData: Building, level: number, townBuildings: Array<{ id: string; level: number }>) {
  const effects = {
    clickDamage: 0,
    autoDamage: 0,
    autoSpeed: 0,
    autoClicker: 0,
    critChance: 0,
    goldBonus: 0,
    xpBonus: 0,
    materialBonus: 0,
    craftingSpeed: 0,
    questEfficiency: 0
  }
  
  // Calculate base effects for this building
  for (const effect of buildingData.effects) {
    const totalValue = effect.value * level
    
    if (effect.type === 'auto_clicker') {
      applyEffect(effects, 'autoClicker', effect.operation, totalValue)
    } else {
      applyEffect(effects, effect.type, effect.operation, totalValue)
    }
  }
  
  // Calculate synergy effects
  if (buildingData.synergies) {
    for (const synergy of buildingData.synergies) {
      const requiredBuilding = townBuildings.find(b => b.id === synergy.requiresBuilding)
      
      if (requiredBuilding && 
          requiredBuilding.level > 0 && 
          requiredBuilding.level >= (synergy.minimumLevel || 1)) {
        
        const synergyValue = synergy.effect.value * level
        applyEffect(effects, synergy.effect.type, synergy.effect.operation, synergyValue)
      }
    }
  }
  
  return effects
}

// Calculate the difference between two effect objects
function calculateEffectsDifference(newEffects: any, currentEffects: any) {
  const difference: any = {}
  
  for (const [key, value] of Object.entries(newEffects)) {
    difference[key] = (value as number) - (currentEffects[key] || 0)
  }
  
  return difference
}

// Format effects into a readable description
function formatEffectsDescription(effects: any, prefix: string, showPlus = false): string {
  const descriptions: string[] = []
  const effectLabels: Record<string, string> = {
    clickDamage: 'Click Damage',
    autoDamage: 'Auto Attack Damage', 
    autoSpeed: 'Attack Speed',
    autoClicker: 'Auto Clickers',
    critChance: 'Crit Chance',
    goldBonus: 'Gold Bonus',
    xpBonus: 'XP Bonus',
    materialBonus: 'Material Bonus',
    craftingSpeed: 'Crafting Speed',
    questEfficiency: 'Quest Efficiency'
  }
  
  for (const [key, value] of Object.entries(effects)) {
    if (value === 0) continue
    
    const numValue = value as number
    const label = effectLabels[key] || key
    const sign = showPlus && numValue > 0 ? '+' : ''
    
    if (key.includes('Bonus') || key.includes('Speed') || key.includes('Efficiency')) {
      descriptions.push(`${sign}${(numValue * 100).toFixed(0)}% ${label}`)
    } else if (key === 'critChance') {
      descriptions.push(`${sign}${(numValue * 100).toFixed(1)}% ${label}`)
    } else {
      descriptions.push(`${sign}${numValue.toFixed(0)} ${label}`)
    }
  }
  
  return descriptions.length > 0 ? `${prefix}: ${descriptions.join(', ')}` : ''
}

function applyEffect(effects: any, type: string, operation: string, value: number) {
  // Map effect types to camelCase keys
  const typeMap: Record<string, string> = {
    'click_damage': 'clickDamage',
    'auto_damage': 'autoDamage', 
    'auto_speed': 'autoSpeed',
    'auto_clicker': 'autoClicker',
    'crit_chance': 'critChance',
    'gold_bonus': 'goldBonus',
    'xp_bonus': 'xpBonus',
    'material_bonus': 'materialBonus',
    'crafting_speed': 'craftingSpeed',
    'quest_efficiency': 'questEfficiency'
  }
  
  const key = typeMap[type] || type
  
  if (operation === 'add') {
    effects[key] = (effects[key] || 0) + value
  } else if (operation === 'multiply') {
    // For multiply operations, we need to handle them differently
    // Store multipliers separately to be applied after base values
    const multKey = `${key}Mult`
    effects[multKey] = (effects[multKey] || 1) * value
  }
}

export function calculateBuildingEffects(townBuildings: Array<{ id: string; level: number }>) {
  const effects: any = {
    clickDamage: 0,
    autoDamage: 0,
    autoSpeed: 0,
    autoClicker: 0,
    critChance: 0,
    goldBonus: 0,
    xpBonus: 0,
    materialBonus: 0,
    craftingSpeed: 0,
    questEfficiency: 0
  }

  // First pass: Calculate base effects
  for (const townBuilding of townBuildings) {
    if (townBuilding.level === 0) continue
    
    const buildingData = getBuilding(townBuilding.id)
    if (!buildingData) continue

    for (const effect of buildingData.effects) {
      const totalValue = effect.value * townBuilding.level
      
      if (effect.type === 'auto_clicker') {
        applyEffect(effects, 'autoClicker', effect.operation, totalValue)
      } else {
        applyEffect(effects, effect.type, effect.operation, totalValue)
      }
    }
  }

  // Second pass: Calculate synergy effects
  for (const townBuilding of townBuildings) {
    if (townBuilding.level === 0) continue
    
    const buildingData = getBuilding(townBuilding.id)
    if (!buildingData || !buildingData.synergies) continue

    for (const synergy of buildingData.synergies) {
      const requiredBuilding = townBuildings.find(b => b.id === synergy.requiresBuilding)
      
      // Check if the required building exists and meets minimum level
      if (requiredBuilding && 
          requiredBuilding.level > 0 && 
          requiredBuilding.level >= (synergy.minimumLevel || 1)) {
        
        // For multiply operations, don't scale by building level (that would be exponential growth)
        // For add operations, scale by building level
        const synergyValue = synergy.effect.operation === 'multiply' 
          ? synergy.effect.value 
          : synergy.effect.value * townBuilding.level
        
        applyEffect(effects, synergy.effect.type, synergy.effect.operation, synergyValue)
      }
    }
  }

  // Third pass: Apply multipliers to base values
  const baseKeys = ['clickDamage', 'autoDamage', 'autoSpeed', 'autoClicker', 'critChance', 
                    'goldBonus', 'xpBonus', 'materialBonus', 'craftingSpeed', 'questEfficiency']
  
  for (const key of baseKeys) {
    const multKey = `${key}Mult`
    if (effects[multKey]) {
      effects[key] = effects[key] * effects[multKey]
      delete effects[multKey] // Clean up the multiplier keys
    }
  }

  return effects
}