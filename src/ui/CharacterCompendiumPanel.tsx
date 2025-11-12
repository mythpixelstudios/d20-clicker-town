/**
 * Character Compendium Panel
 * Displays all characters the player has met
 */

import React, { useState } from 'react'
import { useCharacterCompendium } from '@/state/characterCompendiumStore'
import { useStory } from '@/state/storyStore'

export default function CharacterCompendiumPanel() {
  const {
    metCharacters,
    totalInteractions,
    getAllMetCharacters,
    getRecentMeetings,
    getCharactersByRole
  } = useCharacterCompendium()
  
  const { openBuildingDetail } = useStory()
  
  const [filterRole, setFilterRole] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'interactions'>('recent')
  
  const allCharacters = getAllMetCharacters()
  const recentMeetings = getRecentMeetings(5)
  
  // Filter by role
  let filteredCharacters = filterRole
    ? getCharactersByRole(filterRole)
    : allCharacters
  
  // Sort characters
  switch (sortBy) {
    case 'name':
      filteredCharacters.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'interactions':
      filteredCharacters.sort((a, b) => b.timesInteracted - a.timesInteracted)
      break
    case 'recent':
    default:
      filteredCharacters.sort((a, b) => b.lastInteraction - a.lastInteraction)
      break
  }
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }
  
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'building_representative': 'Building Representative',
      'story_npc': 'Story Character',
      'quest_giver': 'Quest Giver',
      'merchant': 'Merchant'
    }
    return labels[role] || role
  }
  
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'building_representative': 'bg-blue-500/20 text-blue-400',
      'story_npc': 'bg-purple/20 text-purple',
      'quest_giver': 'bg-gold/20 text-gold',
      'merchant': 'bg-green-500/20 text-green-400'
    }
    return colors[role] || 'bg-white/20 text-white'
  }
  
  const handleVisitCharacter = (character: any) => {
    if (character.buildingId) {
      openBuildingDetail(character.buildingId)
    }
  }
  
  // Get unique roles for filtering
  const availableRoles = Array.from(new Set(allCharacters.map(c => c.role)))
  
  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-purple/10 to-blue-500/10 border border-purple/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-text mb-3">Character Compendium</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-gold">{Object.keys(metCharacters).length}</div>
            <div className="text-xs text-muted">Characters Met</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{totalInteractions}</div>
            <div className="text-xs text-muted">Total Interactions</div>
          </div>
        </div>
      </div>
      
      {/* Recent Meetings */}
      {recentMeetings.length > 0 && (
        <div className="bg-gold/5 border border-gold/30 rounded-lg p-3">
          <h3 className="text-sm font-bold text-gold mb-2">✨ Recently Met</h3>
          <div className="flex flex-wrap gap-2">
            {recentMeetings.map(char => (
              <div
                key={char.characterId}
                className="bg-black/30 rounded px-2 py-1 text-xs flex items-center gap-1"
              >
                <span className="text-lg">{char.portrait}</span>
                <span className="text-text">{char.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          <button
            onClick={() => setFilterRole(null)}
            className={`px-3 py-1.5 text-xs rounded transition-all ${
              filterRole === null
                ? 'bg-gold text-bg font-bold'
                : 'bg-white/10 text-muted hover:bg-white/20'
            }`}
          >
            All Roles
          </button>
          {availableRoles.map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 text-xs rounded transition-all ${
                filterRole === role
                  ? 'bg-gold text-bg font-bold'
                  : 'bg-white/10 text-muted hover:bg-white/20'
              }`}
            >
              {getRoleLabel(role)}
            </button>
          ))}
        </div>
        
        <div className="ml-auto flex gap-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-panel border border-white/20 rounded px-2 py-1 text-xs text-text"
          >
            <option value="recent">Recent</option>
            <option value="name">Name</option>
            <option value="interactions">Most Interactions</option>
          </select>
        </div>
      </div>
      
      {/* Character List */}
      <div className="flex flex-wrap gap-3">
        {filteredCharacters.length === 0 ? (
          <div className="w-full text-center py-8">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-muted">
              {filterRole
                ? `No ${getRoleLabel(filterRole)}s met yet.`
                : 'No characters met yet. Start your adventure to meet new people!'
              }
            </p>
          </div>
        ) : (
          filteredCharacters.map(character => (
            <div
              key={character.characterId}
              className="flex-1 min-w-[280px] max-w-[400px] bg-panel border border-white/10 rounded-lg p-4 hover:border-gold/30 transition-all"
            >
              {/* Character Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="text-5xl">{character.portrait}</div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-text m-0">{character.name}</h3>
                  <p className="text-sm text-muted m-0">{character.title}</p>
                  <div className="mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getRoleColor(character.role)}`}>
                      {getRoleLabel(character.role)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-black/20 rounded p-2">
                  <div className="text-muted">First Met</div>
                  <div className="text-text font-bold">{formatDate(character.firstMet)}</div>
                </div>
                <div className="bg-black/20 rounded p-2">
                  <div className="text-muted">Interactions</div>
                  <div className="text-text font-bold">{character.timesInteracted}</div>
                </div>
              </div>
              
              {/* Last Interaction */}
              <div className="text-xs text-muted mb-3">
                Last seen: {formatDate(character.lastInteraction)}
              </div>
              
              {/* Visit Button */}
              {character.buildingId && (
                <button
                  onClick={() => handleVisitCharacter(character)}
                  className="w-full bg-gradient-to-r from-purple to-purple/80 hover:from-purple/80 hover:to-purple text-white font-bold py-2 px-4 rounded text-sm transition-all"
                >
                  Visit at Building
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

