import { useState } from 'react'
import PlayerCard from '@/ui/PlayerCard'
import EquipmentPanel from '@/ui/EquipmentPanel'
import InventoryPanel from '@/ui/InventoryPanel2'
import MonsterCompendiumPanel from '@/ui/MonsterCompendiumPanel'
import SkillsPanel from '@/ui/SkillsPanel'
import GuidanceBanner from '@/ui/components/GuidanceBanner'
import { useMonsterCompendium } from '@/state/monsterCompendiumStore'
import { useChar } from '@/state/charStore'

interface CharacterTabProps {
  id: string
  label: string
  isUnlocked: () => boolean
  hasAlert?: boolean
  content: React.ReactNode
}

export default function CharacterPanel() {
  const [activeSubTab, setActiveSubTab] = useState('overview')
  const { getRecentDiscoveries } = useMonsterCompendium()
  const { skillPoints } = useChar()
  
  const recentDiscoveries = getRecentDiscoveries(5)
  const hasNewDiscoveries = recentDiscoveries.length > 0

  const subTabs: CharacterTabProps[] = [
    {
      id: 'overview',
      label: 'Overview',
      isUnlocked: () => true,
      content: (
        <div>
          <GuidanceBanner />
          <PlayerCard/>
          <div className="h-3"/>
          <EquipmentPanel/>
        </div>
      )
    },
    {
      id: 'skills',
      label: 'Skills',
      isUnlocked: () => true,
      hasAlert: skillPoints > 0,
      content: (
        <div>
          <SkillsPanel/>
        </div>
      )
    },
    {
      id: 'inventory',
      label: 'Inventory',
      isUnlocked: () => true,
      content: (
        <div>
          <InventoryPanel/>
        </div>
      )
    },
    {
      id: 'compendium',
      label: 'Compendium',
      isUnlocked: () => true,
      hasAlert: hasNewDiscoveries,
      content: (
        <div>
          <MonsterCompendiumPanel/>
        </div>
      )
    }
  ]

  const renderTabButton = (tab: CharacterTabProps) => {
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