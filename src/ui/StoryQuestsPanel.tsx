/**
 * Story Quests Panel
 * Displays active and completed story quests with progress tracking
 */

import { useStory } from '@/state/storyStore'
import { getStoryQuest } from '@/data/chapters'
import { getCharacter } from '@/data/characters'

export default function StoryQuestsPanel() {
  const { activeStoryQuests, completedStoryQuests, openBuildingDetail } = useStory()
  
  const activeQuests = activeStoryQuests.map(activeQuest => {
    const questData = getStoryQuest(activeQuest.questId)
    if (!questData) return null
    
    const character = getCharacter(questData.characterId)
    const completedObjectives = activeQuest.objectives.filter(obj => (obj.current || 0) >= obj.target).length
    const totalObjectives = activeQuest.objectives.length
    const isComplete = completedObjectives === totalObjectives
    
    return {
      ...activeQuest,
      questData,
      character,
      completedObjectives,
      totalObjectives,
      isComplete
    }
  }).filter(Boolean)
  
  const completedQuestsList = completedStoryQuests.map(questId => {
    const questData = getStoryQuest(questId)
    if (!questData) return null
    
    const character = getCharacter(questData.characterId)
    
    return {
      questId,
      questData,
      character
    }
  }).filter(Boolean)
  
  const handleViewQuestGiver = (characterId: string) => {
    const character = getCharacter(characterId)
    if (character?.buildingId) {
      openBuildingDetail(character.buildingId)
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text m-0">Story Quests</h2>
        <div className="text-sm text-muted">
          {activeQuests.length} active • {completedQuestsList.length} completed
        </div>
      </div>
      
      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">Active Quests</h3>
          <div className="flex flex-col gap-3">
            {activeQuests.map(quest => {
              if (!quest) return null
              
              return (
                <div
                  key={quest.questId}
                  className={`bg-panel border rounded-lg p-4 transition-all ${
                    quest.isComplete
                      ? 'border-gold/50 bg-gold/5 ring-2 ring-gold/20'
                      : 'border-white/10'
                  }`}
                >
                  {/* Quest Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-text m-0 mb-1">
                        {quest.questData.name}
                      </h4>
                      {quest.character && (
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span>{quest.character.portrait}</span>
                          <span>{quest.character.name}</span>
                          <span>•</span>
                          <span>{quest.character.title}</span>
                        </div>
                      )}
                    </div>
                    {quest.isComplete && (
                      <span className="text-gold text-sm font-bold animate-pulse">
                        ✨ Ready to Complete!
                      </span>
                    )}
                  </div>
                  
                  {/* Quest Description */}
                  <p className="text-sm text-muted mb-3">
                    {quest.questData.description}
                  </p>
                  
                  {/* Objectives */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-text">Objectives</span>
                      <span className="text-xs text-muted">
                        {quest.completedObjectives}/{quest.totalObjectives} completed
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {quest.objectives.map(obj => {
                        const isObjComplete = (obj.current || 0) >= obj.target
                        const progress = Math.min(((obj.current || 0) / obj.target) * 100, 100)
                        
                        return (
                          <div key={obj.id} className="bg-black/20 rounded p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={isObjComplete ? 'text-green-400' : 'text-muted'}>
                                {isObjComplete ? '✓' : '○'}
                              </span>
                              <span className="text-xs text-text flex-1">
                                {obj.description}
                              </span>
                              <span className="text-xs text-muted">
                                {obj.current || 0}/{obj.target}
                              </span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1 bg-black/30 rounded-full overflow-hidden ml-5">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isObjComplete ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Rewards */}
                  <div className="mb-3">
                    <span className="text-xs font-bold text-text block mb-2">Rewards</span>
                    <div className="flex flex-wrap gap-2">
                      {quest.questData.rewards.gold && (
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs">
                          💰 {quest.questData.rewards.gold} Gold
                        </span>
                      )}
                      {quest.questData.rewards.xp && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                          ⭐ {quest.questData.rewards.xp} XP
                        </span>
                      )}
                      {quest.questData.rewards.items && quest.questData.rewards.items.length > 0 && (
                        <span className="bg-purple/20 text-purple px-2 py-1 rounded text-xs">
                          🎁 {quest.questData.rewards.items.length} Item{quest.questData.rewards.items.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {quest.questData.rewards.unlockChapter && (
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                          📖 Unlocks Next Chapter
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {quest.isComplete && quest.character && (
                    <button
                      onClick={() => handleViewQuestGiver(quest.questData.characterId)}
                      className="w-full bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-bg font-bold py-2 px-4 rounded transition-all"
                    >
                      Return to {quest.character.name}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* No Active Quests */}
      {activeQuests.length === 0 && (
        <div className="bg-panel border border-white/10 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">📜</div>
          <h3 className="text-lg font-bold text-text mb-2">No Active Story Quests</h3>
          <p className="text-sm text-muted mb-4">
            Visit the Town Hall or other buildings to find new quests and continue your adventure!
          </p>
          <button
            onClick={() => openBuildingDetail('town_hall')}
            className="bg-gradient-to-r from-purple to-purple/80 hover:from-purple/80 hover:to-purple text-white font-bold py-2 px-6 rounded transition-all"
          >
            Visit Town Hall
          </button>
        </div>
      )}
      
      {/* Completed Quests */}
      {completedQuestsList.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">Completed Quests</h3>
          <div className="flex flex-col gap-2">
            {completedQuestsList.map(quest => {
              if (!quest) return null
              
              return (
                <div
                  key={quest.questId}
                  className="bg-panel border border-green-500/30 bg-green-500/5 rounded-lg p-3 opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-text m-0">
                        {quest.questData.name}
                      </h4>
                      {quest.character && (
                        <div className="text-xs text-muted">
                          {quest.character.portrait} {quest.character.name}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-green-400 font-bold">Completed</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

