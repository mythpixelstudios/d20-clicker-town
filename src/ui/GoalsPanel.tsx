import { useState } from 'react'
import AchievementPanel from '@/ui/AchievementPanel'
import DailyQuestsPanel from '@/ui/DailyQuestsPanel'
import { useAchievements } from '@/state/achievementStore'
import { useDailyQuests, type DailyQuest } from '@/state/dailyQuestStore'

interface GoalsTabProps {
  id: string
  label: string
  isUnlocked: () => boolean
  hasAlert?: boolean
  content: React.ReactNode
}

export default function GoalsPanel() {
  const [activeSubTab, setActiveSubTab] = useState('achievements')
  const { getUnclaimedRewards } = useAchievements()
  const { quests } = useDailyQuests()
  
  const unclaimedAchievements = getUnclaimedRewards().length
  const completedQuests = quests.filter((q: DailyQuest) => q.completed && !q.claimed).length

  const subTabs: GoalsTabProps[] = [
    {
      id: 'achievements',
      label: 'Achievements',
      isUnlocked: () => true,
      hasAlert: unclaimedAchievements > 0,
      content: <AchievementPanel />
    },
    {
      id: 'daily-quests',
      label: 'Daily Quests',
      isUnlocked: () => true,
      hasAlert: completedQuests > 0,
      content: <DailyQuestsPanel />
    }
  ]

  const renderTabButton = (tab: GoalsTabProps) => {
    const isActive = activeSubTab === tab.id
    const isLocked = !tab.isUnlocked()
    
    return (
      <div key={tab.id} className="tab-wrapper">
        <button
          className={`tab-button ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
          onClick={() => !isLocked && setActiveSubTab(tab.id)}
          disabled={isLocked}
        >
          {tab.label}
          {tab.hasAlert && !isLocked && <span className="alert-dot" />}
          {isLocked && <span className="lock-icon">🔒</span>}
        </button>
      </div>
    )
  }

  const activeTab = subTabs.find(tab => tab.id === activeSubTab) || subTabs[0]

  return (
    <div className="goals-panel">
      <div className="goals-sub-tabs">
        <div className="tab-navigation">
          {subTabs.map(renderTabButton)}
        </div>
        <div className="tab-content">
          {activeTab.content}
        </div>
      </div>
    </div>
  )
}