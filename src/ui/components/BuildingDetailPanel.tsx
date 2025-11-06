/**
 * Building Detail Panel
 * Overlays on the right side when a building is clicked
 * Shows building representative, available quests, and storylines
 */

import { useStory } from '@/state/storyStore'
import { useTown } from '@/state/townStore'
import { getCharacterByBuilding } from '@/data/characters'
import { chapters } from '@/data/chapters'
import type { StoryQuest } from '@/data/chapters'

export default function BuildingDetailPanel() {
  const { selectedBuilding, closeBuildingDetail, startDialogue, startStoryQuest, isQuestActive, isQuestCompleted, activeStoryQuests } = useStory()
  const { getBuildingData } = useTown()
  
  if (!selectedBuilding) return null
  
  const building = getBuildingData(selectedBuilding)
  const representative = getCharacterByBuilding(selectedBuilding)
  
  if (!building) return null
  
  // Find quests related to this building
  const buildingQuests: StoryQuest[] = []
  chapters.forEach(chapter => {
    chapter.quests.forEach(quest => {
      if (quest.characterId === representative?.id) {
        buildingQuests.push(quest)
      }
    })
  })
  
  const handleTalkToRepresentative = () => {
    if (!representative) return
    
    // Create a greeting dialogue
    const greetingDialogue = [
      {
        characterId: representative.id,
        text: `Greetings! I'm ${representative.name}, ${representative.title}. How can I help you today?`,
        emotion: 'neutral' as const
      }
    ]
    
    startDialogue(greetingDialogue, { buildingId: selectedBuilding })
  }
  
  const handleStartQuest = (questId: string) => {
    const quest = buildingQuests.find(q => q.id === questId)
    if (!quest) return
    
    // Find which chapter this quest belongs to
    let questChapterId = ''
    for (const chapter of chapters) {
      if (chapter.quests.some(q => q.id === questId)) {
        questChapterId = chapter.id
        break
      }
    }
    
    if (questChapterId) {
      startStoryQuest(questId, questChapterId)
      
      // Show quest start dialogue
      if (representative) {
        const questStartDialogue = [
          {
            characterId: representative.id,
            text: `Excellent! I knew I could count on you. ${quest.description}`,
            emotion: 'happy' as const
          }
        ]
        startDialogue(questStartDialogue, { buildingId: selectedBuilding, questId })
      }
    }
  }
  
  const getQuestProgress = (questId: string) => {
    const activeQuest = activeStoryQuests.find(q => q.questId === questId)
    if (!activeQuest) return null
    
    const completedObjectives = activeQuest.objectives.filter(obj => (obj.current || 0) >= obj.target).length
    const totalObjectives = activeQuest.objectives.length
    
    return { completed: completedObjectives, total: totalObjectives }
  }
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[920] backdrop-blur-sm"
        onClick={closeBuildingDetail}
      />

      {/* Panel sliding from right */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-panel z-[930] shadow-2xl border-l border-white/20 flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple/20 to-purple/10 border-b border-white/10 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-text m-0">{building.name}</h2>
              <p className="text-sm text-muted mt-1">{building.description}</p>
            </div>
            <button
              onClick={closeBuildingDetail}
              className="text-2xl text-muted hover:text-text transition-colors leading-none"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Representative Section */}
          {representative ? (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text mb-3">Building Representative</h3>
              <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-5xl">{representative.portrait}</div>
                  <div>
                    <h4 className="text-xl font-bold text-text m-0">{representative.name}</h4>
                    <p className="text-sm text-gold m-0">{representative.title}</p>
                  </div>
                </div>
                <p className="text-sm text-muted mb-3">{representative.description}</p>
                <button
                  onClick={handleTalkToRepresentative}
                  className="w-full bg-gradient-to-r from-purple to-purple/80 hover:from-purple/80 hover:to-purple text-white font-bold py-2 px-4 rounded transition-all"
                >
                  💬 Talk to {representative.name}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-muted m-0">No representative assigned to this building yet.</p>
              </div>
            </div>
          )}
          
          {/* Quests Section */}
          {buildingQuests.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-text mb-3">Available Quests</h3>
              <div className="flex flex-col gap-3">
                {buildingQuests.map(quest => {
                  const isActive = isQuestActive(quest.id)
                  const isCompleted = isQuestCompleted(quest.id)
                  const progress = getQuestProgress(quest.id)
                  
                  return (
                    <div
                      key={quest.id}
                      className={`bg-black/20 border rounded-lg p-4 ${
                        isCompleted
                          ? 'border-green-500/50 bg-green-500/5'
                          : isActive
                          ? 'border-gold/50 bg-gold/5'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-bold text-text m-0">{quest.name}</h4>
                        {isCompleted && <span className="text-green-400 text-sm">✓ Completed</span>}
                        {isActive && !isCompleted && <span className="text-gold text-sm">⏳ Active</span>}
                      </div>
                      
                      <p className="text-sm text-muted mb-3">{quest.description}</p>
                      
                      {/* Objectives */}
                      {isActive && progress && (
                        <div className="mb-3">
                          <p className="text-xs text-muted mb-2">
                            Progress: {progress.completed}/{progress.total} objectives
                          </p>
                          <div className="space-y-1">
                            {activeStoryQuests.find(q => q.questId === quest.id)?.objectives.map(obj => (
                              <div key={obj.id} className="flex items-center gap-2 text-xs">
                                <span className={(obj.current || 0) >= obj.target ? 'text-green-400' : 'text-muted'}>
                                  {(obj.current || 0) >= obj.target ? '✓' : '○'}
                                </span>
                                <span className="text-muted">
                                  {obj.description} ({obj.current || 0}/{obj.target})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Rewards */}
                      <div className="flex flex-wrap gap-2 mb-3 text-xs">
                        {quest.rewards.gold && (
                          <span className="bg-gold/20 text-gold px-2 py-1 rounded">
                            💰 {quest.rewards.gold} Gold
                          </span>
                        )}
                        {quest.rewards.xp && (
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            ⭐ {quest.rewards.xp} XP
                          </span>
                        )}
                        {quest.rewards.items && quest.rewards.items.length > 0 && (
                          <span className="bg-purple/20 text-purple px-2 py-1 rounded">
                            🎁 {quest.rewards.items.length} Items
                          </span>
                        )}
                      </div>
                      
                      {/* Action button */}
                      {!isActive && !isCompleted && (
                        <button
                          onClick={() => handleStartQuest(quest.id)}
                          className="w-full bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-bg font-bold py-2 px-4 rounded transition-all"
                        >
                          Accept Quest
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {buildingQuests.length === 0 && representative && (
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-muted m-0">No quests available at this time. Check back later!</p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

