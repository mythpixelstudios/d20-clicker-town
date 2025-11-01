import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  generateDrops, 
  computeClickDamage,
  makeAttackRoll,
  calculateAttackBonus
} from '@/systems/math'
import { applyMetaUpgrades } from '@/systems/metaUpgrades'
import { useChar } from './charStore'
import { useEconomy } from './economyStore'
import { useZoneProgression } from './zoneProgressionStore'
import { useMonsterCompendium } from './monsterCompendiumStore'
import { useLog } from './logStore'
import { getZone } from '@/data/zones'
import { 
  getRandomMonster, 
  getBoss, 
  calculateMonsterHP, 
  calculateBossHP,
  applyAffixesToMonster,
  calculateAffixRewards,
  getMonsterDisplayName,
  calculateWeaponEffectiveness
} from '@/data/monsters'
import type { Monster, MonsterAffix, Boss } from '@/data/monsters'
import { logMonsterDeath, logZoneUpgrade, logItemDrop } from './logStore'

type MonsterData = {
  monsterName: string
  monsterImage: string
  monsterHP: number
  monsterMaxHP: number
  monsterAC: number
  isBoss: boolean
  affixes?: MonsterAffix[]
  monster?: Monster
}

interface CombatState {
  killCount: number
  monsterName: string
  monsterImage: string
  monsterHP: number
  monsterMaxHP: number
  monsterAC: number
  isBoss: boolean
  bossTimer: number | null
  canTryBoss: boolean
  affixes?: MonsterAffix[]
  monster?: Monster
  onDamageDealt?: (damage: number, isCrit: boolean, isMiss?: boolean) => void
  click: () => void
  onMonsterDeath: () => void
  spawnNextMonster: () => void
  tryBoss: () => void
  init: () => void
  changeZone: () => void
  createMonsterData: (zone: number, isBoss: boolean) => MonsterData
  setDamageCallback: (callback: (damage: number, isCrit: boolean, isMiss?: boolean) => void) => void
}// Helper function to spawn a monster
function createMonsterData(zoneId: number, isBossMonster = false) {
  const zoneProgression = useZoneProgression.getState()
  const difficultyMultiplier = zoneProgression.getZoneDifficultyMultiplier(zoneId)
  
  if (isBossMonster) {
    const boss = getBoss(zoneId)
    const baseHP = calculateBossHP(boss.hp, zoneId)
    return {
      monsterHP: Math.floor(baseHP * difficultyMultiplier),
      monsterMaxHP: Math.floor(baseHP * difficultyMultiplier),
      monsterName: boss.name,
      monsterImage: boss.image,
      monsterAC: boss.armorClass,
      isBoss: true,
      monster: boss,
      affixes: boss.affixes
    }
  } else {
    const monster = getRandomMonster(zoneId) // This now handles affixes
    const modifiedMonster = applyAffixesToMonster(monster) // Apply affix effects
    const baseHP = calculateMonsterHP(modifiedMonster.hp, zoneId)
    
    // Record monster encounter in compendium
    useMonsterCompendium.getState().recordMonsterEncounter(monster, zoneId, monster.affixes)
    
    return {
      monsterHP: Math.floor(baseHP * difficultyMultiplier),
      monsterMaxHP: Math.floor(baseHP * difficultyMultiplier),
      monsterName: getMonsterDisplayName(monster),
      monsterImage: monster.image,
      monsterAC: monster.armorClass,
      isBoss: false,
      monster: monster,
      affixes: monster.affixes
    }
  }
}

export const useCombat = create<CombatState>()(persist((set, get) => ({
  // Persistent data
  killCount: 0,
  
  // Transient monster data (will be initialized by init())
  monsterName: '',
  monsterImage: '',
  monsterHP: 0,
  monsterMaxHP: 0,
  monsterAC: 10, // Default AC
  isBoss: false,
  bossTimer: null,
  canTryBoss: false,

  click: () => {
    const state = get()
    if (state.monsterHP <= 0) return
    
    const charState = useChar.getState()
    const totalStats = charState.getTotalStats()
    
    // Get skill bonuses from character
    const skillBonuses = charState.getSkillBonuses()
    
    // D&D Style Attack Roll with skill bonuses
    const attackBonus = calculateAttackBonus(totalStats, charState.level, skillBonuses.attackBonus, false)
    const attackRoll = makeAttackRoll(attackBonus, state.monsterAC)
    
    // If attack misses, show miss indicator
    if (!attackRoll.hit) {
      console.log('Attack missed!', { roll: attackRoll.roll, total: attackRoll.total, targetAC: state.monsterAC })
      state.onDamageDealt?.(0, false, true) // isMiss = true
      return
    }
    
    // Attack hit - calculate damage with skill bonuses
    let damage = computeClickDamage(totalStats, charState.level, skillBonuses.damageBonus)
    
    // Critical hit doubles damage
    if (attackRoll.isCrit) {
      damage = damage * 2
      console.log('Critical hit!', { damage })
    }
    
    // Constitution adds bonus damage to bosses (+3% per point)
    if (state.isBoss) {
      const conBossDamageBonus = 1 + (totalStats.con * 0.03)
      damage = Math.floor(damage * conBossDamageBonus)
    }
    
    // Apply meta upgrades
    const upgradedStats = applyMetaUpgrades({ clickDamage: damage })
    damage = upgradedStats.clickDamage
    
    // Apply weapon effectiveness for bosses
    if (state.isBoss && state.monster) {
      const boss = state.monster as Boss
      const equippedWeapon = charState.equipped.weapon
      const weaponType = equippedWeapon?.weaponType
      
      const effectiveness = calculateWeaponEffectiveness(boss, weaponType)
      damage = Math.floor(damage * effectiveness.multiplier)
      
      // Log weapon effectiveness message if it's significant
      if (effectiveness.message) {
        useLog.getState().addLog('monster_death', effectiveness.message)
      }
    }
    
    // Debug logging
    console.log('Click damage calculation:', {
      attackRoll,
      totalStats,
      damage,
      currentHP: state.monsterHP
    })
    
    // Call damage callback for UI effects
    state.onDamageDealt?.(damage, attackRoll.isCrit, false) // isMiss = false
    
    // No HP change if calculated damage is 0 or negative
    if (damage <= 0) {
      console.log('No damage dealt - damage was', damage)
      return
    }
    
    const newHP = Math.max(0, state.monsterHP - damage)
    
    if (newHP === 0) {
      // Monster died - handle death immediately
      get().onMonsterDeath()
    } else {
      // Just update HP
      set({ monsterHP: newHP })
    }
  },

  onMonsterDeath: () => {
    const state = get()
    
    // Record monster kill in compendium
    if (state.monster) {
      useMonsterCompendium.getState().recordMonsterKill(state.monster.name)
    }
    
    const zoneProgression = useZoneProgression.getState()
    const currentZone = zoneProgression.currentZone || 1
    const rewardMultiplier = zoneProgression.getZoneRewardMultiplier(currentZone)
    
    // D&D-inspired XP scaling: exponential growth with boss multiplier
    // Early zones (1-10): 25 * 1.3^(zone-1)
    // Later zones (11+): slower growth to prevent runaway scaling
    const baseXP = currentZone <= 10
      ? 25 * Math.pow(1.3, currentZone - 1)
      : 25 * Math.pow(1.3, 9) * Math.pow(1.2, currentZone - 10)
    
    // Bosses give 5x XP (like D&D boss encounters)
    const bossMultiplier = state.isBoss ? 5 : 1
    const xpGained = Math.ceil(baseXP * bossMultiplier * rewardMultiplier)
    
    // Generate drops with zone level scaling
    const drops = generateDrops(currentZone, state.isBoss)
    const economy = useEconomy.getState()
    
    // Scale gold drops by reward multiplier
    let goldFromDrops = drops
      .filter(drop => drop.gold)
      .reduce((total, drop) => total + Math.floor((drop.gold || 0) * rewardMultiplier), 0)
    
    // Apply affix rewards if monster has affixes
    if (state.monster && state.affixes) {
      const baseMaterials: Record<string, number> = {}
      drops.filter(drop => drop.mat && drop.qty).forEach(drop => {
        if (drop.mat && drop.qty) {
          baseMaterials[drop.mat] = (baseMaterials[drop.mat] || 0) + drop.qty
        }
      })
      
      const affixRewards = calculateAffixRewards(state.monster, goldFromDrops, baseMaterials)
      goldFromDrops = affixRewards.gold
      
      // Add bonus materials from affixes
      for (const [materialId, amount] of Object.entries(affixRewards.materials)) {
        if (amount > baseMaterials[materialId] || 0) {
          economy.addMaterial(materialId, amount - (baseMaterials[materialId] || 0))
        }
      }
    }
    
    // Log monster death
    logMonsterDeath(state.monsterName, xpGained, goldFromDrops)
    
    // Add items to inventory (excluding gold which goes to balance)
    const inventoryItems = drops
      .filter(drop => drop.id && drop.label && !drop.gold) // Exclude gold items
      .map(drop => ({
        id: drop.id,
        label: drop.label,
        qty: drop.qty || 1,
        mat: drop.mat,
        equipment: drop.equipment,
        isEquipment: drop.isEquipment
      }))
    
    if (inventoryItems.length > 0) {
      economy.addInventory(inventoryItems)
      // Log item drops
      for (const item of inventoryItems) {
        if (item.equipment) {
          logItemDrop(item.label, item.equipment.rarity)
        } else {
          logItemDrop(item.label, 'common')
        }
      }
    }
    
    // Add gold and materials separately (with scaling)
    for (const drop of drops) {
      if (drop.gold) {
        economy.addGold(Math.floor(drop.gold * rewardMultiplier))
      }
      if (drop.mat && drop.qty) {
        // Scale material drops slightly
        const scaledQty = Math.max(1, Math.floor(drop.qty * Math.min(rewardMultiplier, 2))) // Cap material scaling at 2x
        economy.addMaterial(drop.mat, scaledQty)
      }
    }
    
    // Give XP
    useChar.getState().addXP(xpGained)
    
    // Handle progression
    if (state.isBoss) {
      // Boss defeated - clear the zone and show zone selection
      zoneProgression.clearZone(currentZone)
      logZoneUpgrade(currentZone)
      
      // Don't auto-advance, let player choose next zone
      // The zone selection screen will appear
    } else {
      get().spawnNextMonster()
    }
  },

  spawnNextMonster: () => {
    const state = get()
    const zoneProgression = useZoneProgression.getState()
    const currentZone = zoneProgression.currentZone || 1
    const zone = getZone(currentZone)
    const newKillCount = state.killCount + 1
    
    if (newKillCount >= zone.monstersToDefeat) {
      // Can now fight boss
      const newMonster = createMonsterData(currentZone, false)
      set({
        killCount: newKillCount,
        canTryBoss: true,
        ...newMonster
      })
    } else {
      // Spawn next regular monster
      const newMonster = createMonsterData(currentZone, false)
      set({
        killCount: newKillCount,
        ...newMonster
      })
    }
  },

  tryBoss: () => {
    const state = get()
    if (!state.canTryBoss) return
    
    const zoneProgression = useZoneProgression.getState()
    const currentZone = zoneProgression.currentZone || 1
    const newMonster = createMonsterData(currentZone, true)
    set({
      ...newMonster,
      bossTimer: 30,
      canTryBoss: false
    })
  },

  init: () => {
    // Always create fresh monster data on initialization
    const zoneProgression = useZoneProgression.getState()
    const currentZone = zoneProgression.currentZone || 1
    const newMonster = createMonsterData(currentZone, false)
    set({ 
      ...newMonster,
      bossTimer: null,
      canTryBoss: false
    })
  },

  changeZone: () => {
    const currentZone = useZoneProgression.getState().currentZone || 1
    const newMonster = createMonsterData(currentZone, false)
    set({
      ...newMonster,
      killCount: 0,
      canTryBoss: false,
      bossTimer: null
    })
  },

  // Export createMonsterData for external use
  createMonsterData,

  setDamageCallback: (callback: (damage: number, isCrit: boolean, isMiss?: boolean) => void) => {
    set({ onDamageDealt: callback })
  }
}), { 
  name: 'combat-v3',
  partialize: (state) => ({
    // Only persist kill count, not monster data
    killCount: state.killCount
  })
}))

// Initialize on store creation
useCombat.getState().init()
