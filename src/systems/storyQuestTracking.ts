/**
 * Story Quest Tracking System
 * Utilities to track and update story quest objectives based on game events
 */

import { useStory } from '@/state/storyStore'
import { useTown } from '@/state/townStore'
import { useEconomy } from '@/state/economyStore'
import { useChar } from '@/state/charStore'

/**
 * Track monster kills for story quests
 */
export function trackMonsterKill(monsterName?: string) {
  const story = useStory.getState()
  
  // Update all active quests with kill_monster objectives
  story.activeStoryQuests.forEach(quest => {
    quest.objectives.forEach(objective => {
      if (objective.type === 'kill_monster') {
        // If no specific monster is required, count all kills
        if (!objective.monsterId || objective.monsterId === monsterName) {
          const currentProgress = objective.current || 0
          story.updateQuestObjective(quest.questId, objective.id, currentProgress + 1)
        }
      }
    })
  })
}

/**
 * Track boss defeats for story quests
 */
export function trackBossDefeat(zoneId: number) {
  const story = useStory.getState()
  
  // Update all active quests with defeat_boss objectives
  story.activeStoryQuests.forEach(quest => {
    quest.objectives.forEach(objective => {
      if (objective.type === 'defeat_boss' && objective.bossZone === zoneId) {
        story.updateQuestObjective(quest.questId, objective.id, 1)
      }
    })
  })
}

/**
 * Track item collection for story quests
 */
export function trackItemCollection(itemId: string, quantity: number = 1) {
  const story = useStory.getState()
  
  // Update all active quests with collect_item objectives
  story.activeStoryQuests.forEach(quest => {
    quest.objectives.forEach(objective => {
      if (objective.type === 'collect_item' && objective.itemId === itemId) {
        const currentProgress = objective.current || 0
        story.updateQuestObjective(quest.questId, objective.id, currentProgress + quantity)
      }
    })
  })
}

/**
 * Track material gathering for story quests
 */
export function trackMaterialGathering(materialId: string, quantity: number) {
  const story = useStory.getState()
  const economy = useEconomy.getState()
  
  // Update all active quests with gather_material objectives
  story.activeStoryQuests.forEach(quest => {
    quest.objectives.forEach(objective => {
      if (objective.type === 'gather_material' && objective.materialId === materialId) {
        // Use current material count from economy
        const currentAmount = economy.materials[materialId] || 0
        story.updateQuestObjective(quest.questId, objective.id, currentAmount)
      }
    })
  })
}

/**
 * Track building upgrades for story quests
 */
export function trackBuildingUpgrade(buildingId: string, newLevel: number) {
  const story = useStory.getState()
  
  // Update all active quests with upgrade_building objectives
  story.activeStoryQuests.forEach(quest => {
    quest.objectives.forEach(objective => {
      if (objective.type === 'upgrade_building' && objective.buildingId === buildingId) {
        story.updateQuestObjective(quest.questId, objective.id, newLevel)
      }
    })
  })
}

/**
 * Track player level for story quests
 */
export function trackLevelUp(newLevel: number) {
  const story = useStory.getState()
  
  // Update all active quests with reach_level objectives
  story.activeStoryQuests.forEach(quest => {
    quest.objectives.forEach(objective => {
      if (objective.type === 'reach_level') {
        story.updateQuestObjective(quest.questId, objective.id, newLevel)
      }
    })
  })
}

/**
 * Check and update all material gathering quests
 * Call this periodically or when materials change
 */
export function updateMaterialQuestProgress() {
  const story = useStory.getState()
  const economy = useEconomy.getState()
  
  story.activeStoryQuests.forEach(quest => {
    quest.objectives.forEach(objective => {
      if (objective.type === 'gather_material' && objective.materialId) {
        const currentAmount = economy.materials[objective.materialId] || 0
        story.updateQuestObjective(quest.questId, objective.id, currentAmount)
      }
    })
  })
}

