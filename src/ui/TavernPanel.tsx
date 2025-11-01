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
    <div className="card">
      <div style={{ marginBottom: '12px' }}>
        <h2>🍺 Tavern</h2>
        <p className="muted">Recruit NPCs and assign them to quests for rewards</p>
      </div>
      
      {/* Tab Navigation - Standard Style */}
      <div className="tab-navigation">
        <div className="tab-wrapper">
          <button 
            className={`tab-button ${selectedTab === 'quests' ? 'active' : ''}`}
            onClick={() => setSelectedTab('quests')}
          >
            Active Quests
            {activeAssignments.length > 0 && <span className="alert-dot" />}
          </button>
        </div>
        <div className="tab-wrapper">
          <button 
            className={`tab-button ${selectedTab === 'npcs' ? 'active' : ''}`}
            onClick={() => setSelectedTab('npcs')}
          >
            NPCs ({ownedNPCs.length})
          </button>
        </div>
      </div>
      
      <div className="tab-content">
        {selectedTab === 'quests' && (
        <div>
          {/* Quest Assignment */}
          <div style={{ 
            marginBottom: '16px', 
            padding: '16px', 
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            borderRadius: '8px' 
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Assign New Quest</h3>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  color: 'var(--muted)', 
                  marginBottom: '6px',
                  fontWeight: '500'
                }}>
                  Select NPC
                </label>
                <select 
                  value={selectedNPC} 
                  onChange={(e) => setSelectedNPC(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1a1f2a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="" style={{ background: '#1a1f2a', color: 'var(--muted)' }}>
                    Choose an available NPC...
                  </option>
                  {ownedNPCs.filter(npc => isNPCAvailable(npc.npcId)).map(npc => (
                    <option 
                      key={npc.npcId} 
                      value={npc.npcId}
                      style={{ background: '#1a1f2a', color: 'var(--text)' }}
                    >
                      {npc.name} - Lv.{npc.level} ({npc.rarity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  color: 'var(--muted)', 
                  marginBottom: '6px',
                  fontWeight: '500'
                }}>
                  Select Quest
                </label>
                <select 
                  value={selectedQuest} 
                  onChange={(e) => setSelectedQuest(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1a1f2a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="" style={{ background: '#1a1f2a', color: 'var(--muted)' }}>
                    Choose a quest...
                  </option>
                  {availableQuests.map(quest => (
                    <option 
                      key={quest.id} 
                      value={quest.id}
                      style={{ background: '#1a1f2a', color: 'var(--text)' }}
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
              style={{
                width: '100%',
                padding: '12px',
                background: (!selectedNPC || !selectedQuest) 
                  ? '#374151' 
                  : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: (!selectedNPC || !selectedQuest) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {!selectedNPC || !selectedQuest ? '⚠ Select NPC and Quest' : '✓ Assign Quest'}
            </button>
          </div>
          
          {/* Active Assignments */}
          <div style={{ marginBottom: '16px' }}>
            <h3>Active Assignments</h3>
            {activeAssignments.length === 0 ? (
              <p className="muted">No active quests</p>
            ) : (
              activeAssignments.map(assignment => {
                const progress = getQuestProgress(assignment.id)
                const remainingTime = Math.max(0, (assignment.startTime + assignment.duration - Date.now()) / 1000)
                
                return (
                  <div key={assignment.id} style={{ padding: '8px', border: '1px solid #333', borderRadius: '4px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{availableNPCs.find(n => n.id === assignment.npcId)?.name || assignment.npcId}</strong>
                        <br />
                        <span className="muted">{availableQuests.find(q => q.id === assignment.questId)?.name || assignment.questId}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>{formatTime(Math.floor(remainingTime))}</div>
                        <div style={{ width: '100px', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${progress * 100}%`, 
                              height: '100%', 
                              backgroundColor: '#4caf50',
                              transition: 'width 0.5s ease'
                            }}
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
              <h3>Completed Quests</h3>
              {completedAssignments.map(assignment => (
                <div key={assignment.id} style={{ padding: '8px', border: '1px solid #4caf50', borderRadius: '4px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{availableNPCs.find(n => n.id === assignment.npcId)?.name || assignment.npcId}</strong>
                      <br />
                      <span className="muted">{availableQuests.find(q => q.id === assignment.questId)?.name || assignment.questId}</span>
                    </div>
                    <button onClick={() => claimCompletedQuest(assignment.id)}>
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
          <div style={{ marginBottom: '16px' }}>
            <h3>Your NPCs</h3>
            {ownedNPCs.length === 0 ? (
              <p className="muted">No NPCs recruited</p>
            ) : (
              ownedNPCs.map(npc => {
                const isAvailable = isNPCAvailable(npc.npcId)
                const activeAssignment = activeAssignments.find(a => a.npcId === npc.npcId)
                const xpNeeded = calculateXPForLevel(npc, npc.level)
                const xpProgress = (npc.xp / xpNeeded) * 100
                const currentStats = calculateNPCStatsAtLevel(npc, npc.level)
                
                return (
                  <div key={npc.npcId} style={{ padding: '12px', border: '1px solid #333', borderRadius: '4px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ color: getRarityColor(npc.rarity) }}>{npc.name}</strong>
                          <span style={{ 
                            backgroundColor: '#333', 
                            padding: '2px 6px', 
                            borderRadius: '3px', 
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            Lv.{npc.level}
                          </span>
                        </div>
                        <span className="muted" style={{ fontSize: '12px' }}>{npc.description}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {isAvailable ? (
                          <span style={{ color: '#4caf50', fontSize: '12px' }}>✓ Available</span>
                        ) : (
                          <span style={{ color: '#ff9800', fontSize: '12px' }}>
                            ⏱ On Quest
                            {activeAssignment && (
                              <>
                                <br />
                                <small>{availableQuests.find(q => q.id === activeAssignment.questId)?.name}</small>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* XP Bar */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span className="muted">XP: {npc.xp} / {xpNeeded}</span>
                        <span className="muted">Quests: {npc.totalQuestsCompleted}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${xpProgress}%`, 
                            height: '100%', 
                            backgroundColor: '#4caf50',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Friendship Bar */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span className="muted">💖 Friendship</span>
                        <span style={{ 
                          color: npc.friendship >= 80 ? '#e91e63' : npc.friendship >= 50 ? '#ff9800' : '#888',
                          fontWeight: 'bold'
                        }}>
                          {npc.friendship}/100
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${npc.friendship}%`, 
                            height: '100%', 
                            backgroundColor: npc.friendship >= 80 ? '#e91e63' : npc.friendship >= 50 ? '#ff9800' : '#888',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                        XP Multiplier: {(0.5 + npc.friendship * 0.01).toFixed(2)}x
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div style={{ fontSize: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div>
                        <span className="muted">Speed:</span>{' '}
                        <span style={{ color: '#4caf50' }}>{currentStats.speed.toFixed(2)}x</span>
                      </div>
                      <div>
                        <span className="muted">Yield:</span>{' '}
                        <span style={{ color: '#4caf50' }}>{currentStats.yield.toFixed(2)}x</span>
                      </div>
                      <div>
                        <span className="muted">Traits:</span>{' '}
                        <span>{npc.traits.map(t => t.name).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
          {/* Available NPCs to Recruit */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px solid #444' }}>
            <h3 style={{ color: 'var(--gold)', marginBottom: '12px' }}>🎯 Recruit NPCs</h3>
            
            {/* Constitution Info Banner */}
            <div style={{ 
              padding: '8px', 
              backgroundColor: '#1a2332', 
              borderRadius: '4px', 
              marginBottom: '12px',
              fontSize: '12px',
              border: '1px solid #2a4060'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>🛡️</span>
                <strong>Your Constitution: {constitutionStat}</strong>
              </div>
              <div className="muted" style={{ fontSize: '11px' }}>
                • Better recruitment chances for rare NPCs<br/>
                • Starting friendship: {Math.min(100, 20 + constitutionStat)}/100<br/>
                • Friendship gain per quest: +{Math.min(3, 1 + Math.floor(constitutionStat / 10))}<br/>
                • Boss damage bonus: +{(constitutionStat * 3).toFixed(0)}%
              </div>
            </div>
            
            {availableNPCs.filter(npc => !ownedNPCs.some(owned => owned.npcId === npc.id)).length === 0 ? (
              <p className="muted">No NPCs available to recruit at the moment.</p>
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
                  <div key={npc.id} style={{ padding: '12px', border: '1px solid #333', borderRadius: '4px', marginBottom: '8px', backgroundColor: '#1a1a1a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ color: getRarityColor(npc.rarity), fontSize: '14px' }}>{npc.name}</strong>
                          <span style={{ 
                            marginLeft: '8px', 
                            padding: '2px 6px', 
                            backgroundColor: chanceColor + '22',
                            border: `1px solid ${chanceColor}`,
                            borderRadius: '3px',
                            fontSize: '11px',
                            color: chanceColor,
                            fontWeight: 'bold'
                          }}>
                            {(recruitChance * 100).toFixed(0)}% Chance
                          </span>
                        </div>
                        <span className="muted" style={{ fontSize: '12px' }}>{npc.description}</span>
                        <div style={{ marginTop: '6px', fontSize: '11px' }}>
                          <div style={{ color: '#8bc34a' }}>
                            ⚡ Speed: {npc.baseStats.speed}x | 💎 Yield: {npc.baseStats.yield}x
                          </div>
                          <div style={{ color: '#64b5f6', marginTop: '2px' }}>
                            ✨ Traits: {npc.traits.map(t => t.name).join(', ')}
                          </div>
                          <div style={{ color: '#ffb74d', marginTop: '2px' }}>
                            💖 Starting Friendship: {startingFriendship}/100
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                        <div style={{ 
                          marginBottom: '6px', 
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: canAfford ? 'var(--gold)' : '#888'
                        }}>
                          💰 {cost.toLocaleString()}
                        </div>
                        <button 
                          onClick={() => handleRecruitNPC(npc.id)}
                          disabled={!canAfford}
                          style={{ 
                            backgroundColor: canAfford ? '#4caf50' : '#444',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            padding: '6px 12px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            color: canAfford ? '#fff' : '#888',
                            fontWeight: 'bold'
                          }}
                        >
                          {canAfford ? 'Recruit' : 'Not Enough Gold'}
                        </button>
                        {recruitChance < 0.99 && (
                          <div style={{ 
                            marginTop: '4px', 
                            fontSize: '10px', 
                            color: '#888',
                            fontStyle: 'italic'
                          }}>
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