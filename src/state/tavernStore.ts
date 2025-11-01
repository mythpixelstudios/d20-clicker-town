import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  npcs, 
  quests, 
  getNPC, 
  getQuest, 
  calculateQuestEffectiveness, 
  calculateNPCStatsAtLevel,
  calculateXPForLevel,
  calculateQuestXPReward,
  calculateRecruitmentChance
} from '@/data/npcs'
import { useEconomy } from './economyStore'
import { useChar } from './charStore'
import { useLog } from './logStore'
import { useTown } from './townStore'
import { calculateBuildingEffects } from '@/data/buildings'
import type { NPC, Quest } from '@/data/npcs'

export interface OwnedNPC {
  npcId: string
  level: number
  xp: number
  totalQuestsCompleted: number
  friendship: number // 0-100, affects NPC effectiveness and leveling speed
}

export interface QuestAssignment {
  id: string
  npcId: string
  questId: string
  startTime: number
  duration: number // Calculated duration based on NPC effectiveness
  rewards: {
    gold?: number
    materials?: Record<string, number>
    experience?: number
  }
}

interface TavernState {
  assignments: QuestAssignment[]
  completedQuests: string[]
  ownedNPCs: OwnedNPC[] // Changed from string[] to OwnedNPC[]
  
  // Actions
  assignNPCToQuest: (npcId: string, questId: string) => boolean
  claimCompletedQuest: (assignmentId: string) => void
  getActiveAssignments: () => QuestAssignment[]
  getCompletedAssignments: () => QuestAssignment[]
  isNPCAvailable: (npcId: string) => boolean
  getQuestProgress: (assignmentId: string) => number
  processQuestTicks: () => void
  recruitNPC: (npcId: string) => boolean
  
  // NPC Management
  getNPCData: (npcId: string) => OwnedNPC | undefined
  addNPCXP: (npcId: string, xp: number) => void
  
  // Getters
  getAvailableNPCs: () => NPC[]
  getAvailableQuests: () => Quest[]
  getOwnedNPCs: () => Array<NPC & OwnedNPC>
}

export const useTavern = create<TavernState>()(persist((set, get) => ({
  assignments: [],
  completedQuests: [],
  ownedNPCs: [{ npcId: 'gareth', level: 1, xp: 0, totalQuestsCompleted: 0, friendship: 50 }], // Start with one NPC at level 1, 50 friendship
  
  assignNPCToQuest: (npcId: string, questId: string) => {
    const state = get()
    const char = useChar.getState()
    const economy = useEconomy.getState()
    const log = useLog.getState()
    
    // Check if NPC is available
    if (!state.isNPCAvailable(npcId)) {
      return false
    }
    
    // Check if player owns this NPC
    const ownedNPC = state.ownedNPCs.find(owned => owned.npcId === npcId)
    if (!ownedNPC) {
      return false
    }
    
    const npc = getNPC(npcId)
    const quest = getQuest(questId)
    
    if (!npc || !quest) {
      return false
    }
    
    // Check quest requirements
    if (quest.requirements) {
      if (quest.requirements.level && char.level < quest.requirements.level) {
        return false
      }
      
      if (quest.requirements.materials) {
        for (const [materialId, amount] of Object.entries(quest.requirements.materials)) {
          if ((economy.materials[materialId] || 0) < amount) {
            return false
          }
        }
      }
    }
    
    // Consume materials if required
    if (quest.requirements?.materials) {
      for (const [materialId, amount] of Object.entries(quest.requirements.materials)) {
        economy.addMaterial(materialId, -amount)
      }
    }
    
    // Calculate effectiveness using NPC's current level
    const npcStats = calculateNPCStatsAtLevel(npc, ownedNPC.level)
    const npcWithLeveledStats = { ...npc, baseStats: npcStats }
    const effectiveness = calculateQuestEffectiveness(npcWithLeveledStats, quest)
    
    // Get building effects for quest efficiency
    const townBuildings = useTown.getState().buildings
    const buildingEffects = calculateBuildingEffects(townBuildings)
    // Each point of quest efficiency gives 2% speed boost (1 + 0.02 * efficiency)
    // So at tavern level 10 (10 efficiency), that's 1.2x speed (20% faster)
    const questEfficiencyBonus = 1 + (buildingEffects.questEfficiency || 0) * 0.02
    
    // Calculate actual duration and rewards with building bonuses
    const actualDuration = Math.floor(quest.baseDuration / (effectiveness.speedMultiplier * questEfficiencyBonus))
    const actualRewards: typeof quest.baseRewards = {}
    
    if (quest.baseRewards.gold) {
      actualRewards.gold = Math.floor(quest.baseRewards.gold * effectiveness.yieldMultiplier * questEfficiencyBonus)
    }
    
    if (quest.baseRewards.experience) {
      actualRewards.experience = Math.floor(quest.baseRewards.experience * effectiveness.yieldMultiplier * questEfficiencyBonus)
    }
    
    if (quest.baseRewards.materials) {
      actualRewards.materials = {}
      for (const [materialId, amount] of Object.entries(quest.baseRewards.materials)) {
        actualRewards.materials[materialId] = Math.floor(amount * effectiveness.yieldMultiplier * questEfficiencyBonus)
      }
    }
    
    // Create assignment
    const assignment: QuestAssignment = {
      id: `${npcId}_${questId}_${Date.now()}`,
      npcId,
      questId,
      startTime: Date.now(),
      duration: actualDuration * 1000, // Convert to milliseconds
      rewards: actualRewards
    }
    
    set(state => ({
      assignments: [...state.assignments, assignment]
    }))
    
    log.addLog('crafting_success', `${npc.name} started "${quest.name}" quest`)
    return true
  },
  
  claimCompletedQuest: (assignmentId: string) => {
    const state = get()
    const assignment = state.assignments.find(a => a.id === assignmentId)
    
    if (!assignment) return
    
    const now = Date.now()
    const isCompleted = now >= assignment.startTime + assignment.duration
    
    if (!isCompleted) return
    
    const economy = useEconomy.getState()
    const char = useChar.getState()
    const log = useLog.getState()
    const npc = getNPC(assignment.npcId)
    const quest = getQuest(assignment.questId)
    
    // Award rewards
    if (assignment.rewards.gold) {
      economy.addGold(assignment.rewards.gold)
    }
    
    if (assignment.rewards.materials) {
      for (const [materialId, amount] of Object.entries(assignment.rewards.materials)) {
        economy.addMaterial(materialId, amount)
      }
    }
    
    if (assignment.rewards.experience) {
      char.addXP(assignment.rewards.experience)
    }
    
    // Award NPC XP (boosted by friendship)
    if (quest) {
      const ownedNPC = state.ownedNPCs.find(owned => owned.npcId === assignment.npcId)
      const baseXP = calculateQuestXPReward(quest)
      
      // Friendship multiplier: 0-100 friendship = 0.5x to 1.5x XP
      const friendshipMultiplier = 0.5 + (ownedNPC?.friendship || 50) * 0.01
      const npcXP = Math.floor(baseXP * friendshipMultiplier)
      
      state.addNPCXP(assignment.npcId, npcXP)
    }
    
    // Increase friendship on quest completion (1-3 points, based on Constitution)
    const charState = useChar.getState()
    const totalStats = charState.getTotalStats()
    const constitutionStat = totalStats.con || 0
    const friendshipGain = Math.min(3, 1 + Math.floor(constitutionStat / 10)) // 1-3 friendship per quest
    
    // Increment quest completion counter and friendship for NPC
    set(state => ({
      ownedNPCs: state.ownedNPCs.map(owned =>
        owned.npcId === assignment.npcId
          ? { 
              ...owned, 
              totalQuestsCompleted: owned.totalQuestsCompleted + 1,
              friendship: Math.min(100, owned.friendship + friendshipGain)
            }
          : owned
      )
    }))
    
    // Mark quest as completed if not already
    if (quest && !state.completedQuests.includes(assignment.questId)) {
      set(state => ({
        completedQuests: [...state.completedQuests, assignment.questId]
      }))
    }
    
    // Remove assignment
    set(state => ({
      assignments: state.assignments.filter(a => a.id !== assignmentId)
    }))
    
    log.addLog('crafting_success', `${npc?.name} completed "${quest?.name}" quest!`)
  },
  
  getActiveAssignments: () => {
    const now = Date.now()
    return get().assignments.filter(assignment => 
      now < assignment.startTime + assignment.duration
    )
  },
  
  getCompletedAssignments: () => {
    const now = Date.now()
    return get().assignments.filter(assignment => 
      now >= assignment.startTime + assignment.duration
    )
  },
  
  isNPCAvailable: (npcId: string) => {
    const activeAssignments = get().getActiveAssignments()
    return !activeAssignments.some(assignment => assignment.npcId === npcId)
  },
  
  getQuestProgress: (assignmentId: string) => {
    const assignment = get().assignments.find(a => a.id === assignmentId)
    if (!assignment) return 0
    
    const now = Date.now()
    const elapsed = now - assignment.startTime
    const progress = Math.min(elapsed / assignment.duration, 1)
    
    return progress
  },
  
  processQuestTicks: () => {
    // Auto-claim completed quests that have been finished for more than 5 seconds
    const state = get()
    const completedAssignments = state.getCompletedAssignments()
    const now = Date.now()
    
    for (const assignment of completedAssignments) {
      const completionTime = assignment.startTime + assignment.duration
      if (now - completionTime > 5000) { // 5 seconds grace period
        state.claimCompletedQuest(assignment.id)
      }
    }
  },
  
  recruitNPC: (npcId: string) => {
    const state = get()
    const economy = useEconomy.getState()
    const char = useChar.getState()
    const npc = getNPC(npcId)
    
    // Check if already owned
    if (!npc || state.ownedNPCs.some(owned => owned.npcId === npcId)) {
      return false
    }
    
    // Use recruitment cost from NPC data
    const cost = npc.recruitmentCost.gold
    
    if (economy.gold < cost) {
      return false
    }
    
    // Calculate recruitment chance based on Constitution
    const totalStats = char.getTotalStats()
    const constitutionStat = totalStats.con || 0
    const recruitmentChance = calculateRecruitmentChance(npc, constitutionStat)
    
    // Roll for success
    const roll = Math.random()
    
    // Import toast function dynamically to avoid circular dependencies
    const showToast = async (message: string, type: 'success' | 'error') => {
      const { useToast } = await import('./toastStore')
      useToast.getState().addToast(message, type)
    }
    
    if (roll > recruitmentChance) {
      // Failed to recruit - still pay gold (bribe attempt)
      economy.addGold(-cost)
      useLog.getState().addLog('crafting_failure', `Failed to recruit ${npc.name}. They declined your offer. (${Math.floor(recruitmentChance * 100)}% chance)`)
      
      // Show failure toast
      showToast(
        `❌ Failed to recruit ${npc.name}! They declined your offer. (${Math.floor(recruitmentChance * 100)}% success rate) You can try again!`,
        'error'
      )
      
      return false
    }
    
    // Success! Pay gold and add NPC
    economy.addGold(-cost)
    
    // Starting friendship depends on Constitution (20-60 base + CON bonus)
    const startingFriendship = Math.min(100, 20 + constitutionStat)
    
    // Add NPC with level 1, 0 XP, starting friendship
    set(state => ({
      ownedNPCs: [...state.ownedNPCs, { 
        npcId, 
        level: 1, 
        xp: 0, 
        totalQuestsCompleted: 0,
        friendship: startingFriendship
      }]
    }))
    
    useLog.getState().addLog('crafting_success', `Successfully recruited ${npc.name} for ${cost} gold! (${Math.floor(recruitmentChance * 100)}% chance, Friendship: ${startingFriendship})`)
    
    // Show success toast
    showToast(
      `✅ Successfully recruited ${npc.name}! Friendship: ${startingFriendship}/100 (${Math.floor(recruitmentChance * 100)}% success rate)`,
      'success'
    )
    
    return true
  },
  
  getNPCData: (npcId: string) => {
    return get().ownedNPCs.find(owned => owned.npcId === npcId)
  },
  
  addNPCXP: (npcId: string, xp: number) => {
    const state = get()
    const ownedNPC = state.ownedNPCs.find(owned => owned.npcId === npcId)
    const npc = getNPC(npcId)
    
    if (!ownedNPC || !npc) return
    
    let currentXP = ownedNPC.xp + xp
    let currentLevel = ownedNPC.level
    
    // Check for level ups
    let leveledUp = false
    while (currentLevel < npc.levelingStats.maxLevel) {
      const xpNeeded = calculateXPForLevel(npc, currentLevel)
      
      if (currentXP >= xpNeeded) {
        currentXP -= xpNeeded
        currentLevel++
        leveledUp = true
      } else {
        break
      }
    }
    
    // Update NPC
    set(state => ({
      ownedNPCs: state.ownedNPCs.map(owned =>
        owned.npcId === npcId
          ? { ...owned, level: currentLevel, xp: currentXP }
          : owned
      )
    }))
    
    // Log level up
    if (leveledUp) {
      useLog.getState().addLog('level_up', `${npc.name} reached level ${currentLevel}!`)
    }
  },
  
  getAvailableNPCs: () => {
    const char = useChar.getState()
    const townBuildings = useTown.getState().buildings
    const state = get()
    
    return npcs.filter(npc => {
      if (!npc.unlockRequirements) return true
      
      // Check level requirement
      if (npc.unlockRequirements.level && char.level < npc.unlockRequirements.level) {
        return false
      }
      
      // Check building requirements  
      if (npc.unlockRequirements.buildings) {
        for (const req of npc.unlockRequirements.buildings) {
          const building = townBuildings.find((b: any) => b.id === req.id)
          if (!building || building.level < req.level) {
            return false
          }
        }
      }
      
      // Check completed quests
      if (npc.unlockRequirements.completedQuests) {
        for (const questId of npc.unlockRequirements.completedQuests) {
          if (!state.completedQuests.includes(questId)) {
            return false
          }
        }
      }
      
      return true
    })
  },
  
  getAvailableQuests: () => {
    const char = useChar.getState()
    const townBuildings = useTown.getState().buildings
    const economy = useEconomy.getState()
    
    return quests.filter(quest => {
      if (!quest.requirements) return true
      
      // Check level requirement
      if (quest.requirements.level && char.level < quest.requirements.level) {
        return false
      }
      
      // Check building requirements
      if (quest.requirements.buildings) {
        for (const req of quest.requirements.buildings) {
          const building = townBuildings.find((b: any) => b.id === req.id)
          if (!building || building.level < req.level) {
            return false
          }
        }
      }
      
      // Check material requirements (for starting the quest)
      if (quest.requirements.materials) {
        for (const [materialId, amount] of Object.entries(quest.requirements.materials)) {
          if ((economy.materials[materialId] || 0) < amount) {
            return false
          }
        }
      }
      
      return true
    })
  },
  
  getOwnedNPCs: () => {
    const state = get()
    return state.ownedNPCs.map(owned => {
      const npc = getNPC(owned.npcId)
      if (!npc) return null
      return { ...npc, ...owned }
    }).filter((npc): npc is NPC & OwnedNPC => npc !== null)
  }
}), { name: 'tavern-v2' })) // Bump version for data migration

// Set up quest processing interval
let questProcessingInterval: number | null = null

export const startQuestProcessing = () => {
  if (questProcessingInterval) return
  
  questProcessingInterval = setInterval(() => {
    useTavern.getState().processQuestTicks()
  }, 1000) // Process every second
}

export const stopQuestProcessing = () => {
  if (questProcessingInterval) {
    clearInterval(questProcessingInterval)
    questProcessingInterval = null
  }
}