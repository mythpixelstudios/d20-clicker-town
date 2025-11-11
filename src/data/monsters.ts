import { getZone } from './zones'
import { WeaponType } from './equipment'

export interface MonsterAffix {
  id: string
  name: string
  description: string
  color: string
  icon: string
  effects: {
    hpMultiplier?: number
    goldMultiplier?: number
    materialBonus?: Record<string, number>
    missChance?: number // Chance for auto attacks to miss
  }
}

export interface Monster {
  name: string
  hp: number
  image: string
  armorClass: number // D&D style AC - player must roll attack >= AC to hit
  affixes?: MonsterAffix[]
}

export interface Boss extends Monster {
  description: string
  vulnerabilities?: WeaponType[] // Weapons that deal full damage
  immunities?: WeaponType[] // Weapons that deal no damage
  resistances?: WeaponType[] // Weapons that deal 50% damage
}

export const monsterAffixes: MonsterAffix[] = [
  {
    id: 'tough',
    name: 'Tough',
    description: 'This monster has increased health',
    color: '#8B4513',
    icon: '🛡️',
    effects: {
      hpMultiplier: 1.5,
      goldMultiplier: 1.3
    }
  },
  {
    id: 'evasive',
    name: 'Evasive',
    description: 'Auto attacks have a 40% chance to miss',
    color: '#4169E1',
    icon: '💨',
    effects: {
      missChance: 0.4,
      goldMultiplier: 1.2
    }
  },
  {
    id: 'wealthy',
    name: 'Wealthy',
    description: 'Drops 2x gold when defeated',
    color: '#FFD700',
    icon: '💰',
    effects: {
      goldMultiplier: 2.0
    }
  },
  {
    id: 'arcane',
    name: 'Arcane',
    description: 'Has a chance to drop rare materials',
    color: '#9370DB',
    icon: '✨',
    effects: {
      materialBonus: {
        crystal: 1,
        magic_dust: 1
      },
      goldMultiplier: 1.5
    }
  },
  {
    id: 'resilient',
    name: 'Resilient',
    description: 'Takes longer to defeat but gives bonus XP',
    color: '#2E8B57',
    icon: '💪',
    effects: {
      hpMultiplier: 2.0,
      goldMultiplier: 1.8
    }
  },
  {
    id: 'swift',
    name: 'Swift',
    description: 'Faster but drops extra loot',
    color: '#FF6347',
    icon: '⚡',
    effects: {
      hpMultiplier: 0.8,
      goldMultiplier: 1.4,
      materialBonus: {
        leather: 1
      }
    }
  },
  {
    id: 'cursed',
    name: 'Cursed',
    description: 'Difficult enemy with powerful rewards',
    color: '#8B008B',
    icon: '👿',
    effects: {
      hpMultiplier: 1.8,
      missChance: 0.3,
      goldMultiplier: 2.5,
      materialBonus: {
        dark_essence: 1
      }
    }
  }
]

type MonstersByZone = Record<number, Monster[]>
type BossesByZone = Record<number, Boss>

const monstersByZone: MonstersByZone = {
  1: [ // Forest Outskirts - AC 8-10 (unarmored, easy to hit)
    { name: "Forest Rabbit", hp: 15, image: "/src/images/monsters/forest-rabbit.png", armorClass: 8 },
    { name: "Wild Boar", hp: 25, image: "/src/images/monsters/forest-boar.png", armorClass: 9 },
    { name: "Forest Spider", hp: 20, image: "/src/images/monsters/forest-spider.png", armorClass: 10 },
    { name: "Tree Snake", hp: 18, image: "/src/images/monsters/forest-snake.png", armorClass: 9 },
    { name: "Forest Imp", hp: 30, image: "/src/images/monsters/forest-imp.png", armorClass: 10 },
  ],
  2: [ // Dark Woods - AC 10-12 (slightly tougher)
    { name: "Shadow Bat", hp: 35, image: "🦇", armorClass: 11 },
    { name: "Dark Wolf", hp: 45, image: "🐺", armorClass: 11 },
    { name: "Cursed Tree", hp: 55, image: "🌲", armorClass: 12 },
    { name: "Shadow Sprite", hp: 40, image: "👻", armorClass: 10 },
    { name: "Corrupted Bear", hp: 60, image: "🐻", armorClass: 12 }
  ],
  3: [ // Mountain Base - AC 12-14 (armored creatures)
    { name: "Rock Crab", hp: 70, image: "🦀", armorClass: 14 },
    { name: "Mountain Goat", hp: 65, image: "🐐", armorClass: 12 },
    { name: "Stone Beetle", hp: 80, image: "🪲", armorClass: 14 },
    { name: "Cave Troll", hp: 90, image: "👹", armorClass: 13 },
    { name: "Iron Scorpion", hp: 85, image: "🦂", armorClass: 14 }
  ],
  4: [ // Crystal Caves - AC 13-15 (crystalline armor)
    { name: "Crystal Slime", hp: 110, image: "💧", armorClass: 13 },
    { name: "Gem Wasp", hp: 95, image: "🐝", armorClass: 14 },
    { name: "Prism Beast", hp: 120, image: "💎", armorClass: 15 },
    { name: "Cave Lurker", hp: 105, image: "👁️", armorClass: 13 },
    { name: "Crystal Golem", hp: 140, image: "🗿", armorClass: 15 }
  ],
  5: [ // Volcanic Fields - AC 14-16 (heat-hardened)
    { name: "Lava Lizard", hp: 160, image: "🦎", armorClass: 15 },
    { name: "Fire Ant", hp: 145, image: "🐜", armorClass: 14 },
    { name: "Magma Elemental", hp: 180, image: "🔥", armorClass: 16 },
    { name: "Ash Wraith", hp: 170, image: "👻", armorClass: 14 },
    { name: "Molten Spider", hp: 155, image: "🕷️", armorClass: 15 }
  ],
  6: [ // Frozen Tundra - AC 15-17 (frozen armor)
    { name: "Ice Wolf", hp: 210, image: "🐺", armorClass: 15 },
    { name: "Frost Giant", hp: 250, image: "🧊", armorClass: 17 },
    { name: "Snow Leopard", hp: 195, image: "🐆", armorClass: 16 },
    { name: "Ice Elemental", hp: 230, image: "❄️", armorClass: 16 },
    { name: "Frozen Mammoth", hp: 280, image: "🦣", armorClass: 17 }
  ],
  7: [ // Desert Ruins - AC 16-18 (ancient armor)
    { name: "Sand Crawler", hp: 320, image: "🦂", armorClass: 16 },
    { name: "Desert Sphinx", hp: 380, image: "🦅", armorClass: 17 },
    { name: "Mummy Warrior", hp: 350, image: "🧟", armorClass: 18 },
    { name: "Sand Elemental", hp: 340, image: "🌪️", armorClass: 16 },
    { name: "Ancient Guardian", hp: 400, image: "🗿", armorClass: 18 }
  ],
  8: [ // Mystic Grove - AC 15-17 (magical protection)
    { name: "Enchanted Deer", hp: 450, image: "🦌", armorClass: 15 },
    { name: "Magic Wisp", hp: 420, image: "✨", armorClass: 16 },
    { name: "Fairy Dragon", hp: 500, image: "🐉", armorClass: 17 },
    { name: "Mystic Owl", hp: 480, image: "🦉", armorClass: 16 },
    { name: "Elder Treant", hp: 550, image: "🌳", armorClass: 17 }
  ],
  9: [ // Sky Islands - AC 16-18 (agile, hard to hit)
    { name: "Wind Eagle", hp: 620, image: "🦅", armorClass: 17 },
    { name: "Cloud Sprite", hp: 580, image: "☁️", armorClass: 16 },
    { name: "Storm Elemental", hp: 680, image: "⚡", armorClass: 18 },
    { name: "Sky Serpent", hp: 650, image: "🐍", armorClass: 17 },
    { name: "Thunder Bird", hp: 720, image: "🦅", armorClass: 18 }
  ],
  10: [ // Demon Realm - AC 17-19 (demonic armor)
    { name: "Lesser Demon", hp: 800, image: "👹", armorClass: 17 },
    { name: "Hell Hound", hp: 850, image: "🐕", armorClass: 18 },
    { name: "Fire Demon", hp: 900, image: "😈", armorClass: 18 },
    { name: "Shadow Demon", hp: 950, image: "👿", armorClass: 19 },
    { name: "Demon Knight", hp: 1000, image: "⚔️", armorClass: 19 }
  ]
}

const bossesByZone: BossesByZone = {
  1: { 
    name: "Forest Guardian", 
    hp: 500, 
    image: "🌲", 
    description: "Ancient protector of the forest",
    armorClass: 12,
    vulnerabilities: ['fire', 'slashing'],
    resistances: ['piercing', 'poison']
  },
  2: { 
    name: "Shadow Wolf", 
    hp: 800, 
    image: "🐺", 
    description: "Alpha wolf corrupted by darkness",
    armorClass: 14,
    vulnerabilities: ['holy', 'radiant', 'fire'],
    resistances: ['void', 'necrotic']
  },
  3: { 
    name: "Stone Golem", 
    hp: 1200, 
    image: "🗿", 
    description: "Massive construct of living rock",
    armorClass: 16,
    resistances: ['slashing', 'piercing', 'poison'],
    vulnerabilities: ['bludgeoning', 'thunder'],
    immunities: ['psychic', 'poison']
  },
  4: { 
    name: "Crystal Spider", 
    hp: 1800, 
    image: "🕷️", 
    description: "Magnificent arachnid of pure crystal",
    armorClass: 17,
    resistances: ['fire', 'ice', 'piercing'],
    vulnerabilities: ['bludgeoning', 'thunder', 'force'],
    immunities: ['poison']
  },
  5: { 
    name: "Flame Titan", 
    hp: 2500, 
    image: "🔥", 
    description: "Colossal being of pure fire",
    armorClass: 18,
    immunities: ['fire', 'poison'],
    resistances: ['slashing', 'piercing', 'bludgeoning'],
    vulnerabilities: ['ice', 'force']
  },
  6: { 
    name: "Ice King", 
    hp: 3500, 
    image: "👑", 
    description: "Ruler of the frozen wasteland",
    armorClass: 19,
    immunities: ['ice', 'poison'],
    resistances: ['piercing', 'slashing'],
    vulnerabilities: ['fire', 'bludgeoning', 'thunder']
  },
  7: { 
    name: "Sand Wraith", 
    hp: 5000, 
    image: "👻", 
    description: "Ancient spirit of the desert",
    armorClass: 20,
    immunities: ['piercing', 'slashing', 'poison'],
    resistances: ['bludgeoning', 'necrotic'],
    vulnerabilities: ['magical', 'holy', 'radiant', 'force']
  },
  8: { 
    name: "Arcane Treant", 
    hp: 7000, 
    image: "🌳", 
    description: "Magical tree of immense power",
    armorClass: 21,
    resistances: ['magical', 'force', 'piercing'],
    vulnerabilities: ['fire', 'slashing', 'acid'],
    immunities: ['poison']
  },
  9: { 
    name: "Wind Drake", 
    hp: 10000, 
    image: "🐉", 
    description: "Legendary dragon of the skies",
    armorClass: 22,
    resistances: ['ice', 'fire', 'lightning'],
    vulnerabilities: ['piercing', 'force'],
    immunities: ['poison', 'thunder']
  },
  10: { 
    name: "Demon Lord", 
    hp: 15000, 
    image: "😈", 
    description: "Ultimate evil ruler of demons",
    armorClass: 23,
    immunities: ['fire', 'poison', 'necrotic'],
    resistances: ['slashing', 'piercing', 'bludgeoning', 'magical', 'lightning', 'ice'],
    vulnerabilities: ['holy', 'radiant', 'force']
  }
}

export function getRandomMonster(zone: number): Monster {
  const monsters = monstersByZone[zone]
  if (!monsters || monsters.length === 0) {
    throw new Error(`No monsters found for zone ${zone}`)
  }
  
  const baseMonster = monsters[Math.floor(Math.random() * monsters.length)]
  
  // 15% chance to have an affix (increased from 10%)
  const hasAffix = Math.random() < 0.15
  
  if (hasAffix && zone >= 2) { // Only add affixes from zone 2 onwards
    const availableAffixes = [...monsterAffixes]
    const selectedAffix = availableAffixes[Math.floor(Math.random() * availableAffixes.length)]
    
    return {
      ...baseMonster,
      affixes: [selectedAffix]
    }
  }
  
  return { ...baseMonster }
}

export function getBoss(zone: number): Boss {
  const boss = bossesByZone[zone]
  if (!boss) {
    throw new Error(`No boss found for zone ${zone}`)
  }
  return { ...boss }
}

export function applyAffixesToMonster(monster: Monster): Monster {
  if (!monster.affixes || monster.affixes.length === 0) {
    return monster
  }
  
  let modifiedMonster = { ...monster }
  
  for (const affix of monster.affixes) {
    // Apply HP multiplier
    if (affix.effects.hpMultiplier) {
      modifiedMonster.hp = Math.floor(modifiedMonster.hp * affix.effects.hpMultiplier)
    }
  }
  
  return modifiedMonster
}

export function calculateAffixRewards(monster: Monster, baseGold: number, baseMaterials: Record<string, number>): { gold: number; materials: Record<string, number> } {
  let gold = baseGold
  let materials = { ...baseMaterials }
  
  if (!monster.affixes) {
    return { gold, materials }
  }
  
  for (const affix of monster.affixes) {
    // Apply gold multiplier
    if (affix.effects.goldMultiplier) {
      gold = Math.floor(gold * affix.effects.goldMultiplier)
    }
    
    // Apply material bonuses
    if (affix.effects.materialBonus) {
      for (const [materialId, amount] of Object.entries(affix.effects.materialBonus)) {
        materials[materialId] = (materials[materialId] || 0) + amount
      }
    }
  }
  
  return { gold, materials }
}

export function shouldAutoAttackMiss(monster: Monster): boolean {
  if (!monster.affixes) {
    return false
  }
  
  for (const affix of monster.affixes) {
    if (affix.effects.missChance && Math.random() < affix.effects.missChance) {
      return true
    }
  }
  
  return false
}

export function getMonsterDisplayName(monster: Monster): string {
  if (!monster.affixes || monster.affixes.length === 0) {
    return monster.name
  }
  
  const affixNames = monster.affixes.map(affix => affix.name).join(', ')
  return `${affixNames} ${monster.name}`
}

export function getMonsterAffixIcons(monster: Monster): string {
  if (!monster.affixes || monster.affixes.length === 0) {
    return ''
  }
  
  return monster.affixes.map(affix => affix.icon).join('')
}

export function calculateMonsterHP(baseHP: number, zoneId: number): number {
  const zone = getZone(zoneId)
  return Math.ceil(baseHP * zone.difficulty)
}

export function calculateBossHP(baseHP: number, zoneId: number): number {
  const zone = getZone(zoneId)
  // Increased from 3x to 10x to match Clicker Heroes' boss difficulty
  // Bosses should be significantly harder and require strategic preparation
  return Math.ceil(baseHP * zone.difficulty * 10)
}

export function getMonsterImage(monsterName: string, zoneId: number): string {
  const monsters = monstersByZone[zoneId] || monstersByZone[1]
  const monster = monsters.find(m => m.name === monsterName)
  return monster ? monster.image : "👹"
}

export function getBossImage(zoneId: number): string {
  const boss = bossesByZone[zoneId]
  return boss ? boss.image : "👹"
}

// Calculate damage multiplier based on weapon type vs boss vulnerabilities/resistances/immunities
export function calculateWeaponEffectiveness(boss: Boss, weaponType?: WeaponType): { multiplier: number; message?: string } {
  if (!weaponType) {
    // No weapon type means regular physical damage (like slashing)
    weaponType = 'slashing'
  }

  // Check immunities first
  if (boss.immunities?.includes(weaponType)) {
    return { 
      multiplier: 0, 
      message: `${boss.name} is immune to ${weaponType} damage!` 
    }
  }

  // Check resistances
  if (boss.resistances?.includes(weaponType)) {
    return { 
      multiplier: 0.5, 
      message: `${boss.name} resists ${weaponType} damage (-50%)` 
    }
  }

  // Check vulnerabilities
  if (boss.vulnerabilities?.includes(weaponType)) {
    return { 
      multiplier: 1.5, 
      message: `${boss.name} is vulnerable to ${weaponType} damage! (+50%)` 
    }
  }

  // Normal damage
  return { multiplier: 1.0 }
}