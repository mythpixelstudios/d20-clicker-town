export type EquipmentSlot = 'weapon' | 'helmet' | 'chest' | 'legs' | 'boots' | 'gloves' | 'ring_left' | 'ring_right'
export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type WeaponType = 'slashing' | 'piercing' | 'bludgeoning' | 'magical' | 'fire' | 'ice' | 'holy' | 'void' | 'lightning' | 'acid' | 'necrotic' | 'radiant' | 'psychic' | 'poison' | 'thunder' | 'force'

export interface EquipmentAffix {
  id: string
  name: string
  stats: Partial<EquipmentStats>
  tier: 'minor' | 'major'
}

export interface EquipmentStats {
  str?: number
  dex?: number
  con?: number
  int?: number
  wis?: number
  cha?: number
  clickDamage?: number
  autoDamage?: number
  autoSpeed?: number
  critChance?: number
  goldBonus?: number
  xpBonus?: number
  armorClass?: number // D&D style Armor Class (AC) - higher is better
}

export interface Equipment {
  id: string
  name: string
  slot: EquipmentSlot
  rarity: EquipmentRarity
  level: number
  stats: EquipmentStats
  affixes?: EquipmentAffix[]
  description?: string
  weaponType?: WeaponType // Only applicable for weapons
  craftingRecipe?: {
    materials: Record<string, number>
    gold: number
    requiredBlacksmithLevel: number
  }
}

// Rarity colors and drop chances (colorblind-friendly)
export const rarityInfo = {
  common: { 
    color: '#9ca3af', 
    dropChance: 0.7, 
    statMultiplier: 1, 
    glowIntensity: 0,
    pattern: 'solid', // For colorblind support
    icon: '●'
  },
  uncommon: { 
    color: '#22c55e', 
    dropChance: 0.2, 
    statMultiplier: 1.3, 
    glowIntensity: 0.3,
    pattern: 'dotted',
    icon: '◆'
  },
  rare: { 
    color: '#3b82f6', 
    dropChance: 0.07, 
    statMultiplier: 1.6, 
    glowIntensity: 0.5,
    pattern: 'dashed',
    icon: '★'
  },
  epic: { 
    color: '#a855f7', 
    dropChance: 0.025, 
    statMultiplier: 2, 
    glowIntensity: 0.7,
    pattern: 'double',
    icon: '◈'
  },
  legendary: { 
    color: '#f59e0b', 
    dropChance: 0.005, 
    statMultiplier: 2.5, 
    glowIntensity: 1,
    pattern: 'groove',
    icon: '✦'
  }
}

// Equipment affixes
export const equipmentAffixes: EquipmentAffix[] = [
  // Minor affixes
  { id: 'of_strength', name: 'of Strength', stats: { str: 2 }, tier: 'minor' },
  { id: 'of_dexterity', name: 'of Dexterity', stats: { dex: 2 }, tier: 'minor' },
  { id: 'of_constitution', name: 'of Constitution', stats: { con: 2 }, tier: 'minor' },
  { id: 'of_intelligence', name: 'of Intelligence', stats: { int: 2 }, tier: 'minor' },
  { id: 'of_wisdom', name: 'of Wisdom', stats: { wis: 2 }, tier: 'minor' },
  { id: 'of_precision', name: 'of Precision', stats: { critChance: 3 }, tier: 'minor' },
  { id: 'of_wealth', name: 'of Wealth', stats: { goldBonus: 0.15 }, tier: 'minor' },
  { id: 'of_learning', name: 'of Learning', stats: { xpBonus: 0.1 }, tier: 'minor' },
  { id: 'of_striking', name: 'of Striking', stats: { clickDamage: 8 }, tier: 'minor' },
  { id: 'of_automation', name: 'of Automation', stats: { autoDamage: 5 }, tier: 'minor' },
  
  // Major affixes (for epic+ items)
  { id: 'of_the_giant', name: 'of the Giant', stats: { str: 4, con: 3 }, tier: 'major' },
  { id: 'of_the_swift', name: 'of the Swift', stats: { dex: 4, autoSpeed: 0.2 }, tier: 'major' },
  { id: 'of_the_sage', name: 'of the Sage', stats: { int: 4, wis: 3 }, tier: 'major' },
  { id: 'of_devastation', name: 'of Devastation', stats: { clickDamage: 15, critChance: 5 }, tier: 'major' },
  { id: 'of_prosperity', name: 'of Prosperity', stats: { goldBonus: 0.3, xpBonus: 0.2 }, tier: 'major' }
]

// Base equipment templates
export const equipmentTemplates: Equipment[] = [
  // Weapons
  {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    slot: 'weapon',
    rarity: 'common',
    level: 1,
    stats: { str: 2, clickDamage: 5 },
    description: 'A worn blade that has seen better days',
    weaponType: 'slashing',
    craftingRecipe: {
      materials: { iron: 5, wood: 3 }, // INCREASED: Zone 1 & 3 materials
      gold: 50,
      requiredBlacksmithLevel: 1
    }
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    slot: 'weapon',
    rarity: 'uncommon',
    level: 3,
    stats: { str: 4, clickDamage: 12 },
    description: 'A sturdy iron blade forged with care',
    weaponType: 'slashing',
    craftingRecipe: {
      materials: { iron: 10, dark_essence: 5 }, // INCREASED: Zone 2 & 3 materials (dark_essence is NPC-only)
      gold: 150,
      requiredBlacksmithLevel: 3
    }
  },
  {
    id: 'steel_sword',
    name: 'Steel Sword',
    slot: 'weapon',
    rarity: 'rare',
    level: 6,
    stats: { str: 7, dex: 2, clickDamage: 25 },
    description: 'A refined steel blade with perfect balance',
    weaponType: 'slashing',
    craftingRecipe: {
      materials: { iron: 15, crystal: 10, stone: 8 }, // INCREASED: Zone 3 & 4 materials
      gold: 400,
      requiredBlacksmithLevel: 6
    }
  },
  {
    id: 'enchanted_blade',
    name: 'Enchanted Blade',
    slot: 'weapon',
    rarity: 'epic',
    level: 10,
    stats: { str: 12, int: 5, clickDamage: 50, critChance: 10 },
    description: 'A magical sword humming with arcane energy',
    weaponType: 'magical',
    craftingRecipe: {
      materials: { crystal: 20, magic_dust: 15, obsidian: 10 }, // INCREASED: Zone 4, 5, 8 materials
      gold: 1000,
      requiredBlacksmithLevel: 10
    }
  },
  {
    id: 'dragonbane',
    name: 'Dragonbane',
    slot: 'weapon',
    rarity: 'legendary',
    level: 15,
    stats: { str: 20, dex: 8, int: 6, clickDamage: 100, autoDamage: 30, critChance: 15 },
    description: 'Legendary weapon capable of slaying dragons',
    weaponType: 'slashing',
    craftingRecipe: {
      materials: { demon_core: 8, soul_crystal: 12, sky_metal: 20, fire_crystal: 15 }, // INCREASED: High-end zones (NPC materials)
      gold: 5000,
      requiredBlacksmithLevel: 15
    }
  },
  {
    id: 'war_hammer',
    name: 'War Hammer',
    slot: 'weapon',
    rarity: 'uncommon',
    level: 4,
    stats: { str: 6, clickDamage: 15 },
    description: 'A heavy hammer that crushes stone and bone',
    weaponType: 'bludgeoning',
    craftingRecipe: {
      materials: { iron: 20, stone: 15 }, // INCREASED
      gold: 180,
      requiredBlacksmithLevel: 4
    }
  },
  {
    id: 'fire_blade',
    name: 'Blade of Flames',
    slot: 'weapon',
    rarity: 'rare',
    level: 7,
    stats: { str: 8, int: 4, clickDamage: 30 },
    description: 'A sword wreathed in eternal flames',
    weaponType: 'fire',
    craftingRecipe: {
      materials: { fire_crystal: 25, obsidian: 15, iron: 10 }, // INCREASED
      gold: 500,
      requiredBlacksmithLevel: 7
    }
  },
  {
    id: 'frost_spear',
    name: 'Frost Spear',
    slot: 'weapon',
    rarity: 'rare',
    level: 8,
    stats: { dex: 8, int: 5, clickDamage: 28, autoDamage: 12 },
    description: 'A crystalline spear that freezes enemies on contact',
    weaponType: 'ice',
    craftingRecipe: {
      materials: { ice_crystal: 30, frozen_wood: 20, iron: 12 }, // INCREASED
      gold: 550,
      requiredBlacksmithLevel: 8
    }
  },
  {
    id: 'holy_mace',
    name: 'Holy Mace',
    slot: 'weapon',
    rarity: 'epic',
    level: 11,
    stats: { str: 10, wis: 8, int: 6, clickDamage: 45, autoDamage: 20 },
    description: 'Blessed weapon imbued with divine light',
    weaponType: 'holy',
    craftingRecipe: {
      materials: { magic_dust: 35, crystal: 25, enchanted_leaf: 20, mystic_wood: 12 }, // INCREASED (NPC materials)
      gold: 1200,
      requiredBlacksmithLevel: 11
    }
  },
  {
    id: 'void_dagger',
    name: 'Void Dagger',
    slot: 'weapon',
    rarity: 'legendary',
    level: 16,
    stats: { dex: 15, int: 12, clickDamage: 80, critChance: 25 },
    description: 'A dagger forged from the essence of the void itself',
    weaponType: 'void',
    craftingRecipe: {
      materials: { void_essence: 12, demon_core: 10, soul_crystal: 15, reality_shard: 8 }, // INCREASED (All NPC materials)
      gold: 6000,
      requiredBlacksmithLevel: 16
    }
  },
  {
    id: 'piercing_rapier',
    name: 'Piercing Rapier',
    slot: 'weapon',
    rarity: 'rare',
    level: 5,
    stats: { dex: 9, clickDamage: 22, critChance: 8 },
    description: 'A thin, sharp blade designed for precise strikes',
    weaponType: 'piercing',
    craftingRecipe: {
      materials: { iron: 15, crystal: 8, fiber: 10 }, // INCREASED
      gold: 350,
      requiredBlacksmithLevel: 5
    }
  },
  {
    id: 'lightning_javelin',
    name: 'Javelin of Lightning',
    slot: 'weapon',
    rarity: 'epic',
    level: 9,
    stats: { dex: 10, int: 8, clickDamage: 42, critChance: 12 },
    description: 'A spear that crackles with electrical energy',
    weaponType: 'lightning',
    craftingRecipe: {
      materials: { iron: 20, wind_crystal: 15, magic_dust: 12 },
      gold: 900,
      requiredBlacksmithLevel: 9
    }
  },
  {
    id: 'acid_vial_thrower',
    name: 'Alchemical Acid Sprayer',
    slot: 'weapon',
    rarity: 'rare',
    level: 7,
    stats: { int: 9, dex: 6, clickDamage: 28, autoDamage: 14 },
    description: 'A device that sprays corrosive acid',
    weaponType: 'acid',
    craftingRecipe: {
      materials: { iron: 12, crystal: 10, sulfur: 15 },
      gold: 550,
      requiredBlacksmithLevel: 7
    }
  },
  {
    id: 'necrotic_scythe',
    name: 'Reaper\'s Scythe',
    slot: 'weapon',
    rarity: 'legendary',
    level: 14,
    stats: { str: 16, int: 10, clickDamage: 85, autoDamage: 35, critChance: 18 },
    description: 'A curved blade that drains life force',
    weaponType: 'necrotic',
    craftingRecipe: {
      materials: { dark_essence: 25, void_essence: 15, soul_crystal: 20, iron: 15 },
      gold: 4500,
      requiredBlacksmithLevel: 14
    }
  },
  {
    id: 'radiant_sword',
    name: 'Sword of Dawn',
    slot: 'weapon',
    rarity: 'epic',
    level: 12,
    stats: { str: 12, wis: 10, int: 8, clickDamage: 55, autoDamage: 25 },
    description: 'A blade of pure radiant light',
    weaponType: 'radiant',
    craftingRecipe: {
      materials: { crystal: 30, magic_dust: 20, enchanted_leaf: 15 },
      gold: 2200,
      requiredBlacksmithLevel: 12
    }
  },
  {
    id: 'psychic_blade',
    name: 'Mind Blade',
    slot: 'weapon',
    rarity: 'rare',
    level: 8,
    stats: { int: 12, wis: 8, clickDamage: 32, critChance: 10 },
    description: 'A weapon forged from pure thought',
    weaponType: 'psychic',
    craftingRecipe: {
      materials: { crystal: 20, magic_dust: 15, gemstone: 5 },
      gold: 700,
      requiredBlacksmithLevel: 8
    }
  },
  {
    id: 'poison_dagger',
    name: 'Venomfang Dagger',
    slot: 'weapon',
    rarity: 'uncommon',
    level: 4,
    stats: { dex: 7, clickDamage: 16, autoDamage: 8 },
    description: 'Coated with deadly toxins',
    weaponType: 'poison',
    craftingRecipe: {
      materials: { iron: 10, fiber: 8, sulfur: 5 },
      gold: 180,
      requiredBlacksmithLevel: 4
    }
  },
  {
    id: 'thunder_hammer',
    name: 'Thunderstrike Maul',
    slot: 'weapon',
    rarity: 'epic',
    level: 13,
    stats: { str: 16, con: 8, clickDamage: 65, autoDamage: 28 },
    description: 'Each strike booms like thunder',
    weaponType: 'thunder',
    craftingRecipe: {
      materials: { iron: 25, wind_crystal: 20, stone: 15, magic_dust: 12 },
      gold: 2800,
      requiredBlacksmithLevel: 13
    }
  },
  {
    id: 'force_staff',
    name: 'Staff of Power',
    slot: 'weapon',
    rarity: 'legendary',
    level: 17,
    stats: { int: 22, wis: 15, clickDamage: 95, autoDamage: 45, critChance: 20 },
    description: 'Channels pure magical force',
    weaponType: 'force',
    craftingRecipe: {
      materials: { mystic_wood: 30, crystal: 40, magic_dust: 35, reality_shard: 10 },
      gold: 7500,
      requiredBlacksmithLevel: 17
    }
  },

  // Helmets
  {
    id: 'leather_cap',
    name: 'Leather Cap',
    slot: 'helmet',
    rarity: 'common',
    level: 1,
    stats: { con: 2, dex: 1 },
    description: 'Simple leather headgear for basic protection',
    craftingRecipe: {
      materials: { leather: 5, fiber: 3 },
      gold: 30,
      requiredBlacksmithLevel: 1
    }
  },
  {
    id: 'iron_helmet',
    name: 'Iron Helmet',
    slot: 'helmet',
    rarity: 'uncommon',
    level: 4,
    stats: { con: 5, str: 2 },
    description: 'Sturdy iron protection for the head',
    craftingRecipe: {
      materials: { iron: 10, leather: 4, copper: 3 },
      gold: 100,
      requiredBlacksmithLevel: 3
    }
  },
  {
    id: 'mithril_helmet',
    name: 'Mithril Helmet',
    slot: 'helmet',
    rarity: 'rare',
    level: 8,
    stats: { con: 8, dex: 4, str: 3 },
    description: 'Lightweight but incredibly strong',
    craftingRecipe: {
      materials: { mithril_ore: 8, silver: 5, leather: 3 },
      gold: 800,
      requiredBlacksmithLevel: 7
    }
  },
  {
    id: 'crystal_crown',
    name: 'Crystal Crown',
    slot: 'helmet',
    rarity: 'epic',
    level: 12,
    stats: { int: 10, wis: 8, critChance: 8, xpBonus: 0.2 },
    description: 'A magnificent crown radiating magical power',
    craftingRecipe: {
      materials: { crystal: 25, gemstone: 8, moonstone: 5, magic_dust: 15 },
      gold: 2000,
      requiredBlacksmithLevel: 12
    }
  },
  {
    id: 'adamantine_helm',
    name: 'Adamantine Helm',
    slot: 'helmet',
    rarity: 'legendary',
    level: 16,
    stats: { con: 18, str: 10, dex: 6, critChance: 10 },
    description: 'Forged from the hardest metal known',
    craftingRecipe: {
      materials: { adamantine_ore: 10, dragon_scale: 5, platinum: 8 },
      gold: 6000,
      requiredBlacksmithLevel: 15
    }
  },

  // Chest Armor
  {
    id: 'leather_vest',
    name: 'Leather Vest',
    slot: 'chest',
    rarity: 'common',
    level: 1,
    stats: { con: 3, dex: 2, armorClass: 1 },
    description: 'Basic leather protection for the torso',
    craftingRecipe: {
      materials: { leather: 8, fiber: 5 },
      gold: 40,
      requiredBlacksmithLevel: 1
    }
  },
  {
    id: 'chainmail',
    name: 'Chainmail',
    slot: 'chest',
    rarity: 'uncommon',
    level: 5,
    stats: { con: 8, str: 3, armorClass: 2 },
    description: 'Interlocked metal rings providing solid defense',
    craftingRecipe: {
      materials: { iron: 20, leather: 6, copper: 4 },
      gold: 200,
      requiredBlacksmithLevel: 4
    }
  },
  {
    id: 'plate_armor',
    name: 'Plate Armor',
    slot: 'chest',
    rarity: 'rare',
    level: 8,
    stats: { con: 15, str: 5, autoDamage: 10, armorClass: 3 },
    description: 'Heavy plate armor offering maximum protection',
    craftingRecipe: {
      materials: { iron: 25, steel: 10, leather: 6 },
      gold: 600,
      requiredBlacksmithLevel: 8
    }
  },
  {
    id: 'mithril_chain',
    name: 'Mithril Chainmail',
    slot: 'chest',
    rarity: 'epic',
    level: 11,
    stats: { con: 20, dex: 8, str: 6, autoDamage: 18, armorClass: 4 },
    description: 'Lightweight chainmail of mythical strength',
    craftingRecipe: {
      materials: { mithril_ore: 15, silver: 10, leather: 8 },
      gold: 1800,
      requiredBlacksmithLevel: 10
    }
  },
  {
    id: 'dragonscale_armor',
    name: 'Dragonscale Armor',
    slot: 'chest',
    rarity: 'legendary',
    level: 15,
    stats: { con: 25, str: 12, dex: 10, autoDamage: 30, critChance: 8, armorClass: 6 },
    description: 'Crafted from the scales of ancient dragons',
    craftingRecipe: {
      materials: { dragon_scale: 20, adamantine_ore: 12, platinum: 10, fire_crystal: 8 },
      gold: 7000,
      requiredBlacksmithLevel: 14
    }
  },

  // Legs
  {
    id: 'cloth_pants',
    name: 'Cloth Pants',
    slot: 'legs',
    rarity: 'common',
    level: 1,
    stats: { dex: 2, wis: 1 },
    description: 'Simple cloth leg coverings',
    craftingRecipe: {
      materials: { fiber: 5 },
      gold: 25,
      requiredBlacksmithLevel: 1
    }
  },
  {
    id: 'leather_pants',
    name: 'Leather Pants',
    slot: 'legs',
    rarity: 'uncommon',
    level: 3,
    stats: { dex: 4, con: 3 },
    description: 'Flexible leather leg protection',
    craftingRecipe: {
      materials: { fiber: 8, iron: 2 },
      gold: 80,
      requiredBlacksmithLevel: 2
    }
  },

  // Boots
  {
    id: 'leather_boots',
    name: 'Leather Boots',
    slot: 'boots',
    rarity: 'common',
    level: 1,
    stats: { dex: 3, autoSpeed: 0.1 },
    description: 'Comfortable leather footwear',
    craftingRecipe: {
      materials: { fiber: 4, wood: 1 },
      gold: 35,
      requiredBlacksmithLevel: 1
    }
  },
  {
    id: 'iron_boots',
    name: 'Iron Boots',
    slot: 'boots',
    rarity: 'uncommon',
    level: 4,
    stats: { dex: 5, con: 3, autoSpeed: 0.2 },
    description: 'Heavy iron boots with reinforced soles',
    craftingRecipe: {
      materials: { iron: 6, fiber: 3 },
      gold: 120,
      requiredBlacksmithLevel: 3
    }
  },

  // Gloves
  {
    id: 'cloth_gloves',
    name: 'Cloth Gloves',
    slot: 'gloves',
    rarity: 'common',
    level: 1,
    stats: { dex: 2, wis: 1 },
    description: 'Simple cloth hand coverings',
    craftingRecipe: {
      materials: { fiber: 3 },
      gold: 20,
      requiredBlacksmithLevel: 1
    }
  },
  {
    id: 'iron_gauntlets',
    name: 'Iron Gauntlets',
    slot: 'gloves',
    rarity: 'rare',
    level: 6,
    stats: { str: 6, dex: 4, clickDamage: 15 },
    description: 'Heavy iron gauntlets that enhance striking power',
    craftingRecipe: {
      materials: { iron: 10, crystal: 2, fiber: 4 },
      gold: 300,
      requiredBlacksmithLevel: 6
    }
  },

  // Rings - D&D Inspired Magic Rings
  {
    id: 'ring_of_protection',
    name: 'Ring of Protection',
    slot: 'ring_left',
    rarity: 'uncommon',
    level: 3,
    stats: { con: 3, dex: 2 },
    description: 'A simple band that wards off danger',
    craftingRecipe: {
      materials: { iron: 5, crystal: 3 },
      gold: 100,
      requiredBlacksmithLevel: 2
    }
  },
  {
    id: 'ring_of_strength',
    name: 'Ring of Ogre Power',
    slot: 'ring_left',
    rarity: 'rare',
    level: 6,
    stats: { str: 8, clickDamage: 10 },
    description: 'Grants the strength of an ogre to its wearer',
    craftingRecipe: {
      materials: { iron: 15, stone: 10, crystal: 5 },
      gold: 400,
      requiredBlacksmithLevel: 5
    }
  },
  {
    id: 'ring_of_regeneration',
    name: 'Ring of Regeneration',
    slot: 'ring_right',
    rarity: 'epic',
    level: 10,
    stats: { con: 12, wis: 6, xpBonus: 0.15 },
    description: 'Slowly heals wounds and hastens recovery',
    craftingRecipe: {
      materials: { crystal: 25, magic_dust: 15, fiber: 10 },
      gold: 1500,
      requiredBlacksmithLevel: 9
    }
  },
  {
    id: 'ring_of_invisibility',
    name: 'Ring of Invisibility',
    slot: 'ring_right',
    rarity: 'legendary',
    level: 15,
    stats: { dex: 18, critChance: 20, autoSpeed: 0.3 },
    description: 'Makes the wearer nearly impossible to detect',
    craftingRecipe: {
      materials: { crystal: 40, void_essence: 15, magic_dust: 25 },
      gold: 5000,
      requiredBlacksmithLevel: 14
    }
  },
  {
    id: 'ring_of_spell_storing',
    name: 'Ring of Spell Storing',
    slot: 'ring_left',
    rarity: 'rare',
    level: 7,
    stats: { int: 10, wis: 6, autoDamage: 15 },
    description: 'Contains stored magical energy',
    craftingRecipe: {
      materials: { crystal: 20, magic_dust: 12, iron: 8 },
      gold: 600,
      requiredBlacksmithLevel: 6
    }
  },
  {
    id: 'ring_of_free_action',
    name: 'Ring of Free Action',
    slot: 'ring_right',
    rarity: 'rare',
    level: 8,
    stats: { dex: 9, autoSpeed: 0.25, clickDamage: 12 },
    description: 'Allows unrestricted movement',
    craftingRecipe: {
      materials: { iron: 12, crystal: 15, wind_crystal: 10 },
      gold: 700,
      requiredBlacksmithLevel: 7
    }
  },
  {
    id: 'ring_of_fire_resistance',
    name: 'Ring of Fire Resistance',
    slot: 'ring_left',
    rarity: 'uncommon',
    level: 5,
    stats: { con: 5, wis: 3 },
    description: 'Provides protection against flames',
    craftingRecipe: {
      materials: { fire_crystal: 10, iron: 8, obsidian: 5 },
      gold: 250,
      requiredBlacksmithLevel: 4
    }
  },
  {
    id: 'ring_of_ice_resistance',
    name: 'Ring of Cold Resistance',
    slot: 'ring_left',
    rarity: 'uncommon',
    level: 6,
    stats: { con: 5, dex: 3 },
    description: 'Shields against freezing temperatures',
    craftingRecipe: {
      materials: { ice_crystal: 10, iron: 8, frozen_wood: 5 },
      gold: 280,
      requiredBlacksmithLevel: 5
    }
  },
  {
    id: 'ring_of_telekinesis',
    name: 'Ring of Telekinesis',
    slot: 'ring_right',
    rarity: 'epic',
    level: 12,
    stats: { int: 14, wis: 8, autoDamage: 25, autoSpeed: 0.2 },
    description: 'Allows manipulation of objects with the mind',
    craftingRecipe: {
      materials: { crystal: 30, magic_dust: 20, wind_crystal: 15 },
      gold: 2000,
      requiredBlacksmithLevel: 11
    }
  },
  {
    id: 'ring_of_shooting_stars',
    name: 'Ring of Shooting Stars',
    slot: 'ring_right',
    rarity: 'legendary',
    level: 16,
    stats: { int: 20, wis: 12, clickDamage: 60, autoDamage: 40, critChance: 15 },
    description: 'Contains the power of falling stars',
    craftingRecipe: {
      materials: { crystal: 50, sky_metal: 25, magic_dust: 30, wind_crystal: 20 },
      gold: 8000,
      requiredBlacksmithLevel: 15
    }
  },
  {
    id: 'ring_of_wealth',
    name: 'Ring of Three Wishes',
    slot: 'ring_left',
    rarity: 'epic',
    level: 11,
    stats: { wis: 10, goldBonus: 0.4, xpBonus: 0.2 },
    description: 'Brings fortune to its bearer',
    craftingRecipe: {
      materials: { crystal: 25, gemstone: 10, magic_dust: 15 },
      gold: 1800,
      requiredBlacksmithLevel: 10
    }
  },
  {
    id: 'ring_of_mind_shielding',
    name: 'Ring of Mind Shielding',
    slot: 'ring_right',
    rarity: 'rare',
    level: 9,
    stats: { wis: 12, int: 8, critChance: 10 },
    description: 'Protects the mind from intrusion',
    craftingRecipe: {
      materials: { crystal: 18, magic_dust: 12, stone: 10 },
      gold: 900,
      requiredBlacksmithLevel: 8
    }
  }
]

// Helper functions
export function getEquipmentById(id: string): Equipment | undefined {
  return equipmentTemplates.find(eq => eq.id === id)
}

export function getEquipmentBySlot(slot: EquipmentSlot): Equipment[] {
  return equipmentTemplates.filter(eq => eq.slot === slot)
}

export function getEquipmentByRarity(rarity: EquipmentRarity): Equipment[] {
  return equipmentTemplates.filter(eq => eq.rarity === rarity)
}

export function generateRandomEquipment(zone: number, forceRarity?: EquipmentRarity): Equipment | null {
  // Higher zones have better drop chances
  const rarityRoll = Math.random()
  let selectedRarity: EquipmentRarity = forceRarity || 'common'
  
  if (!forceRarity) {
    const zoneBonus = Math.min(zone * 0.02, 0.3) // Up to 30% bonus at zone 15
    
    if (rarityRoll < rarityInfo.legendary.dropChance + zoneBonus * 0.1) {
      selectedRarity = 'legendary'
    } else if (rarityRoll < rarityInfo.epic.dropChance + zoneBonus * 0.2) {
      selectedRarity = 'epic'
    } else if (rarityRoll < rarityInfo.rare.dropChance + zoneBonus * 0.4) {
      selectedRarity = 'rare'
    } else if (rarityRoll < rarityInfo.uncommon.dropChance + zoneBonus * 0.6) {
      selectedRarity = 'uncommon'
    }
  }
  
  const availableEquipment = equipmentTemplates.filter(eq => 
    eq.rarity === selectedRarity && eq.level <= zone + 2
  )
  
  if (availableEquipment.length === 0) return null
  
  const template = availableEquipment[Math.floor(Math.random() * availableEquipment.length)]
  
  // Create a copy with slight stat variations for dropped items
  const statVariation = 0.2 // 20% variation
  const variatedStats: EquipmentStats = {}
  
  for (const [stat, value] of Object.entries(template.stats)) {
    if (typeof value === 'number') {
      const variation = 1 + (Math.random() - 0.5) * statVariation
      variatedStats[stat as keyof EquipmentStats] = Math.max(1, Math.round(value * variation))
    }
  }
  
  // Generate affixes for rare+ items
  const affixes: EquipmentAffix[] = []
  
  if (selectedRarity === 'rare' && Math.random() < 0.5) {
    // 50% chance for 1 minor affix
    const availableMinorAffixes = equipmentAffixes.filter(affix => affix.tier === 'minor')
    const selectedAffix = availableMinorAffixes[Math.floor(Math.random() * availableMinorAffixes.length)]
    affixes.push(selectedAffix)
  } else if (selectedRarity === 'epic') {
    // Always 1 minor affix, 30% chance for 1 major affix
    const availableMinorAffixes = equipmentAffixes.filter(affix => affix.tier === 'minor')
    const selectedMinorAffix = availableMinorAffixes[Math.floor(Math.random() * availableMinorAffixes.length)]
    affixes.push(selectedMinorAffix)
    
    if (Math.random() < 0.3) {
      const availableMajorAffixes = equipmentAffixes.filter(affix => affix.tier === 'major')
      const selectedMajorAffix = availableMajorAffixes[Math.floor(Math.random() * availableMajorAffixes.length)]
      affixes.push(selectedMajorAffix)
    }
  } else if (selectedRarity === 'legendary') {
    // Always 1-2 minor affixes and 1 major affix
    const availableMinorAffixes = equipmentAffixes.filter(affix => affix.tier === 'minor').slice()
    const availableMajorAffixes = equipmentAffixes.filter(affix => affix.tier === 'major')
    
    // Add 1-2 minor affixes
    const numMinorAffixes = Math.random() < 0.7 ? 2 : 1
    for (let i = 0; i < numMinorAffixes && availableMinorAffixes.length > 0; i++) {
      const index = Math.floor(Math.random() * availableMinorAffixes.length)
      affixes.push(availableMinorAffixes.splice(index, 1)[0])
    }
    
    // Add 1 major affix
    const selectedMajorAffix = availableMajorAffixes[Math.floor(Math.random() * availableMajorAffixes.length)]
    affixes.push(selectedMajorAffix)
  }
  
  // Apply affix stats to the base stats
  const finalStats = { ...variatedStats }
  for (const affix of affixes) {
    for (const [stat, value] of Object.entries(affix.stats)) {
      if (typeof value === 'number') {
        finalStats[stat as keyof EquipmentStats] = (finalStats[stat as keyof EquipmentStats] || 0) + value
      }
    }
  }
  
  // Generate name with affixes
  const affixSuffix = affixes.length > 0 ? ` ${affixes[affixes.length - 1].name}` : ''
  const finalName = `${template.name}${affixSuffix}`
  
  return {
    ...template,
    id: `${template.id}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, // Unique ID for drops
    name: finalName,
    stats: finalStats,
    affixes: affixes.length > 0 ? affixes : undefined
  }
}

export function canCraftEquipment(equipment: Equipment, materials: Record<string, number>, gold: number, blacksmithLevel: number): boolean {
  if (!equipment.craftingRecipe) return false
  
  const recipe = equipment.craftingRecipe
  
  // Check blacksmith level
  if (blacksmithLevel < recipe.requiredBlacksmithLevel) return false
  
  // Check gold
  if (gold < recipe.gold) return false
  
  // Check materials
  for (const [material, required] of Object.entries(recipe.materials)) {
    if ((materials[material] || 0) < required) return false
  }
  
  return true
}