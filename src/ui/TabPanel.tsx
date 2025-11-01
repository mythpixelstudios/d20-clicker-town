import { useState, ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  content: ReactNode
  hasAlert?: boolean
  isUnlocked: () => boolean
  unlockTooltip?: string
}

interface TabPanelProps {
  readonly tabs: readonly Tab[]
  readonly allTabs: readonly Tab[] // All tabs including locked ones
  readonly defaultTab?: string
  readonly onTabChange?: (tabId: string) => void
}

export default function TabPanel({ tabs, allTabs, defaultTab, onTabChange }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  
  const handleTabChange = (tabId: string) => {
    const tab = allTabs.find(t => t.id === tabId)
    if (tab?.isUnlocked()) {
      setActiveTab(tabId)
      onTabChange?.(tabId)
    }
  }
  
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content
  
  return (
    <div className="tab-panel">
      <div className="tab-navigation">
        {allTabs.map(tab => {
          const isUnlocked = tab.isUnlocked()
          const isActive = activeTab === tab.id
          
          return (
            <div key={tab.id} className="tab-wrapper">
              <button
                className={`tab-button ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                disabled={!isUnlocked}
                title={!isUnlocked ? tab.unlockTooltip : undefined}
              >
                {tab.label}
                {tab.hasAlert && isUnlocked && (
                  <span className="alert-dot">
                  </span>
                )}
                {!isUnlocked && (
                  <span className="lock-icon">🔒</span>
                )}
              </button>
            </div>
          )
        })}
      </div>
      <div className="tab-content">
        {activeTabContent}
      </div>
    </div>
  )
}