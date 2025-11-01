import { useAchievements, ACHIEVEMENTS } from '@/state/achievementStore'
import { useState } from 'react'
import './AchievementPanel.css'

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
  
  const getTierClass = (tier: string) => {
    return `achievement-tier-${tier}`
  }
  
  return (
    <div className="achievement-panel">
      <div className="achievement-header">
        <h3>Achievements</h3>
        <div className="achievement-stats">
          <span className="achievement-count">
            {completedCount}/{ACHIEVEMENTS.length} Completed
          </span>
          {unclaimedCount > 0 && (
            <span className="unclaimed-count">
              {unclaimedCount} rewards to claim!
            </span>
          )}
        </div>
      </div>
      
      <div className="achievement-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      <div className="achievement-list">
        {filteredAchievements.map(achievement => {
          const completed = isCompleted(achievement.id)
          const claimed = isClaimed(achievement.id)
          
          const renderStatus = () => {
            if (!completed) {
              return <span className="status-incomplete">In Progress</span>
            }
            
            if (claimed) {
              return <span className="status-claimed">✓ Claimed</span>
            }
            
            return (
              <button
                className="claim-btn"
                onClick={() => handleClaimReward(achievement.id)}
              >
                Claim Reward!
              </button>
            )
          }
          
          return (
            <div
              key={achievement.id}
              className={`achievement-item ${completed ? 'completed' : 'incomplete'} ${getTierClass(achievement.tier)}`}
            >
              <div className="achievement-icon">
                {getTierIcon(achievement.tier)}
              </div>
              
              <div className="achievement-content">
                <div className="achievement-title">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-tier">{achievement.tier}</span>
                </div>
                
                <div className="achievement-description">
                  {achievement.description}
                </div>
                
                <div className="achievement-reward">
                  Reward: {achievement.reward.description}
                </div>
              </div>
              
              <div className="achievement-status">
                {renderStatus()}
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="no-achievements">
          No achievements in this category yet.
        </div>
      )}
    </div>
  )
}