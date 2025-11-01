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
          <div style={{height:12}}/>
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
    <div className="character-panel">
      <div className="character-sub-tabs">
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