/**
 * Story State Management
 * Manages story progression, active dialogues, completed chapters, and game pause state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { chapters, getChapter, getAvailableChapters, getStoryQuest } from '@/data/chapters'
import { getCharacter } from '@/data/characters'
import type { Chapter, DialogueLine, StoryQuest, StoryObjective } from '@/data/chapters'
import { useChar } from './charStore'
import { useTown } from './townStore'
import { useEconomy } from './economyStore'

export interface ActiveDialogue {
  chapterId?: string
  questId?: string
  buildingId?: string // If triggered from building click
  dialogueLines: DialogueLine[]
  currentLineIndex: number
  isActive: boolean
}

export interface ActiveStoryQuest {
  questId: string
  chapterId: string
  objectives: StoryObjective[]
  startTime: number
}

interface StoryState {
  // Progression tracking
  completedChapters: string[]
  activeChapter: string | null
  completedStoryQuests: string[]
  activeStoryQuests: ActiveStoryQuest[]
  
  // Dialogue state
  activeDialogue: ActiveDialogue | null
  isGamePaused: boolean
  
  // Building detail panel
  selectedBuilding: string | null
  
  // Actions
  startChapter: (chapterId: string) => void
  completeChapter: (chapterId: string) => void
  
  // Dialogue management
  startDialogue: (dialogue: DialogueLine[], context?: { chapterId?: string; questId?: string; buildingId?: string }) => void
  advanceDialogue: () => void
  selectChoice: (choiceIndex: number) => void
  closeDialogue: () => void
  
  // Quest management
  startStoryQuest: (questId: string, chapterId: string) => void
  updateQuestObjective: (questId: string, objectiveId: string, progress: number) => void
  completeStoryQuest: (questId: string) => void
  getActiveQuest: (questId: string) => ActiveStoryQuest | undefined
  
  // Building interaction
  openBuildingDetail: (buildingId: string) => void
  closeBuildingDetail: () => void
  
  // Getters
  getAvailableChapters: () => Chapter[]
  isChapterUnlocked: (chapterId: string) => boolean
  isQuestActive: (questId: string) => boolean
  isQuestCompleted: (questId: string) => boolean
}

export const useStory = create<StoryState>()(
  persist(
    (set, get) => ({
      completedChapters: [],
      activeChapter: null,
      completedStoryQuests: [],
      activeStoryQuests: [],
      activeDialogue: null,
      isGamePaused: false,
      selectedBuilding: null,
      
      startChapter: (chapterId: string) => {
        const chapter = getChapter(chapterId)
        if (!chapter) return
        
        set({ activeChapter: chapterId })
        
        // Start intro dialogue
        if (chapter.introDialogue && chapter.introDialogue.length > 0) {
          get().startDialogue(chapter.introDialogue, { chapterId })
        }
      },
      
      completeChapter: (chapterId: string) => {
        const chapter = getChapter(chapterId)
        if (!chapter) return
        
        set(state => ({
          completedChapters: [...state.completedChapters, chapterId],
          activeChapter: null
        }))
        
        // Play completion dialogue if exists
        if (chapter.completionDialogue && chapter.completionDialogue.length > 0) {
          get().startDialogue(chapter.completionDialogue, { chapterId })
        }
        
        // Check if next chapter should auto-unlock
        const nextChapter = chapters.find(c => c.order === chapter.order + 1)
        if (nextChapter && get().isChapterUnlocked(nextChapter.id)) {
          // Auto-start next chapter after a delay
          setTimeout(() => {
            get().startChapter(nextChapter.id)
          }, 1000)
        }
      },
      
      startDialogue: (dialogue: DialogueLine[], context?: { chapterId?: string; questId?: string; buildingId?: string }) => {
        // Track character meetings when dialogue starts
        if (dialogue.length > 0 && dialogue[0].characterId) {
          const character = getCharacter(dialogue[0].characterId)
          if (character) {
            import('./characterCompendiumStore').then(({ useCharacterCompendium }) => {
              useCharacterCompendium.getState().recordCharacterMeeting(character)
            })
          }
        }

        set({
          activeDialogue: {
            chapterId: context?.chapterId,
            questId: context?.questId,
            buildingId: context?.buildingId,
            dialogueLines: dialogue,
            currentLineIndex: 0,
            isActive: true
          },
          isGamePaused: true
        })
      },
      
      advanceDialogue: () => {
        const { activeDialogue } = get()
        if (!activeDialogue) return
        
        const nextIndex = activeDialogue.currentLineIndex + 1
        
        // Check if we've reached the end
        if (nextIndex >= activeDialogue.dialogueLines.length) {
          get().closeDialogue()
          return
        }
        
        set({
          activeDialogue: {
            ...activeDialogue,
            currentLineIndex: nextIndex
          }
        })
      },
      
      selectChoice: (choiceIndex: number) => {
        const { activeDialogue } = get()
        if (!activeDialogue) return
        
        const currentLine = activeDialogue.dialogueLines[activeDialogue.currentLineIndex]
        if (!currentLine.choices || !currentLine.choices[choiceIndex]) return
        
        const choice = currentLine.choices[choiceIndex]
        
        // Apply choice effects
        if (choice.effects) {
          const economy = useEconomy.getState()
          const char = useChar.getState()
          
          if (choice.effects.addGold) {
            economy.addGold(choice.effects.addGold)
          }
          
          if (choice.effects.addXP) {
            char.addXP(choice.effects.addXP)
          }
          
          if (choice.effects.unlockQuest && activeDialogue.chapterId) {
            get().startStoryQuest(choice.effects.unlockQuest, activeDialogue.chapterId)
          }
        }
        
        // Jump to next dialogue or advance normally
        if (choice.nextDialogueIndex !== undefined) {
          set({
            activeDialogue: {
              ...activeDialogue,
              currentLineIndex: choice.nextDialogueIndex
            }
          })
        } else {
          get().advanceDialogue()
        }
      },
      
      closeDialogue: () => {
        set({
          activeDialogue: null,
          isGamePaused: false
        })
      },
      
      startStoryQuest: (questId: string, chapterId: string) => {
        const quest = getStoryQuest(questId)
        if (!quest) return
        
        // Check if already active or completed
        if (get().isQuestActive(questId) || get().isQuestCompleted(questId)) {
          return
        }
        
        const activeQuest: ActiveStoryQuest = {
          questId,
          chapterId,
          objectives: quest.objectives.map(obj => ({ ...obj, current: 0 })),
          startTime: Date.now()
        }
        
        set(state => ({
          activeStoryQuests: [...state.activeStoryQuests, activeQuest]
        }))
      },
      
      updateQuestObjective: (questId: string, objectiveId: string, progress: number) => {
        set(state => ({
          activeStoryQuests: state.activeStoryQuests.map(quest => {
            if (quest.questId !== questId) return quest
            
            return {
              ...quest,
              objectives: quest.objectives.map(obj => {
                if (obj.id !== objectiveId) return obj
                return { ...obj, current: Math.min(progress, obj.target) }
              })
            }
          })
        }))
        
        // Check if quest is complete
        const quest = get().getActiveQuest(questId)
        if (quest && quest.objectives.every(obj => (obj.current || 0) >= obj.target)) {
          get().completeStoryQuest(questId)
        }
      },
      
      completeStoryQuest: (questId: string) => {
        const activeQuest = get().getActiveQuest(questId)
        if (!activeQuest) return
        
        const questData = getStoryQuest(questId)
        if (!questData) return
        
        // Apply rewards
        const economy = useEconomy.getState()
        const char = useChar.getState()
        
        if (questData.rewards.gold) {
          economy.addGold(questData.rewards.gold)
        }
        
        if (questData.rewards.xp) {
          char.addXP(questData.rewards.xp)
        }
        
        if (questData.rewards.items) {
          // Add items to inventory
          const items = questData.rewards.items.map(itemId => ({
            id: itemId,
            label: itemId,
            qty: 1
          }))
          economy.addInventory(items)
        }
        
        // Mark as completed
        set(state => ({
          completedStoryQuests: [...state.completedStoryQuests, questId],
          activeStoryQuests: state.activeStoryQuests.filter(q => q.questId !== questId)
        }))
        
        // Play completion dialogue
        if (questData.onComplete?.dialogue) {
          get().startDialogue(questData.onComplete.dialogue, { questId, chapterId: activeQuest.chapterId })
        }
        
        // Check if this unlocks a new chapter
        if (questData.rewards.unlockChapter) {
          const newChapterId = questData.rewards.unlockChapter
          if (get().isChapterUnlocked(newChapterId)) {
            setTimeout(() => {
              get().startChapter(newChapterId)
            }, 2000)
          }
        }
        
        // Check if chapter is complete
        const chapter = getChapter(activeQuest.chapterId)
        if (chapter) {
          const allQuestsComplete = chapter.quests.every(q => get().isQuestCompleted(q.id))
          if (allQuestsComplete) {
            get().completeChapter(activeQuest.chapterId)
          }
        }
      },
      
      getActiveQuest: (questId: string) => {
        return get().activeStoryQuests.find(q => q.questId === questId)
      },
      
      openBuildingDetail: (buildingId: string) => {
        set({ selectedBuilding: buildingId })
      },
      
      closeBuildingDetail: () => {
        set({ selectedBuilding: null })
      },
      
      getAvailableChapters: () => {
        const char = useChar.getState()
        const town = useTown.getState()
        const { completedChapters, completedStoryQuests } = get()
        
        return getAvailableChapters(
          char.level,
          completedChapters,
          completedStoryQuests,
          town.buildings
        )
      },
      
      isChapterUnlocked: (chapterId: string) => {
        const availableChapters = get().getAvailableChapters()
        return availableChapters.some(c => c.id === chapterId)
      },
      
      isQuestActive: (questId: string) => {
        return get().activeStoryQuests.some(q => q.questId === questId)
      },
      
      isQuestCompleted: (questId: string) => {
        return get().completedStoryQuests.includes(questId)
      }
    }),
    {
      name: 'story-progress',
      partialize: (state) => ({
        completedChapters: state.completedChapters,
        activeChapter: state.activeChapter,
        completedStoryQuests: state.completedStoryQuests,
        activeStoryQuests: state.activeStoryQuests
      })
    }
  )
)

