import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { xpForLevel } from '@/systems/math'
import { calculateBuildingEffects } from '@/data/buildings'
import { useTown } from './townStore'
import type { Equipment, EquipmentSlot, EquipmentStats } from '@/data/equipment'
import { logLevelUp } from './logStore'
import { calculateModifier } from '@/systems/statRolling'

export type Stats = {  // Export Stats type
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export type CombatSkills = {  // Export CombatSkills type
  // Weapon Skills
  swordsmanship: number    // Bonus with sword weapons
  axemastery: number       // Bonus with axe weapons
  archery: number          // Bonus with ranged weapons
  unarmed: number          // Bonus when no weapon equipped
  
  // Combat Skills
  heavyArmor: number       // AC bonus with heavy armor, reduces dex penalty
  lightArmor: number       // AC bonus with light armor
  dodge: number            // Increases AC, helps avoid attacks
  toughness: number        // Increases max HP
  
  // Offensive Skills
  criticalStrike: number   // Increases critical hit chance
  powerAttack: number      // Increases damage output
  quickDraw: number        // Increases attack speed
  
  // Knowledge Skills
  monsterLore: number      // Bonus damage vs all monsters
  beastMastery: number     // Bonus vs beast-type monsters
  alchemy: number          // Improves potion effectiveness
  
  // Utility Skills
  athletics: number        // Improves overall physical performance
  perception: number       // Better loot drops, find weaknesses
}

type Skills = {
  crafting: {
    level: number
    xp: number
  }
  combat: CombatSkills
}

type EquippedItems = {
  weapon?: Equipment
  helmet?: Equipment
  chest?: Equipment
  legs?: Equipment
  boots?: Equipment
  gloves?: Equipment
  ring_left?: Equipment
  ring_right?: Equipment
}

type CharacterState = { 
  name: string
  level: number
  xp: number
  skillPoints: number  // Changed from statPoints
  stats: Stats
  skills: Skills
  equipped: EquippedItems
  getTotalStats: () => Stats & EquipmentStats
  getStatModifiers: () => Record<keyof Stats, number>
  getSkillBonuses: () => {
    attackBonus: number
    damageBonus: number
    acBonus: number
    critChance: number
    attackSpeed: number
    goldBonus: number
  }
  addXP: (amount: number) => void
  addCraftingXP: (amount: number) => void
  addSkillPoint: (skillKey: keyof CombatSkills) => void  // Changed from addStat
  equipItem: (equipment: Equipment) => Equipment | null
  unequipItem: (slot: EquipmentSlot) => Equipment | null
  setName: (name: string) => void
  setRolledStats: (stats: Stats) => void
  resetForPrestige: (prestigeLevel: number) => void
}

export const useChar = create<CharacterState>()(persist((set, get) => ({
  name: localStorage.getItem('player-name') || 'Adventurer',
  level: 1, 
  xp: 0, 
  skillPoints: 5,  // Changed from statPoints
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }, // Base 10 for all stats (D&D standard)
  skills: {
    crafting: { level: 1, xp: 0 },
    combat: {
      // Weapon Skills
      swordsmanship: 0,
      axemastery: 0,
      archery: 0,
      unarmed: 0,
      // Combat Skills
      heavyArmor: 0,
      lightArmor: 0,
      dodge: 0,
      toughness: 0,
      // Offensive Skills
      criticalStrike: 0,
      powerAttack: 0,
      quickDraw: 0,
      // Knowledge Skills
      monsterLore: 0,
      beastMastery: 0,
      alchemy: 0,
      // Utility Skills
      athletics: 0,
      perception: 0
    }
  },
  equipped: {},

  getTotalStats: () => {
    const { stats, equipped } = get()
    const totalStats = { ...stats, clickDamage: 0, autoDamage: 0, autoSpeed: 0, autoClicker: 0, critChance: 0, goldBonus: 0, xpBonus: 0 }
    
    // Add equipment bonuses
    for (const equipment of Object.values(equipped)) {
      if (equipment) {
        for (const [stat, value] of Object.entries(equipment.stats)) {
          if (typeof value === 'number') {
            const currentValue = totalStats[stat as keyof typeof totalStats] || 0
            totalStats[stat as keyof typeof totalStats] = currentValue + value
          }
        }
      }
    }
    
    // Add building bonuses
    try {
      const townBuildings = useTown.getState().buildings
      const buildingEffects = calculateBuildingEffects(townBuildings)
      
      // Add building effects to total stats
      totalStats.xpBonus = (totalStats.xpBonus || 0) + (buildingEffects.xpBonus || 0)
      totalStats.goldBonus = (totalStats.goldBonus || 0) + (buildingEffects.goldBonus || 0)
      totalStats.clickDamage = (totalStats.clickDamage || 0) + (buildingEffects.clickDamage || 0)
      totalStats.autoDamage = (totalStats.autoDamage || 0) + (buildingEffects.autoDamage || 0)
      totalStats.autoSpeed = (totalStats.autoSpeed || 0) + (buildingEffects.autoSpeed || 0)
      totalStats.autoClicker = (totalStats.autoClicker || 0) + (buildingEffects.autoClicker || 0)
      totalStats.critChance = (totalStats.critChance || 0) + (buildingEffects.critChance || 0)
    } catch {
      // Ignore errors when town store is not available (during initialization)
    }
    
    // Meta upgrades will be applied in a separate computed function
    // to avoid circular dependency issues during store initialization
    
    return totalStats
  },

  getStatModifiers: () => {
    const totalStats = get().getTotalStats()
    return {
      str: calculateModifier(totalStats.str),
      dex: calculateModifier(totalStats.dex),
      con: calculateModifier(totalStats.con),
      int: calculateModifier(totalStats.int),
      wis: calculateModifier(totalStats.wis),
      cha: calculateModifier(totalStats.cha)
    }
  },

  getSkillBonuses: () => {
    const { skills, equipped } = get()
    const combat = skills.combat
    const weapon = equipped.weapon
    
    // Calculate bonuses based on skills
    let attackBonus = 0
    let damageBonus = 0
    let acBonus = 0
    let critChance = 0
    let attackSpeed = 0
    let goldBonus = 0
    
    // Weapon-specific bonuses (fractional for balance)
    if (weapon?.weaponType) {
      if (weapon.weaponType === 'slashing' && combat.swordsmanship > 0) {
        attackBonus += combat.swordsmanship * 0.5  // +0.5 per rank
        damageBonus += combat.swordsmanship * 0.25  // +0.25 damage per rank
      }
      // Add more weapon type checks as needed
    } else if (!weapon) {
      // Unarmed combat
      attackBonus += combat.unarmed * 0.5
      damageBonus += combat.unarmed * 0.3
    }
    
    // Dodge skill improves AC (fractional)
    acBonus += combat.dodge * 0.5  // +0.5 AC per rank
    
    // Critical Strike skill (fractional)
    critChance += combat.criticalStrike * 0.5  // +0.5% per rank
    
    // Power Attack increases damage (fractional)
    damageBonus += combat.powerAttack * 0.3  // +0.3 damage per rank
    
    // Quick Draw increases attack speed (fractional)
    attackSpeed += combat.quickDraw * 0.1  // +0.1 APS per rank
    
    // Monster Lore increases all damage (fractional)
    damageBonus += combat.monsterLore * 0.2  // +0.2 damage per rank
    
    // Perception improves loot (fractional)
    goldBonus += combat.perception * 0.02  // +2% per rank
    
    return {
      attackBonus: Math.floor(attackBonus * 10) / 10,  // Round to 1 decimal
      damageBonus: Math.floor(damageBonus * 10) / 10,
      acBonus: Math.floor(acBonus * 10) / 10,
      critChance: Math.floor(critChance * 10) / 10,
      attackSpeed: Math.floor(attackSpeed * 10) / 10,
      goldBonus: Math.floor(goldBonus * 100) / 100  // Round to 2 decimals for percentage
    }
  },

  addXP: (amount) => {
    let { xp, level, skillPoints } = get()  // Changed from statPoints
    const totalStats = get().getTotalStats()
    const xpMultiplier = 1 + (totalStats.xpBonus || 0)
    xp += Math.floor(amount * xpMultiplier)
    
    let levelsGained = 0
    let skillPointsGained = 0  // Changed from statPointsGained
    
    while (xp >= xpForLevel(level)) {
      xp -= xpForLevel(level)
      level++
      levelsGained++
      
      // D&D-style: Skill points every 2 levels (more frequent than ASI)
      // This encourages specialization and gradual growth
      if (level % 2 === 0) {
        skillPointsGained += 1  // 1 skill point every 2 levels
      }
    }
    
    // Log level ups
    if (levelsGained > 0) {
      logLevelUp(level, skillPointsGained)  // Changed from statPointsGained
    }
    
    set({ xp, level, skillPoints: skillPoints + skillPointsGained })  // Changed from statPoints
  },

  addCraftingXP: (amount) => {
    const { skills } = get()
    let { level: craftingLevel, xp: craftingXP } = skills.crafting
    craftingXP += amount
    
    // Crafting XP requirement: 100 * level
    const xpNeeded = 100 * craftingLevel
    while (craftingXP >= xpNeeded) {
      craftingXP -= xpNeeded
      craftingLevel++
    }
    
    set({ 
      skills: { 
        ...skills, 
        crafting: { level: craftingLevel, xp: craftingXP },
        combat: skills.combat  // Preserve combat skills
      } 
    })
  },

  addSkillPoint: (skillKey) => {  // Changed from addStat
    const state = get()
    if (state.skillPoints <= 0) return
    
    set({
      skills: {
        ...state.skills,
        combat: {
          ...state.skills.combat,
          [skillKey]: state.skills.combat[skillKey] + 1
        }
      },
      skillPoints: state.skillPoints - 1
    })
  },

  equipItem: (equipment) => {
    const state = get()
    const currentEquipped = state.equipped[equipment.slot]
    
    set({
      equipped: {
        ...state.equipped,
        [equipment.slot]: equipment
      }
    })
    
    return currentEquipped || null
  },

  unequipItem: (slot) => {
    const state = get()
    const currentEquipped = state.equipped[slot]
    
    if (currentEquipped) {
      const newEquipped = { ...state.equipped }
      delete newEquipped[slot]
      set({ equipped: newEquipped })
    }
    
    return currentEquipped || null
  },

  setName: (name) => {
    localStorage.setItem('player-name', name)
    set({ name })
  },

  setRolledStats: (rolledStats) => {
    // Set character stats from rolled values
    // Give some skill points to start with for character customization
    set({ 
      stats: rolledStats,
      skillPoints: 3 // Start with 3 skill points for initial specialization
    })
  },

  resetForPrestige: (_prestigeLevel: number) => {
    // Reset character to starting state
    // Base 10 stats (D&D standard), skill points for customization
    
    set({
      level: 1,
      xp: 0,
      skillPoints: 5, // Start with 5 skill points
      stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }, // D&D base stats
      skills: {
        crafting: { level: 1, xp: 0 },
        combat: {
          swordsmanship: 0,
          axemastery: 0,
          archery: 0,
          unarmed: 0,
          heavyArmor: 0,
          lightArmor: 0,
          dodge: 0,
          toughness: 0,
          criticalStrike: 0,
          powerAttack: 0,
          quickDraw: 0,
          monsterLore: 0,
          beastMastery: 0,
          alchemy: 0,
          athletics: 0,
          perception: 0
        }
      },
      equipped: {}
    })
    
    // Reset economy
    setTimeout(async () => {
      const { useEconomy } = await import('./economyStore')
      useEconomy.getState().resetForPrestige()
    }, 0)
  }
}), { name: 'char-v4' }))  // Bumped version for migration)
