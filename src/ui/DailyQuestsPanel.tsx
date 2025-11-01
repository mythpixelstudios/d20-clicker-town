import React, { useEffect } from 'react'
import { useDailyQuests } from '../state/dailyQuestStore'
import { useChar } from '../state/charStore'
import { useEconomy } from '../state/economyStore'
import { useZoneProgression } from '../state/zoneProgressionStore'
import { logDailyQuest } from '../state/logStore'

export default function DailyQuestsPanel() {
  const { 
    quests, 
    rerollsUsed, 
    maxRerolls, 
    loginStreak,
    generateDailyQuests,
    claimQuestReward,
    rerollQuest,
    checkDailyLogin,
    getLoginStreakReward
  } = useDailyQuests()
  
  const { addXP } = useChar()
  const { addGold, addMaterial } = useEconomy()

  // Check for daily login and generate quests on component mount
  useEffect(() => {
    checkDailyLogin()
    generateDailyQuests()
  }, [checkDailyLogin, generateDailyQuests])

  const handleClaimReward = (questId: string) => {
    const reward = claimQuestReward(questId)
    if (!reward) return
    
    // Find the quest to get its name
    const quest = quests.find(q => q.id === questId)
    const questName = quest?.title || 'Quest'

    // Apply rewards to player
    let rewardText = ''
    if (reward.gold) {
      addGold(reward.gold)
      rewardText += `+${reward.gold} Gold`
    }
    if (reward.xp) {
      addXP(reward.xp)
      if (rewardText) rewardText += ', '
      rewardText += `+${reward.xp} XP`
    }
    if (reward.materials) {
      for (const [material, amount] of Object.entries(reward.materials)) {
        addMaterial(material, amount)
        if (rewardText) rewardText += ', '
        rewardText += `+${amount} ${material}`
      }
    }
    if (reward.prestigeTokens) {
      // Add prestige tokens
      useZoneProgression.setState(state => ({
        prestigeTokens: state.prestigeTokens + (reward.prestigeTokens || 0)
      }))
      if (rewardText) rewardText += ', '
      rewardText += `+${reward.prestigeTokens} Prestige Tokens`
    }
    
    // Log the quest completion
    logDailyQuest(questName, rewardText)
  }

  const handleReroll = (questId: string) => {
    if (rerollsUsed >= maxRerolls) return
    rerollQuest(questId)
  }

  const loginReward = getLoginStreakReward()

  const completedQuests = quests.filter(q => q.completed).length
  
  // Calculate streak milestones
  const nextMilestone = Math.ceil((loginStreak + 1) / 7) * 7
  const daysUntilMilestone = nextMilestone - loginStreak

  return (
    <div className="daily-quests-panel">
      <div className="daily-quests-header">
        <h2>Daily Quests</h2>
        <div className="quest-stats">
          <div className="quest-progress">
            Progress: {completedQuests}/{quests.length} completed
          </div>
        </div>
      </div>

      <div className="login-streak-section">
        <div className="streak-header">
          <h3>🔥 Login Streak: {loginStreak} days</h3>
          {loginStreak > 0 && (
            <div className="streak-info">
              {loginStreak % 7 === 0 ? (
                <div className="milestone-reached">
                  🎉 Milestone Reached! +{Math.floor(loginStreak / 7)} Prestige Token{loginStreak / 7 === 1 ? '' : 's'}!
                </div>
              ) : (
                <div className="next-milestone">
                  {daysUntilMilestone} more day{daysUntilMilestone === 1 ? '' : 's'} until next milestone (Day {nextMilestone})
                </div>
              )}
            </div>
          )}
        </div>
        
        {loginReward && loginStreak > 0 && (
          <div className="daily-streak-reward">
            <span className="reward-label">Today's Bonus:</span>
            <span className="reward-value">
              💰 +{loginReward.gold} Gold
              {loginReward.prestigeTokens && ` | 🌟 +${loginReward.prestigeTokens} Prestige Tokens`}
            </span>
          </div>
        )}
        
        <div className="streak-progress-bar">
          <div className="streak-track">
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={`streak-day-${i}`} 
                className={`streak-day ${i < (loginStreak % 7) ? 'active' : ''} ${i === 6 ? 'milestone' : ''}`}
              >
                {i === 6 ? '🌟' : ''}
              </div>
            ))}
          </div>
          <div className="streak-labels">
            <span>Day {Math.floor(loginStreak / 7) * 7 + 1}</span>
            <span>Day {Math.floor(loginStreak / 7) * 7 + 7} (Milestone)</span>
          </div>
        </div>
      </div>

      <div className="daily-quests-description">
        <p>
          Complete daily challenges to earn gold, experience, and materials. 
          Quests reset every day at midnight. You have <strong>{maxRerolls - rerollsUsed}</strong> reroll(s) remaining.
        </p>
      </div>

      <div className="daily-quests-grid">
        {quests.map(quest => (
          <div key={quest.id} className={`daily-quest-card ${quest.completed ? 'completed' : ''} ${quest.claimed ? 'claimed' : ''}`}>
            <div className="quest-header">
              <h3>{quest.title}</h3>
              <div className="quest-type-badge">{quest.type.toUpperCase()}</div>
            </div>
            
            <div className="quest-description">
              {quest.description}
            </div>
            
            <div className="quest-progress-bar">
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                />
              </div>
              <div className="progress-text">
                {quest.progress} / {quest.target}
              </div>
            </div>
            
            <div className="quest-rewards">
              <div className="rewards-label">Rewards:</div>
              <div className="rewards-list">
                {quest.reward.gold && (
                  <span className="quest-reward-item">💰 {quest.reward.gold}</span>
                )}
                {quest.reward.xp && (
                  <span className="quest-reward-item">⭐ {quest.reward.xp} XP</span>
                )}
                {quest.reward.materials && Object.entries(quest.reward.materials).map(([material, amount]) => (
                  <span key={material} className="quest-reward-item">
                    📦 {amount} {material}
                  </span>
                ))}
                {quest.reward.prestigeTokens && (
                  <span className="quest-reward-item">🌟 {quest.reward.prestigeTokens} Tokens</span>
                )}
              </div>
            </div>
            
            <div className="quest-actions">
              {quest.completed && !quest.claimed && (
                <button 
                  className="quest-claim-button"
                  onClick={() => handleClaimReward(quest.id)}
                >
                  Claim Reward
                </button>
              )}
              
              {!quest.completed && rerollsUsed < maxRerolls && (
                <button 
                  className="reroll-button"
                  onClick={() => handleReroll(quest.id)}
                >
                  Reroll ({maxRerolls - rerollsUsed} left)
                </button>
              )}
              
              {quest.claimed && (
                <div className="quest-claimed">✅ Claimed</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}