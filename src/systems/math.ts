import { calculateModifier } from './statRolling'

export type Stats = { 
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

/**
 * D&D 5e Style Attack Roll System
 * Roll d20 + attack bonus vs target AC
 * Natural 20 always hits (and crits), Natural 1 always misses
 */

/**
 * Roll a d20 for attack rolls
 */
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

/**
 * Calculate player's attack bonus for physical attacks
 * In D&D, this is typically: Proficiency + STR/DEX modifier + Skill bonuses
 * We'll use: Character Level / 4 (proficiency) + STR modifier + Skill attack bonus
 */
export function calculateAttackBonus(
  stats: Stats, 
  level: number, 
  skillAttackBonus: number = 0,
  isRanged: boolean = false
): number {
  const proficiencyBonus = Math.floor(level / 4) + 1 // Starts at +1, increases every 4 levels
  const abilityModifier = isRanged ? calculateModifier(stats.dex) : calculateModifier(stats.str)
  return proficiencyBonus + abilityModifier + skillAttackBonus
}

/**
 * Make an attack roll against a target's AC
 * Returns: { hit: boolean, roll: number, total: number, isCrit: boolean, isNaturalMiss: boolean }
 */
export function makeAttackRoll(
  attackBonus: number, 
  targetAC: number
): { hit: boolean; roll: number; total: number; isCrit: boolean; isNaturalMiss: boolean } {
  const roll = rollD20()
  const total = roll + attackBonus
  
  // Natural 20 always hits and crits
  if (roll === 20) {
    return { hit: true, roll, total, isCrit: true, isNaturalMiss: false }
  }
  
  // Natural 1 always misses
  if (roll === 1) {
    return { hit: false, roll, total, isCrit: false, isNaturalMiss: true }
  }
  
  // Normal hit/miss based on AC
  const hit = total >= targetAC
  return { hit, roll, total, isCrit: false, isNaturalMiss: false }
}

/**
 * Calculate player's AC from stats, equipment, and skills
 * Base AC = 10 + DEX modifier + equipment AC bonuses + skill AC bonus
 */
export function calculatePlayerAC(stats: Stats, skillAcBonus: number = 0): number {
  const baseDexModifier = calculateModifier(stats.dex)
  const equipmentAC = (stats as any).armorClass || 0
  
  // Base AC 10 + DEX modifier + equipment + skill bonus
  // Note: Heavy armor in D&D doesn't add DEX, but we'll simplify and always add it
  return 10 + baseDexModifier + equipmentAC + skillAcBonus
}

// Monster HP calculation based on zone and boss status
export function monsterHP(zone: number, isBoss: boolean): number {
  const baseHP = zone <= 140 
    ? 10 * (zone - 1 + Math.pow(1.55, zone - 1))
    : 10 * (139 + Math.pow(1.55, 139) * Math.pow(1.145, zone - 140))
  
  return Math.ceil(baseHP * (isBoss ? 10 : 1))
}

// Gold reward calculation for killing monsters
export function goldPerKill(zone: number, isBoss: boolean): number {
  const baseGold = zone <= 140 
    ? Math.pow(1.6, zone) 
    : Math.pow(1.6, 140) * Math.pow(1.15, zone - 140)
  
  return Math.ceil(baseGold * (isBoss ? 10 : 1))
}

// Experience points required for a given level
export function xpForLevel(level: number): number { 
  // Balanced XP curve - 1.25 multiplier provides ~2.6x more XP to level 30, ~9x to level 60
  // This slows progression significantly without making it impossible
  return Math.ceil(50 * Math.pow(1.25, level - 1)) 
}

// Auto attacks per second based on buildings (Barracks) and dexterity - now uses D&D modifiers
export function computeAutoAPS(stats: Stats, buildingEffects?: any): number { 
  // Check if auto-clicker is enabled by buildings (Barracks)
  const autoClicker = buildingEffects?.autoClicker || 0
  if (autoClicker <= 0) return 0  // No auto-clicking without buildings
  
  // Base auto-attack speed from buildings
  let baseAPS = autoClicker
  
  // Bonus from dexterity modifier
  const dexMod = calculateModifier(stats.dex)
  if (dexMod > 0) {
    baseAPS += dexMod * 0.2 // Each +1 DEX modifier = +0.2 APS
  }
  
  // Equipment bonus
  const equipmentBonus = (stats as any).autoSpeed || 0
  const buildingSpeedBonus = buildingEffects?.autoSpeed || 0
  
  return baseAPS + equipmentBonus + buildingSpeedBonus
}

// Click damage calculation - now uses D&D style modifiers and skill bonuses
export function computeClickDamage(
  stats: Stats, 
  level?: number, 
  skillDamageBonus: number = 0
): number { 
  const playerLevel = level || 1
  
  // Base damage scales with level
  const baseDamage = 5 + (playerLevel * 2) // Much more reasonable starting point
  
  // Use D&D modifiers instead of raw stats
  // STR modifier directly adds to damage
  const strMod = calculateModifier(stats.str)
  
  // Equipment provides flat bonus damage
  const equipmentBonus = (stats as any).clickDamage || 0
  
  // Final damage = Base + (STR modifier × level scaling) + Equipment + Skill Bonus
  // Each +1 STR modifier = 2 extra damage per level
  const statBonus = strMod * (1 + playerLevel * 0.5)
  let totalDamage = baseDamage + statBonus + equipmentBonus + skillDamageBonus
  
  // Minimum damage of 1
  return Math.max(1, Math.floor(totalDamage))
}

// Auto attack damage with critical hit chance - now uses D&D modifiers and skill bonuses
export function computeAutoDamage(
  stats: Stats, 
  buildingEffects?: any, 
  level?: number,
  skillDamageBonus: number = 0
): number {
  const playerLevel = level || 1
  
  // Base damage scales with level (lower than click damage)
  const baseDamage = 3 + playerLevel
  
  // Use D&D modifiers
  // STR and INT both contribute to auto damage
  const strMod = calculateModifier(stats.str)
  const intMod = calculateModifier(stats.int)
  
  // Equipment and buildings provide flat bonus damage
  const equipmentBonus = (stats as any).autoDamage || 0
  const buildingBonus = buildingEffects?.autoDamage || 0
  
  // Final damage = Base + (stat modifiers × level scaling) + Equipment + Buildings + Skill Bonus
  const statBonus = (strMod + intMod) * (0.5 + playerLevel * 0.3)
  let totalDamage = baseDamage + statBonus + equipmentBonus + buildingBonus + skillDamageBonus
  
  // Minimum damage of 1
  return Math.max(1, Math.floor(totalDamage))
}

import { generateRandomEquipment } from '@/data/equipment'
import { getZone } from '@/data/zones'

// Generate random drops for defeated monsters
export function generateDrops(zone: number, isBoss: boolean) {
  const drops: Array<{
    id: string
    label: string
    mat?: string
    qty?: number
    gold?: number
    equipment?: any // Equipment object
    isEquipment?: boolean
  }> = []
  
  // Always drop gold
  const goldAmount = goldPerKill(zone, isBoss)
  drops.push({
    id: 'gold', // Use consistent ID for gold
    label: goldAmount + ' gold',
    gold: goldAmount
  })
  
  // Zone-specific material drops (much lower quantities and chance)
  const currentZone = getZone(zone)
  const zoneMaterials = currentZone.rewards.materials
  
  // Only drop materials if the zone has any available
  // DRASTICALLY REDUCED: 25% chance to drop materials (was 70%)
  // This forces players to use NPCs for material gathering
  if (zoneMaterials.length > 0 && Math.random() < 0.25) {
    // Pick a random material from this zone's available materials
    const materialType = zoneMaterials[Math.floor(Math.random() * zoneMaterials.length)]
    
    // Much smaller quantities - mostly 1, rarely 2
    let quantity = Math.random() < 0.9 ? 1 : 2
    
    // Bosses give slightly more (1-3) but still limited
    if (isBoss) {
      quantity = Math.random() < 0.5 ? 1 : Math.random() < 0.8 ? 2 : 3
    }
    
    drops.push({
      id: materialType,
      label: `${materialType} x${quantity}`,
      mat: materialType,
      qty: quantity
    })
  }
  
  // Equipment drops (much lower chance, higher for bosses)
  const equipmentChance = isBoss ? 0.25 : 0.02 // 25% for bosses, 2% for regular monsters
  const equipmentRoll = Math.random()
  
  if (equipmentRoll < equipmentChance) {
    const equipment = generateRandomEquipment(zone)
    if (equipment) {
      drops.push({
        id: equipment.id,
        label: equipment.name,
        equipment: equipment,
        isEquipment: true
      })
    }
  }
  
  return drops
}
