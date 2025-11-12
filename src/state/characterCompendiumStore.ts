/**
 * Character Compendium Store
 * Tracks all characters the player has met throughout their journey
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character } from '@/data/characters'

export interface MetCharacter {
  characterId: string
  name: string
  title: string
  role: string
  portrait: string
  firstMet: number // timestamp
  lastInteraction: number // timestamp
  timesInteracted: number // How many times you've talked to them
  buildingId?: string
}

interface CharacterCompendiumState {
  metCharacters: Record<string, MetCharacter>
  totalInteractions: number
  
  // Actions
  recordCharacterMeeting: (character: Character) => void
  recordCharacterInteraction: (characterId: string) => void
  hasMetCharacter: (characterId: string) => boolean
  getCharacterStats: (characterId: string) => MetCharacter | null
  getAllMetCharacters: () => MetCharacter[]
  getRecentMeetings: (limit?: number) => MetCharacter[]
  getCharactersByRole: (role: string) => MetCharacter[]
}

export const useCharacterCompendium = create<CharacterCompendiumState>()(
  persist(
    (set, get) => ({
      metCharacters: {},
      totalInteractions: 0,
      
      recordCharacterMeeting: (character: Character) => {
        const { metCharacters } = get()
        const characterId = character.id
        const now = Date.now()
        
        const existing = metCharacters[characterId]
        
        if (existing) {
          // Update existing entry - increment interaction count
          set({
            metCharacters: {
              ...metCharacters,
              [characterId]: {
                ...existing,
                timesInteracted: existing.timesInteracted + 1,
                lastInteraction: now
              }
            },
            totalInteractions: get().totalInteractions + 1
          })
        } else {
          // New character met!
          const newCharacter: MetCharacter = {
            characterId,
            name: character.name,
            title: character.title,
            role: character.role,
            portrait: character.portrait,
            firstMet: now,
            lastInteraction: now,
            timesInteracted: 1,
            buildingId: character.buildingId
          }
          
          set({
            metCharacters: {
              ...metCharacters,
              [characterId]: newCharacter
            },
            totalInteractions: get().totalInteractions + 1
          })
          
          // Log the new meeting
          import('./logStore').then(({ useLog }) => {
            useLog.getState().addLog('story', `Met ${character.name} - ${character.title}`)
          })
        }
      },
      
      recordCharacterInteraction: (characterId: string) => {
        const { metCharacters } = get()
        const existing = metCharacters[characterId]
        
        if (existing) {
          set({
            metCharacters: {
              ...metCharacters,
              [characterId]: {
                ...existing,
                timesInteracted: existing.timesInteracted + 1,
                lastInteraction: Date.now()
              }
            },
            totalInteractions: get().totalInteractions + 1
          })
        }
      },
      
      hasMetCharacter: (characterId: string) => {
        return !!get().metCharacters[characterId]
      },
      
      getCharacterStats: (characterId: string) => {
        return get().metCharacters[characterId] || null
      },
      
      getAllMetCharacters: () => {
        return Object.values(get().metCharacters).sort((a, b) => b.lastInteraction - a.lastInteraction)
      },
      
      getRecentMeetings: (limit = 10) => {
        return get().getAllMetCharacters()
          .filter(c => c.timesInteracted === 1) // Only first meetings
          .slice(0, limit)
      },
      
      getCharactersByRole: (role: string) => {
        return Object.values(get().metCharacters)
          .filter(c => c.role === role)
          .sort((a, b) => a.name.localeCompare(b.name))
      }
    }),
    {
      name: 'character-compendium-store'
    }
  )
)

