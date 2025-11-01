import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useChar } from './charStore'
import { useEconomy } from './economyStore'
import { useTown } from './townStore'
import { calculateBuildingEffects } from '@/data/buildings'
import { equipmentTemplates } from '@/data/equipment'
import type { Equipment } from '@/data/equipment'
import { logCraftingSuccess, logCraftingFailure } from './logStore'

export type CraftingJob = {
  id: string
  equipmentId: string
  startTime: number
  duration: number // in seconds
  successRate: number
  materials: Record<string, number>
  onComplete: (success: boolean) => void
}

export type QueuedCraftingJob = {
  id: string
  equipmentId: string
  materials: Record<string, number>
  goldCost: number
}

type CraftingState = {
  activeJobs: CraftingJob[]
  queuedJobs: QueuedCraftingJob[]
  completedJobs: string[]
  maxActiveJobs: number
  startCrafting: (equipmentId: string) => boolean
  addToQueue: (equipmentId: string) => boolean
  removeFromQueue: (jobId: string) => boolean
  processQueue: () => void
  updateJobs: () => void
  calculateCraftingTime: (equipment: Equipment) => number
  calculateSuccessRate: (equipment: Equipment) => number
  completeJob: (jobId: string, success: boolean) => void
  getQueuePosition: (jobId: string) => number
  clearQueue: () => void
}

// Helper function to calculate crafting time based on equipment complexity
const calculateBaseCraftingTime = (equipment: Equipment): number => {
  // Base time in seconds
  let baseTime = 10 // 10 seconds minimum
  
  // Equipment level affects time
  baseTime += equipment.level * 2
  
  // Rarity affects time
  const rarityMultipliers = {
    common: 1,
    uncommon: 1.3,
    rare: 1.7,
    epic: 2.2,
    legendary: 3.0
  }
  
  baseTime *= rarityMultipliers[equipment.rarity as keyof typeof rarityMultipliers] || 1
  
  return Math.floor(baseTime)
}

// Calculate success rate based on stats and crafting skill
const calculateBaseSuccessRate = (equipment: Equipment): number => {
  const char = useChar.getState()
  const totalStats = char.getTotalStats()
  const craftingLevel = char.skills.crafting.level
  
  // Base success rate starts at 50%
  let successRate = 0.5
  
  // Intelligence contributes to precision (25% weight)
  successRate += (totalStats.int * 0.02) * 0.25
  
  // Dexterity contributes to manual skill (25% weight)  
  successRate += (totalStats.dex * 0.02) * 0.25
  
  // Crafting skill contributes most (50% weight)
  successRate += (craftingLevel * 0.03) * 0.5
  
  // Equipment difficulty reduces success rate
  const difficultyPenalty = {
    common: 0,
    uncommon: 0.05,
    rare: 0.15,
    epic: 0.25,
    legendary: 0.4
  }
  
  successRate -= difficultyPenalty[equipment.rarity as keyof typeof difficultyPenalty] || 0
  successRate -= (equipment.level - 1) * 0.02 // Each level above 1 reduces success by 2%
  
  // Clamp between 10% and 95%
  return Math.max(0.1, Math.min(0.95, successRate))
}

export const useCrafting = create<CraftingState>()(persist((set, get) => ({
  activeJobs: [],
  queuedJobs: [],
  completedJobs: [],
  maxActiveJobs: 3, // Allow up to 3 simultaneous crafting jobs

  calculateCraftingTime: (equipment: Equipment) => {
    const char = useChar.getState()
    const totalStats = char.getTotalStats()
    const craftingLevel = char.skills.crafting.level
    
    // Get building effects for crafting speed
    const townBuildings = useTown.getState().buildings
    const buildingEffects = calculateBuildingEffects(townBuildings)
    
    let baseTime = calculateBaseCraftingTime(equipment)
    
    // Dexterity reduces crafting time (up to 50% reduction)
    const dexReduction = Math.min(0.5, totalStats.dex * 0.02)
    
    // Crafting skill reduces time (up to 40% reduction)
    const skillReduction = Math.min(0.4, craftingLevel * 0.015)
    
    // Building effects for crafting speed
    const craftingSpeedBonus = buildingEffects.craftingSpeed || 0
    const buildingSpeedReduction = Math.min(0.6, craftingSpeedBonus * 0.1) // Convert multiplier to reduction
    
    const totalReduction = dexReduction + skillReduction + buildingSpeedReduction
    baseTime = Math.floor(baseTime * (1 - totalReduction))
    
    return Math.max(3, baseTime) // Minimum 3 seconds
  },

  calculateSuccessRate: (equipment: Equipment) => {
    return calculateBaseSuccessRate(equipment)
  },

  startCrafting: (equipmentId: string) => {
    const template = equipmentTemplates.find(t => t.id === equipmentId)
    if (!template) return false

    const economy = useEconomy.getState()
    
    // Check if we have enough materials
    if (template.craftingRecipe) {
      for (const [material, amount] of Object.entries(template.craftingRecipe.materials)) {
        if ((economy.materials[material] || 0) < amount) {
          return false
        }
      }
    }

    // Use the template as the equipment for calculations
    const equipment = template

    const duration = get().calculateCraftingTime(equipment)
    const successRate = get().calculateSuccessRate(equipment)

    // Deduct materials immediately
    if (template.craftingRecipe) {
      for (const [material, amount] of Object.entries(template.craftingRecipe.materials)) {
        economy.addMaterial(material, -amount)
      }
    }

    // Create crafting job
    const job: CraftingJob = {
      id: `craft_${Date.now()}_${Math.random()}`,
      equipmentId,
      startTime: Date.now(),
      duration: duration * 1000, // Convert to milliseconds
      successRate,
      materials: template.craftingRecipe?.materials || {},
      onComplete: (success: boolean) => {
        get().completeJob(job.id, success)
      }
    }

    set({ activeJobs: [...get().activeJobs, job] })
    return true
  },

  updateJobs: () => {
    const { activeJobs } = get()
    const now = Date.now()
    
    const completedJobs = activeJobs.filter(job => {
      return now >= job.startTime + job.duration
    })

    if (completedJobs.length > 0) {
      completedJobs.forEach(job => {
        // Determine success/failure
        const success = Math.random() < job.successRate
        job.onComplete(success)
      })

      // Remove completed jobs
      const remainingJobs = activeJobs.filter(job => {
        return now < job.startTime + job.duration
      })

      set({ activeJobs: remainingJobs })
      
      // Process queue to start new jobs if space available
      setTimeout(() => get().processQueue(), 100)
    }
  },

  completeJob: (jobId: string, success: boolean) => {
    const { completedJobs } = get()
    const job = get().activeJobs.find(j => j.id === jobId)
    
    if (!job) return

    const char = useChar.getState()
    const economy = useEconomy.getState()
    const equipmentTemplate = equipmentTemplates.find(t => t.id === job.equipmentId)

    if (success) {
      // Create the equipment and add to inventory
      if (equipmentTemplate) {
        // Create a copy of the template for the inventory
        const equipment: Equipment = {
          ...equipmentTemplate,
          id: `${equipmentTemplate.id}_${Date.now()}_${Math.random()}`
        }
        
        economy.addItem({
          id: equipment.id,
          label: equipment.name,
          equipment,
          isEquipment: true
        })
      }

      // Award crafting XP (more for higher level items)
      const xpGain = 10 + (equipmentTemplate?.level || 1) * 5
      char.addCraftingXP(xpGain)
      
      // Log successful crafting
      logCraftingSuccess(equipmentTemplate?.name || 'Unknown Item', xpGain)
    } else {
      // Failure - return some materials (50% of cost)
      Object.entries(job.materials).forEach(([material, amount]) => {
        const returnAmount = Math.floor(amount * 0.5)
        if (returnAmount > 0) {
          economy.addMaterial(material, returnAmount)
        }
      })

      // Still award some XP for the attempt
      char.addCraftingXP(5)
      
      // Log failed crafting
      logCraftingFailure(equipmentTemplate?.name || 'Unknown Item')
    }

    set({ completedJobs: [...completedJobs, jobId] })
  },

  addToQueue: (equipmentId: string) => {
    const template = equipmentTemplates.find(t => t.id === equipmentId)
    if (!template?.craftingRecipe) return false

    const economy = useEconomy.getState()
    
    // Check if we have enough materials and gold
    if (template.craftingRecipe.gold && economy.gold < template.craftingRecipe.gold) {
      return false
    }

    if (template.craftingRecipe.materials) {
      for (const [material, amount] of Object.entries(template.craftingRecipe.materials)) {
        if ((economy.materials[material] || 0) < amount) {
          return false
        }
      }
    }

    // Reserve materials and gold
    if (template.craftingRecipe.gold) {
      economy.addGold(-template.craftingRecipe.gold)
    }

    if (template.craftingRecipe.materials) {
      for (const [material, amount] of Object.entries(template.craftingRecipe.materials)) {
        economy.addMaterial(material, -amount)
      }
    }

    const queuedJob: QueuedCraftingJob = {
      id: `queue_${Date.now()}_${Math.random()}`,
      equipmentId,
      materials: template.craftingRecipe.materials || {},
      goldCost: template.craftingRecipe.gold || 0
    }

    set(state => ({
      queuedJobs: [...state.queuedJobs, queuedJob]
    }))

    // Try to process the queue immediately
    get().processQueue()
    return true
  },

  removeFromQueue: (jobId: string) => {
    const state = get()
    const queuedJob = state.queuedJobs.find(job => job.id === jobId)
    
    if (!queuedJob) return false

    const economy = useEconomy.getState()
    
    // Refund materials and gold
    if (queuedJob.goldCost > 0) {
      economy.addGold(queuedJob.goldCost)
    }

    Object.entries(queuedJob.materials).forEach(([material, amount]) => {
      economy.addMaterial(material, amount)
    })

    set(state => ({
      queuedJobs: state.queuedJobs.filter(job => job.id !== jobId)
    }))

    return true
  },

  processQueue: () => {
    const state = get()
    const { activeJobs, queuedJobs, maxActiveJobs } = state
    
    // If we have space for more active jobs and jobs in queue
    if (activeJobs.length < maxActiveJobs && queuedJobs.length > 0) {
      const nextJob = queuedJobs[0]
      const template = equipmentTemplates.find(t => t.id === nextJob.equipmentId)
      
      if (template) {
        const equipment = template
        const duration = get().calculateCraftingTime(equipment)
        const successRate = get().calculateSuccessRate(equipment)

        // Create active crafting job
        const activeJob: CraftingJob = {
          id: `craft_${Date.now()}_${Math.random()}`,
          equipmentId: nextJob.equipmentId,
          startTime: Date.now(),
          duration: duration * 1000, // Convert to milliseconds
          successRate,
          materials: nextJob.materials,
          onComplete: (success: boolean) => {
            get().completeJob(activeJob.id, success)
          }
        }

        set(state => ({
          activeJobs: [...state.activeJobs, activeJob],
          queuedJobs: state.queuedJobs.slice(1) // Remove first item from queue
        }))

        // Recursively process queue in case there's more space
        setTimeout(() => get().processQueue(), 100)
      }
    }
  },

  getQueuePosition: (jobId: string) => {
    const queuedJobs = get().queuedJobs
    return queuedJobs.findIndex(job => job.id === jobId) + 1 // 1-based position
  },

  clearQueue: () => {
    const state = get()
    const economy = useEconomy.getState()
    
    // Refund all queued jobs
    state.queuedJobs.forEach(job => {
      if (job.goldCost > 0) {
        economy.addGold(job.goldCost)
      }
      Object.entries(job.materials).forEach(([material, amount]) => {
        economy.addMaterial(material, amount)
      })
    })

    set({ queuedJobs: [] })
  }
}), { name: 'crafting-store' }))

// Auto-update crafting jobs every second
setInterval(() => {
  useCrafting.getState().updateJobs()
}, 1000)