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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text m-0">Daily Quests</h2>
        <div className="text-sm text-muted">
          Progress: {completedQuests}/{quests.length} completed
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-text m-0 mb-2">🔥 Login Streak: {loginStreak} days</h3>
          {loginStreak > 0 && (
            <div className="text-sm">
              {loginStreak % 7 === 0 ? (
                <div className="text-gold font-bold">
                  🎉 Milestone Reached! +{Math.floor(loginStreak / 7)} Prestige Token{loginStreak / 7 === 1 ? '' : 's'}!
                </div>
              ) : (
                <div className="text-muted">
                  {daysUntilMilestone} more day{daysUntilMilestone === 1 ? '' : 's'} until next milestone (Day {nextMilestone})
                </div>
              )}
            </div>
          )}
        </div>

        {loginReward && loginStreak > 0 && (
          <div className="bg-black/30 rounded px-3 py-2 mb-3 flex items-center gap-2 text-sm">
            <span className="text-muted">Today's Bonus:</span>
            <span className="text-gold font-bold">
              💰 +{loginReward.gold} Gold
              {loginReward.prestigeTokens && ` | 🌟 +${loginReward.prestigeTokens} Prestige Tokens`}
            </span>
          </div>
        )}

        <div>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={`streak-day-${i}`}
                className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${
                  i < (loginStreak % 7)
                    ? 'bg-orange-500 text-white'
                    : 'bg-black/30 text-muted'
                } ${i === 6 ? 'ring-2 ring-gold' : ''}`}
              >
                {i === 6 ? '🌟' : ''}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted">
            <span>Day {Math.floor(loginStreak / 7) * 7 + 1}</span>
            <span>Day {Math.floor(loginStreak / 7) * 7 + 7} (Milestone)</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-sm text-muted m-0">
          Complete daily challenges to earn gold, experience, and materials.
          Quests reset every day at midnight. You have <strong>{maxRerolls - rerollsUsed}</strong> reroll(s) remaining.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {quests.map(quest => (
          <div
            key={quest.id}
            className={`bg-panel border rounded-lg p-4 transition-all ${
              quest.claimed
                ? 'border-green-500/30 bg-green-500/5 opacity-75'
                : quest.completed
                  ? 'border-gold/50 bg-gold/5'
                  : 'border-white/10'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-text m-0">{quest.title}</h3>
              <div className="bg-purple/20 text-purple px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                {quest.type}
              </div>
            </div>

            <div className="text-sm text-muted mb-3">
              {quest.description}
            </div>

            <div className="mb-3">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted text-right">
                {quest.progress} / {quest.target}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs font-bold text-muted uppercase mb-1">Rewards:</div>
              <div className="flex flex-wrap gap-2">
                {quest.reward.gold && (
                  <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs font-medium">💰 {quest.reward.gold}</span>
                )}
                {quest.reward.xp && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">⭐ {quest.reward.xp} XP</span>
                )}
                {quest.reward.materials && Object.entries(quest.reward.materials).map(([material, amount]) => (
                  <span key={material} className="bg-purple/20 text-purple px-2 py-1 rounded text-xs font-medium">
                    📦 {amount} {material}
                  </span>
                ))}
                {quest.reward.prestigeTokens && (
                  <span className="bg-gold/20 text-gold px-2 py-1 rounded text-xs font-medium">🌟 {quest.reward.prestigeTokens} Tokens</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {quest.completed && !quest.claimed && (
                <button
                  className="flex-1 bg-gradient-to-r from-gold to-yellow-600 text-bg font-bold py-2 px-4 rounded cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleClaimReward(quest.id)}
                >
                  Claim Reward
                </button>
              )}

              {!quest.completed && rerollsUsed < maxRerolls && (
                <button
                  className="flex-1 bg-white/10 text-text py-2 px-4 rounded cursor-pointer transition-all hover:bg-white/20"
                  onClick={() => handleReroll(quest.id)}
                >
                  Reroll ({maxRerolls - rerollsUsed} left)
                </button>
              )}

              {quest.claimed && (
                <div className="flex-1 text-center text-green-400 font-bold py-2">✅ Claimed</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}