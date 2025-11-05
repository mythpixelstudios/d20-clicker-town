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
      <div key={tab.id} className="relative">
        <button
          className={`relative px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
            isActive
              ? 'text-text border-gold bg-white/5'
              : isLocked
                ? 'text-muted/50 border-transparent cursor-not-allowed opacity-60'
                : 'text-muted border-transparent hover:text-text hover:bg-white/5'
          }`}
          onClick={() => !isLocked && setActiveSubTab(tab.id)}
          disabled={isLocked}
        >
          {tab.label}
          {tab.hasAlert && !isLocked && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full animate-pulse" />}
          {isLocked && <span className="ml-1.5 text-xs">🔒</span>}
        </button>
      </div>
    )
  }

  const activeTab = subTabs.find(tab => tab.id === activeSubTab) || subTabs[0]

  return (
    <div>
      <div>
        <div className="flex gap-1 mb-3 border-b border-white/10 pb-0">
          {subTabs.map(renderTabButton)}
        </div>
        <div>
          {activeTab.content}
        </div>
      </div>
    </div>
  )
}