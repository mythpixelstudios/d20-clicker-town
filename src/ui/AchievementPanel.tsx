import { useAchievements, ACHIEVEMENTS } from '@/state/achievementStore'
import { useState } from 'react'

export default function AchievementPanel() {
  const { 
    isCompleted, 
    isClaimed, 
    claimReward,
    getCompletedCount,
    getUnclaimedRewards 
  } = useAchievements()
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'combat', label: 'Combat' },
    { id: 'progression', label: 'Progression' },
    { id: 'crafting', label: 'Crafting' },
    { id: 'town', label: 'Town' },
    { id: 'general', label: 'General' }
  ]
  
  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(achievement => achievement.category === selectedCategory)
  
  const unclaimedCount = getUnclaimedRewards().length
  const completedCount = getCompletedCount()
  
  const handleClaimReward = (achievementId: string) => {
    claimReward(achievementId)
  }
  
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉'
      case 'silver': return '🥈'
      case 'gold': return '🥇'
      case 'platinum': return '💎'
      default: return '🏆'
    }
  }
  
  const getTierBorderClass = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'border-l-[#cd7f32]'
      case 'silver': return 'border-l-[#c0c0c0]'
      case 'gold': return 'border-l-[#ffd700]'
      case 'platinum': return 'border-l-[#e5e4e2]'
      default: return 'border-l-white/10'
    }
  }

  return (
    <div className="p-5 bg-black/10 rounded-lg max-h-[600px] overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <h3 className="m-0 text-white">Achievements</h3>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[#ccc] text-[0.9em]">
            {completedCount}/{ACHIEVEMENTS.length} Completed
          </span>
          {unclaimedCount > 0 && (
            <span className="text-[#ffd700] text-[0.85em] font-bold animate-pulse">
              {unclaimedCount} rewards to claim!
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-3 py-1.5 border rounded text-[0.85em] transition-all cursor-pointer ${
              selectedCategory === category.id
                ? 'bg-[rgba(100,149,237,0.3)] border-[rgba(100,149,237,0.5)] text-white'
                : 'bg-white/10 border-white/20 text-[#ccc] hover:bg-white/20 hover:text-white'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredAchievements.map(achievement => {
          const completed = isCompleted(achievement.id)
          const claimed = isClaimed(achievement.id)

          const renderStatus = () => {
            if (!completed) {
              return <span className="text-[#ffa500] text-[0.85em]">In Progress</span>
            }

            if (claimed) {
              return <span className="text-[#90ee90] text-[0.9em] font-bold">✓ Claimed</span>
            }

            return (
              <button
                className="px-3 py-1.5 bg-gradient-to-br from-[#ffd700] to-[#ffed4e] text-black border-0 rounded cursor-pointer font-bold text-[0.85em] transition-all hover:from-[#ffed4e] hover:to-[#ffd700] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(255,215,0,0.3)] animate-[glow_2s_infinite]"
                onClick={() => handleClaimReward(achievement.id)}
              >
                Claim Reward!
              </button>
            )
          }

          return (
            <div
              key={achievement.id}
              className={`flex items-center gap-3 p-3 rounded-md border transition-all border-l-4 ${
                completed
                  ? 'bg-[rgba(0,128,0,0.1)] border-[rgba(0,255,0,0.2)]'
                  : 'bg-black/20 border-white/10 opacity-80'
              } ${getTierBorderClass(achievement.tier)}`}
            >
              <div className="text-2xl flex-shrink-0">
                {getTierIcon(achievement.tier)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white text-base">{achievement.name}</span>
                  <span className="text-[0.75em] text-[#aaa] uppercase bg-white/10 px-1.5 py-0.5 rounded">{achievement.tier}</span>
                </div>

                <div className="text-[#ccc] text-[0.9em] mb-1.5 leading-snug">
                  {achievement.description}
                </div>

                <div className="text-[#90ee90] text-[0.85em] font-medium">
                  Reward: {achievement.reward.description}
                </div>
              </div>

              <div className="flex-shrink-0">
                {renderStatus()}
              </div>
            </div>
          )
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center text-[#aaa] italic py-10 px-5">
          No achievements in this category yet.
        </div>
      )}
    </div>
  )
}