import { useState, useEffect } from 'react'
import { useTavern, startQuestProcessing } from '@/state/tavernStore'
import { useEconomy } from '@/state/economyStore'
import { useChar } from '@/state/charStore'
import { calculateNPCStatsAtLevel, calculateXPForLevel, calculateRecruitmentChance } from '@/data/npcs'
import type { NPC } from '@/data/npcs'

export default function TavernPanel() {
  const [selectedTab, setSelectedTab] = useState<'quests' | 'npcs'>('quests')
  const [selectedNPC, setSelectedNPC] = useState<string>('')
  const [selectedQuest, setSelectedQuest] = useState<string>('')
  
  const {
    assignNPCToQuest,
    claimCompletedQuest,
    getActiveAssignments,
    getCompletedAssignments,
    isNPCAvailable,
    getQuestProgress,
    recruitNPC,
    getAvailableNPCs,
    getAvailableQuests,
    getOwnedNPCs
  } = useTavern()
  
  const { gold } = useEconomy()
  const { getTotalStats } = useChar()
  const totalStats = getTotalStats()
  const constitutionStat = totalStats.con || 0
  
  // Start quest processing when component mounts
  useEffect(() => {
    startQuestProcessing()
  }, [])
  
  const activeAssignments = getActiveAssignments()
  const completedAssignments = getCompletedAssignments()
  const availableNPCs = getAvailableNPCs()
  const availableQuests = getAvailableQuests()
  const ownedNPCs = getOwnedNPCs()
  
  // Debug: Log available NPCs
  console.log('Available NPCs:', availableNPCs.map(n => n.id))
  console.log('Owned NPCs:', ownedNPCs.map(n => n.npcId))
  console.log('Recruitable NPCs:', availableNPCs.filter(npc => !ownedNPCs.some(owned => owned.npcId === npc.id)).map(n => n.id))
  
  const handleAssignQuest = () => {
    if (selectedNPC && selectedQuest) {
      const success = assignNPCToQuest(selectedNPC, selectedQuest)
      if (success) {
        setSelectedNPC('')
        setSelectedQuest('')
      }
    }
  }
  
  const handleRecruitNPC = (npcId: string) => {
    recruitNPC(npcId)
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  const getRarityColor = (rarity: NPC['rarity']) => {
    switch (rarity) {
      case 'common': return '#888'
      case 'uncommon': return '#4caf50'
      case 'rare': return '#2196f3'
      case 'epic': return '#9c27b0'
      case 'legendary': return '#ff9800'
      default: return '#888'
    }
  }
  
  return (
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card">
      <div className="mb-3">
        <h2 className="text-xl font-bold text-text m-0 mb-1">🍺 Tavern</h2>
        <p className="text-sm text-muted m-0">Recruit NPCs and assign them to quests for rewards</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b border-white/10">
        <div className="relative">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'quests'
                ? 'text-text border-gold bg-white/5'
                : 'text-muted border-transparent hover:text-text hover:bg-white/5'
            }`}
            onClick={() => setSelectedTab('quests')}
          >
            Active Quests
            {activeAssignments.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full animate-pulse" />}
          </button>
        </div>
        <div className="relative">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'npcs'
                ? 'text-text border-gold bg-white/5'
                : 'text-muted border-transparent hover:text-text hover:bg-white/5'
            }`}
            onClick={() => setSelectedTab('npcs')}
          >
            NPCs ({ownedNPCs.length})
          </button>
        </div>
      </div>

      <div>
        {selectedTab === 'quests' && (
        <div>
          {/* Quest Assignment */}
          <div className="mb-4 p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-lg">
            <h3 className="text-base font-bold text-text m-0 mb-3">Assign New Quest</h3>
            <div className="flex flex-col gap-3 mb-3">
              <div>
                <label className="block text-xs text-muted mb-1.5 font-medium">
                  Select NPC
                </label>
                <select
                  value={selectedNPC}
                  onChange={(e) => setSelectedNPC(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#1a1f2a] border border-white/[0.12] rounded-lg text-text text-sm cursor-pointer transition-all"
                >
                  <option value="">
                    Choose an available NPC...
                  </option>
                  {ownedNPCs.filter(npc => isNPCAvailable(npc.npcId)).map(npc => (
                    <option
                      key={npc.npcId}
                      value={npc.npcId}
                    >
                      {npc.name} - Lv.{npc.level} ({npc.rarity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5 font-medium">
                  Select Quest
                </label>
                <select
                  value={selectedQuest}
                  onChange={(e) => setSelectedQuest(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#1a1f2a] border border-white/[0.12] rounded-lg text-text text-sm cursor-pointer transition-all"
                >
                  <option value="">
                    Choose a quest...
                  </option>
                  {availableQuests.map(quest => (
                    <option
                      key={quest.id}
                      value={quest.id}
                    >
                      {quest.name} ({formatTime(quest.baseDuration)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleAssignQuest}
              disabled={!selectedNPC || !selectedQuest}
              className={`w-full py-3 rounded-lg text-white text-sm font-bold transition-all ${
                (!selectedNPC || !selectedQuest)
                  ? 'bg-gray-700 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-green-500 to-green-600 cursor-pointer hover:scale-105'
              }`}
            >
              {!selectedNPC || !selectedQuest ? '⚠ Select NPC and Quest' : '✓ Assign Quest'}
            </button>
          </div>

          {/* Active Assignments */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-text mb-2">Active Assignments</h3>
            {activeAssignments.length === 0 ? (
              <p className="text-sm text-muted">No active quests</p>
            ) : (
              activeAssignments.map(assignment => {
                const progress = getQuestProgress(assignment.id)
                const remainingTime = Math.max(0, (assignment.startTime + assignment.duration - Date.now()) / 1000)

                return (
                  <div key={assignment.id} className="p-2 border border-white/20 rounded mb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-text">{availableNPCs.find(n => n.id === assignment.npcId)?.name || assignment.npcId}</strong>
                        <br />
                        <span className="text-sm text-muted">{availableQuests.find(q => q.id === assignment.questId)?.name || assignment.questId}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-text mb-1">{formatTime(Math.floor(remainingTime))}</div>
                        <div className="w-24 h-2 bg-black/30 rounded overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Completed Assignments */}
          {completedAssignments.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-text mb-2">Completed Quests</h3>
              {completedAssignments.map(assignment => (
                <div key={assignment.id} className="p-2 border border-green-500 rounded mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-text">{availableNPCs.find(n => n.id === assignment.npcId)?.name || assignment.npcId}</strong>
                      <br />
                      <span className="text-sm text-muted">{availableQuests.find(q => q.id === assignment.questId)?.name || assignment.questId}</span>
                    </div>
                    <button
                      className="bg-gold hover:bg-yellow-600 text-bg font-bold py-2 px-4 rounded cursor-pointer transition-colors"
                      onClick={() => claimCompletedQuest(assignment.id)}
                    >
                      Claim Rewards
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {selectedTab === 'npcs' && (
        <div>
          {/* Owned NPCs */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-text mb-2">Your NPCs</h3>
            {ownedNPCs.length === 0 ? (
              <p className="text-sm text-muted">No NPCs recruited</p>
            ) : (
              ownedNPCs.map(npc => {
                const isAvailable = isNPCAvailable(npc.npcId)
                const activeAssignment = activeAssignments.find(a => a.npcId === npc.npcId)
                const xpNeeded = calculateXPForLevel(npc, npc.level)
                const xpProgress = (npc.xp / xpNeeded) * 100
                const currentStats = calculateNPCStatsAtLevel(npc, npc.level)

                return (
                  <div key={npc.npcId} className="p-3 border border-white/20 rounded mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <strong style={{ color: getRarityColor(npc.rarity) }}>{npc.name}</strong>
                          <span className="bg-black/30 px-1.5 py-0.5 rounded text-[11px] font-bold">
                            Lv.{npc.level}
                          </span>
                        </div>
                        <span className="text-xs text-muted">{npc.description}</span>
                      </div>
                      <div className="text-right">
                        {isAvailable ? (
                          <span className="text-xs text-green-500">✓ Available</span>
                        ) : (
                          <span className="text-xs text-orange-500">
                            ⏱ On Quest
                            {activeAssignment && (
                              <>
                                <br />
                                <small className="text-[10px]">{availableQuests.find(q => q.id === activeAssignment.questId)?.name}</small>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-muted">XP: {npc.xp} / {xpNeeded}</span>
                        <span className="text-muted">Quests: {npc.totalQuestsCompleted}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#222] rounded overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${xpProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Friendship Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-muted">💖 Friendship</span>
                        <span
                          className="font-bold"
                          style={{ color: npc.friendship >= 80 ? '#e91e63' : npc.friendship >= 50 ? '#ff9800' : '#888' }}
                        >
                          {npc.friendship}/100
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#222] rounded overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${npc.friendship}%`,
                            backgroundColor: npc.friendship >= 80 ? '#e91e63' : npc.friendship >= 50 ? '#ff9800' : '#888'
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        XP Multiplier: {(0.5 + npc.friendship * 0.01).toFixed(2)}x
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-xs flex gap-4 flex-wrap">
                      <div>
                        <span className="text-muted">Speed:</span>{' '}
                        <span className="text-green-500">{currentStats.speed.toFixed(2)}x</span>
                      </div>
                      <div>
                        <span className="text-muted">Yield:</span>{' '}
                        <span className="text-green-500">{currentStats.yield.toFixed(2)}x</span>
                      </div>
                      <div>
                        <span className="text-muted">Traits:</span>{' '}
                        <span className="text-text">{npc.traits.map(t => t.name).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Available NPCs to Recruit */}
          <div className="mt-6 pt-4 border-t-2 border-white/30">
            <h3 className="text-base font-bold text-gold mb-3">🎯 Recruit NPCs</h3>

            {/* Constitution Info Banner */}
            <div className="p-2 bg-blue-900/30 rounded border border-blue-500/40 mb-3 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🛡️</span>
                <strong className="text-text">Your Constitution: {constitutionStat}</strong>
              </div>
              <div className="text-muted text-[11px]">
                • Better recruitment chances for rare NPCs<br/>
                • Starting friendship: {Math.min(100, 20 + constitutionStat)}/100<br/>
                • Friendship gain per quest: +{Math.min(3, 1 + Math.floor(constitutionStat / 10))}<br/>
                • Boss damage bonus: +{(constitutionStat * 3).toFixed(0)}%
              </div>
            </div>

            {availableNPCs.filter(npc => !ownedNPCs.some(owned => owned.npcId === npc.id)).length === 0 ? (
              <p className="text-sm text-muted">No NPCs available to recruit at the moment.</p>
            ) : (
              availableNPCs.filter(npc => !ownedNPCs.some(owned => owned.npcId === npc.id)).map(npc => {
                const cost = npc.recruitmentCost.gold
                const canAfford = gold >= cost
                const recruitChance = calculateRecruitmentChance(npc, constitutionStat)
                const startingFriendship = Math.min(100, 20 + constitutionStat)

                // Determine chance color
                let chanceColor = '#888'
                if (recruitChance >= 0.9) chanceColor = '#4caf50' // Green - Very High
                else if (recruitChance >= 0.75) chanceColor = '#8bc34a' // Light Green - High
                else if (recruitChance >= 0.6) chanceColor = '#ffc107' // Yellow - Moderate
                else if (recruitChance >= 0.4) chanceColor = '#ff9800' // Orange - Low
                else chanceColor = '#f44336' // Red - Very Low

                return (
                  <div key={npc.id} className="p-3 border border-white/20 rounded mb-2 bg-[#1a1a1a]">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="mb-1">
                          <strong className="text-sm" style={{ color: getRarityColor(npc.rarity) }}>{npc.name}</strong>
                          <span
                            className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-bold"
                            style={{
                              backgroundColor: chanceColor + '22',
                              border: `1px solid ${chanceColor}`,
                              color: chanceColor
                            }}
                          >
                            {(recruitChance * 100).toFixed(0)}% Chance
                          </span>
                        </div>
                        <span className="text-xs text-muted">{npc.description}</span>
                        <div className="mt-1.5 text-[11px]">
                          <div className="text-lime-400">
                            ⚡ Speed: {npc.baseStats.speed}x | 💎 Yield: {npc.baseStats.yield}x
                          </div>
                          <div className="text-blue-400 mt-0.5">
                            ✨ Traits: {npc.traits.map(t => t.name).join(', ')}
                          </div>
                          <div className="text-orange-400 mt-0.5">
                            💖 Starting Friendship: {startingFriendship}/100
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div
                          className="mb-1.5 text-sm font-bold"
                          style={{ color: canAfford ? 'var(--gold)' : '#888' }}
                        >
                          💰 {cost.toLocaleString()}
                        </div>
                        <button
                          onClick={() => handleRecruitNPC(npc.id)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 text-xs rounded font-bold ${
                            canAfford
                              ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Recruit' : 'Not Enough Gold'}
                        </button>
                        {recruitChance < 0.99 && (
                          <div className="mt-1 text-[10px] text-muted italic">
                            {recruitChance < 0.5 ? '⚠️ May fail' : 'Can retry if failed'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}