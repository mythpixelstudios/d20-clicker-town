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
    <div>
      <div className="flex gap-1 mb-3 border-b border-white/10 pb-0">
        {allTabs.map(tab => {
          const isUnlocked = tab.isUnlocked()
          const isActive = activeTab === tab.id

          return (
            <div key={tab.id} className="relative">
              <button
                className={`relative px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                  isActive
                    ? 'text-text border-gold bg-white/5'
                    : isUnlocked
                      ? 'text-muted border-transparent hover:text-text hover:bg-white/5'
                      : 'text-muted/50 border-transparent cursor-not-allowed opacity-60'
                }`}
                onClick={() => handleTabChange(tab.id)}
                disabled={!isUnlocked}
                title={!isUnlocked ? tab.unlockTooltip : undefined}
              >
                {tab.label}
                {tab.hasAlert && isUnlocked && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full animate-pulse">
                  </span>
                )}
                {!isUnlocked && (
                  <span className="ml-1.5 text-xs">🔒</span>
                )}
              </button>
            </div>
          )
        })}
      </div>
      <div>
        {activeTabContent}
      </div>
    </div>
  )
}