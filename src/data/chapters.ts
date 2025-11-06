/**
 * Story Chapters System
 * Defines the game's narrative structure with chapters, dialogue sequences, and story progression
 */

import type { Character } from './characters'

export interface DialogueLine {
  characterId: string // Reference to character in characters.ts
  text: string
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'worried' | 'excited'
  choices?: DialogueChoice[] // Optional player choices
}

export interface DialogueChoice {
  text: string
  nextDialogueIndex?: number // Jump to specific dialogue index, or continue to next if undefined
  effects?: {
    unlockQuest?: string
    addItem?: string
    addGold?: number
    addXP?: number
  }
}

export interface StoryQuest {
  id: string
  name: string
  description: string
  characterId: string // Who gives this quest
  objectives: StoryObjective[]
  rewards: {
    gold?: number
    xp?: number
    items?: string[]
    unlockChapter?: string
  }
  onComplete?: {
    dialogue: DialogueLine[] // Dialogue that plays when quest is completed
  }
}

export interface StoryObjective {
  id: string
  type: 'kill_monster' | 'collect_item' | 'reach_level' | 'upgrade_building' | 'defeat_boss' | 'gather_material'
  description: string
  target: number // How many needed
  current?: number // Current progress (managed by state)
  // Type-specific data
  monsterId?: string // For kill_monster
  itemId?: string // For collect_item
  buildingId?: string // For upgrade_building
  materialId?: string // For gather_material
  bossZone?: number // For defeat_boss
}

export interface Chapter {
  id: string
  title: string
  description: string
  order: number // Chapter sequence
  unlockRequirements?: {
    level?: number
    buildings?: Array<{ id: string; level: number }>
    completedChapters?: string[]
    completedQuests?: string[]
  }
  introDialogue: DialogueLine[] // Plays when chapter unlocks
  quests: StoryQuest[] // Quests available in this chapter
  completionDialogue?: DialogueLine[] // Plays when all chapter quests are done
}

// === CHAPTER DEFINITIONS ===

export const chapters: Chapter[] = [
  {
    id: 'chapter_1',
    title: 'A New Beginning',
    description: 'Your journey starts in a small settlement. The mayor has high hopes for this town.',
    order: 1,
    introDialogue: [
      {
        characterId: 'mayor_aldric',
        text: 'Welcome, adventurer! I am Aldric, mayor of this humble settlement.',
        emotion: 'happy'
      },
      {
        characterId: 'mayor_aldric',
        text: 'We\'ve been plagued by monsters from the nearby forest. We need someone brave to defend us.',
        emotion: 'worried'
      },
      {
        characterId: 'mayor_aldric',
        text: 'In return, we\'ll help you grow stronger. Together, we can build something great here!',
        emotion: 'excited',
        choices: [
          {
            text: 'I\'ll help defend the town.',
            effects: { unlockQuest: 'first_defense', addGold: 50 }
          },
          {
            text: 'Tell me more about this place.',
            nextDialogueIndex: 3
          }
        ]
      },
      {
        characterId: 'mayor_aldric',
        text: 'This settlement was founded just a few months ago. We have big dreams, but we need protection to thrive.',
        emotion: 'neutral'
      },
      {
        characterId: 'mayor_aldric',
        text: 'Will you help us?',
        emotion: 'hopeful',
        choices: [
          {
            text: 'Yes, I\'ll protect the town.',
            effects: { unlockQuest: 'first_defense', addGold: 50 }
          }
        ]
      }
    ],
    quests: [
      {
        id: 'first_defense',
        name: 'First Defense',
        description: 'Defeat 10 monsters to prove your worth to the town.',
        characterId: 'mayor_aldric',
        objectives: [
          {
            id: 'kill_10_monsters',
            type: 'kill_monster',
            description: 'Defeat 10 monsters',
            target: 10
          }
        ],
        rewards: {
          gold: 200,
          xp: 100,
          unlockChapter: 'chapter_2'
        },
        onComplete: {
          dialogue: [
            {
              characterId: 'mayor_aldric',
              text: 'Incredible! You\'ve proven yourself a true defender of our town!',
              emotion: 'excited'
            },
            {
              characterId: 'mayor_aldric',
              text: 'With your help, I believe we can expand and prosper. Let\'s upgrade the Town Hall!',
              emotion: 'happy'
            }
          ]
        }
      }
    ]
  },
  
  {
    id: 'chapter_2',
    title: 'Growing Pains',
    description: 'The town is expanding, but new challenges arise.',
    order: 2,
    unlockRequirements: {
      completedChapters: ['chapter_1']
    },
    introDialogue: [
      {
        characterId: 'mayor_aldric',
        text: 'Our town is growing thanks to you! But we need more resources.',
        emotion: 'neutral'
      },
      {
        characterId: 'foreman_grok',
        text: 'Aye, the lumber mill needs upgrading. And we need someone to gather materials.',
        emotion: 'neutral'
      },
      {
        characterId: 'foreman_grok',
        text: 'The forest has what we need, but it\'s dangerous. Think you can handle it?',
        emotion: 'neutral',
        choices: [
          {
            text: 'I\'ll gather the materials.',
            effects: { unlockQuest: 'resource_gathering' }
          }
        ]
      }
    ],
    quests: [
      {
        id: 'resource_gathering',
        name: 'Resource Gathering',
        description: 'Collect wood and stone to help expand the town.',
        characterId: 'foreman_grok',
        objectives: [
          {
            id: 'collect_wood',
            type: 'gather_material',
            description: 'Gather 50 wood',
            target: 50,
            materialId: 'wood'
          },
          {
            id: 'collect_stone',
            type: 'gather_material',
            description: 'Gather 30 stone',
            target: 30,
            materialId: 'stone'
          }
        ],
        rewards: {
          gold: 300,
          xp: 150
        },
        onComplete: {
          dialogue: [
            {
              characterId: 'foreman_grok',
              text: 'Good work! These materials will help us build stronger structures.',
              emotion: 'happy'
            }
          ]
        }
      },
      {
        id: 'upgrade_town_hall',
        name: 'Expand the Town Hall',
        description: 'Upgrade the Town Hall to level 3 to unlock new buildings.',
        characterId: 'mayor_aldric',
        objectives: [
          {
            id: 'town_hall_level_3',
            type: 'upgrade_building',
            description: 'Upgrade Town Hall to level 3',
            target: 3,
            buildingId: 'town_hall'
          }
        ],
        rewards: {
          gold: 500,
          xp: 200,
          unlockChapter: 'chapter_3'
        },
        onComplete: {
          dialogue: [
            {
              characterId: 'mayor_aldric',
              text: 'Excellent! Our town is truly taking shape now.',
              emotion: 'excited'
            },
            {
              characterId: 'mayor_aldric',
              text: 'But I\'ve heard troubling news... stronger monsters have been spotted nearby.',
              emotion: 'worried'
            }
          ]
        }
      }
    ]
  },
  
  {
    id: 'chapter_3',
    title: 'The First Boss',
    description: 'A powerful enemy threatens the town. You must defeat it.',
    order: 3,
    unlockRequirements: {
      completedChapters: ['chapter_2'],
      level: 5
    },
    introDialogue: [
      {
        characterId: 'captain_thorne',
        text: 'Adventurer, we have a serious problem.',
        emotion: 'worried'
      },
      {
        characterId: 'captain_thorne',
        text: 'A Forest Guardian has awakened in Zone 1. It\'s far more powerful than the regular monsters.',
        emotion: 'worried'
      },
      {
        characterId: 'captain_thorne',
        text: 'We need you to defeat it before it attacks the town. Are you ready for this challenge?',
        emotion: 'neutral',
        choices: [
          {
            text: 'I\'ll defeat the Forest Guardian!',
            effects: { unlockQuest: 'defeat_forest_guardian', addXP: 50 }
          },
          {
            text: 'I need to prepare first.',
            nextDialogueIndex: 3
          }
        ]
      },
      {
        characterId: 'captain_thorne',
        text: 'Wise choice. Make sure you\'re well-equipped and have upgraded your stats.',
        emotion: 'neutral'
      },
      {
        characterId: 'captain_thorne',
        text: 'When you\'re ready, face the Forest Guardian. The town is counting on you.',
        emotion: 'neutral',
        choices: [
          {
            text: 'I\'m ready now!',
            effects: { unlockQuest: 'defeat_forest_guardian' }
          }
        ]
      }
    ],
    quests: [
      {
        id: 'defeat_forest_guardian',
        name: 'Defeat the Forest Guardian',
        description: 'Defeat the boss in Zone 1 to protect the town.',
        characterId: 'captain_thorne',
        objectives: [
          {
            id: 'kill_zone_1_boss',
            type: 'defeat_boss',
            description: 'Defeat the Forest Guardian',
            target: 1,
            bossZone: 1
          }
        ],
        rewards: {
          gold: 1000,
          xp: 500,
          items: ['guardian_trophy'],
          unlockChapter: 'chapter_4'
        },
        onComplete: {
          dialogue: [
            {
              characterId: 'captain_thorne',
              text: 'You did it! The Forest Guardian has been defeated!',
              emotion: 'excited'
            },
            {
              characterId: 'captain_thorne',
              text: 'You\'ve proven yourself a true hero. The town is safe... for now.',
              emotion: 'happy'
            },
            {
              characterId: 'mysterious_stranger',
              text: '...Impressive. But this is only the beginning.',
              emotion: 'neutral'
            },
            {
              characterId: 'mayor_aldric',
              text: 'Who was that? No matter - we should celebrate your victory!',
              emotion: 'surprised'
            }
          ]
        }
      }
    ]
  }
]

// Helper functions
export function getChapter(id: string): Chapter | undefined {
  return chapters.find(chapter => chapter.id === id)
}

export function getChapterByOrder(order: number): Chapter | undefined {
  return chapters.find(chapter => chapter.order === order)
}

export function getAvailableChapters(
  playerLevel: number,
  completedChapters: string[],
  completedQuests: string[],
  buildings: Array<{ id: string; level: number }>
): Chapter[] {
  return chapters.filter(chapter => {
    const requirements = chapter.unlockRequirements
    if (!requirements) return true
    
    if (requirements.level && playerLevel < requirements.level) {
      return false
    }
    
    if (requirements.buildings) {
      for (const req of requirements.buildings) {
        const building = buildings.find(b => b.id === req.id)
        if (!building || building.level < req.level) {
          return false
        }
      }
    }
    
    if (requirements.completedChapters) {
      for (const chapterId of requirements.completedChapters) {
        if (!completedChapters.includes(chapterId)) {
          return false
        }
      }
    }
    
    if (requirements.completedQuests) {
      for (const questId of requirements.completedQuests) {
        if (!completedQuests.includes(questId)) {
          return false
        }
      }
    }
    
    return true
  })
}

export function getStoryQuest(questId: string): StoryQuest | undefined {
  for (const chapter of chapters) {
    const quest = chapter.quests.find(q => q.id === questId)
    if (quest) return quest
  }
  return undefined
}

