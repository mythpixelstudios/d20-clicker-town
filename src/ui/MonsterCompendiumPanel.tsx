/**
 * Compendium Panel with Tabs
 * Displays both Monster and Character compendiums
 */

import { useState } from 'react'
import MonsterListPanel from '@/ui/MonsterListPanel'
import CharacterCompendiumPanel from '@/ui/CharacterCompendiumPanel'
import { useMonsterCompendium } from '@/state/monsterCompendiumStore'
import { useCharacterCompendium } from '@/state/characterCompendiumStore'

interface CompendiumTabProps {
  id: string
  label: string
  hasAlert?: boolean
  content: React.ReactNode
}

export default function MonsterCompendiumPanel() {
  const [activeTab, setActiveTab] = useState('monsters')
  const { getRecentDiscoveries } = useMonsterCompendium()
  const { getRecentMeetings } = useCharacterCompendium()

  const recentMonsterDiscoveries = getRecentDiscoveries(5)
  const recentCharacterMeetings = getRecentMeetings(5)

  const tabs: CompendiumTabProps[] = [
    {
      id: 'monsters',
      label: 'Monsters',
      hasAlert: recentMonsterDiscoveries.length > 0,
      content: <MonsterListPanel />
    },
    {
      id: 'characters',
      label: 'Characters',
      hasAlert: recentCharacterMeetings.length > 0,
      content: <CharacterCompendiumPanel />
    }
  ]

  const renderTabButton = (tab: CompendiumTabProps) => {
    const isActive = activeTab === tab.id

    return (
      <div key={tab.id} className="relative">
        <button
          className={`relative px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
            isActive
              ? 'text-text border-gold bg-white/5'
              : 'text-muted border-transparent hover:text-text hover:bg-white/5'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
          {tab.hasAlert && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full animate-pulse" />}
        </button>
      </div>
    )
  }

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0]

  return (
    <div>
      <div>
        <div className="flex gap-1 mb-3 border-b border-white/10 pb-0">
          {tabs.map(renderTabButton)}
        </div>
        <div>
          {currentTab.content}
        </div>
      </div>
    </div>
  )
}