import { useState, useEffect } from 'react'
import CharacterPanel from '@/ui/CharacterPanel'
import TownPanel from '@/ui/TownPanel'
import TavernPanel from '@/ui/TavernPanel'
import MonsterPanel from '@/ui/MonsterPanel'
import BlacksmithPanel from '@/ui/BlacksmithPanel'
import PrestigePanel from '@/ui/PrestigePanel'
import GoalsPanel from '@/ui/GoalsPanel'
import LogWindow from '@/ui/LogWindow'
import ZoneSelectionScreen from '@/ui/ZoneSelectionScreen'
import StartScreen from '@/ui/StartScreen'
import TabPanel from '@/ui/TabPanel'
import ResourceBar from '@/ui/components/ResourceBar'
import OfflineProgressPopup from '@/ui/components/OfflineProgressPopup'
import AudioControls from '@/ui/components/AudioControls'
import { ToastNotification } from '@/ui/components/Toast'
import { useToast } from '@/state/toastStore'
import { useZoneProgression } from '@/state/zoneProgressionStore'
import { useCombat } from '@/state/combatStore'
import { useChar } from '@/state/charStore'
import { useTown } from '@/state/townStore'
import { useAchievements } from '@/state/achievementStore'
import { useDailyQuests } from '@/state/dailyQuestStore'
import { useMonsterCompendium } from '@/state/monsterCompendiumStore'
import { useOfflineProgress } from '@/state/offlineProgressStore'
import { useAnalytics } from '@/state/analyticsStore'
import { playAmbientTrack } from '@/state/audioStore'
import DebugOverlay from '@/ui/components/DebugOverlay'

export default function App(){
  const { showZoneSelection, canPrestige } = useZoneProgression()
  const [showStartScreen, setShowStartScreen] = useState(true)
  const [isGameInitialized, setIsGameInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState('character')
  const [offlineProgress, setOfflineProgress] = useState<any>(null)
  const { setName } = useChar()
  const { hasUpgradeAvailable, isBuildingBuilt } = useTown()
  const { checkAchievements, getUnclaimedRewards } = useAchievements()
  const { quests } = useDailyQuests()
  const { getRecentDiscoveries } = useMonsterCompendium()
  const { calculateOfflineProgress, setLastActiveTime } = useOfflineProgress()
  const { startSession, endSession } = useAnalytics()
  const { toasts, removeToast } = useToast()
  
  // Initialize game state when starting
  useEffect(() => {
    if (isGameInitialized) {
      // Initialize combat state when game starts
      useCombat.getState().init()
      // Start analytics session
      startSession()
    }
  }, [isGameInitialized, startSession])
  
  // Check for offline progress when game initializes
  useEffect(() => {
    if (isGameInitialized) {
      const progress = calculateOfflineProgress()
      if (progress) {
        setOfflineProgress(progress)
      }
    }
  }, [isGameInitialized, calculateOfflineProgress])
  
  // Update last active time when the component unmounts or window loses focus
  useEffect(() => {
    const handleBeforeUnload = () => {
      setLastActiveTime(Date.now())
      endSession() // End analytics session
    }
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLastActiveTime(Date.now())
        endSession() // End session when tab becomes hidden
      } else if (isGameInitialized) {
        startSession() // Start new session when tab becomes visible
        // Check for offline progress when returning
        const progress = calculateOfflineProgress()
        if (progress) {
          setOfflineProgress(progress)
        }
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      endSession() // End session on component unmount
    }
  }, [isGameInitialized, calculateOfflineProgress, setLastActiveTime, startSession, endSession])
  
  // Check achievements periodically
  useEffect(() => {
    if (!isGameInitialized) return
    
    const interval = setInterval(() => {
      checkAchievements()
    }, 2000) // Check every 2 seconds
    
    return () => clearInterval(interval)
  }, [isGameInitialized, checkAchievements])
  
  const handleStartAdventure = (playerName?: string, stats?: any) => {
    if (playerName) {
      setName(playerName)
    }
    if (stats) {
      // Update character stats with rolled values
      const charState = useChar.getState()
      charState.setRolledStats(stats)
    }
    setShowStartScreen(false)
    setIsGameInitialized(true)
  }
  
  const handleClaimOfflineProgress = () => {
    setOfflineProgress(null)
    setLastActiveTime(Date.now())
  }
  
  if (showStartScreen) {
    return <StartScreen onStartAdventure={handleStartAdventure} />
  }

  const unclaimedAchievements = getUnclaimedRewards().length
  const completedQuests = quests.filter(q => q.completed && !q.claimed).length
  const recentDiscoveries = getRecentDiscoveries(5)
  const goalsAlert = unclaimedAchievements > 0 || completedQuests > 0
  const characterAlert = recentDiscoveries.length > 0

  // Define all possible tabs with their unlock conditions
  const allTabs = [
    {
      id: 'character',
      label: 'Character',
      isUnlocked: () => true, // Always available
      hasAlert: characterAlert,
      content: (
        <div>
          <CharacterPanel/>
        </div>
      )
    },
    {
      id: 'goals',
      label: 'Goals',
      isUnlocked: () => true, // Always available
      hasAlert: goalsAlert,
      content: (
        <div>
          <GoalsPanel/>
        </div>
      )
    },
    {
      id: 'town',
      label: 'Town',
      isUnlocked: () => true, // Always available
      hasAlert: hasUpgradeAvailable(),
      content: (
        <div>
          <TownPanel/>
        </div>
      )
    },
    {
      id: 'tavern',
      label: 'Tavern',
      isUnlocked: () => isBuildingBuilt('tavern'), // Unlock after building tavern
      unlockTooltip: 'Unlock Tavern: Build Tavern L1 in Town (requires Level 5), and MarketPlace Level 3',
      content: (
        <div>
          <TavernPanel/>
        </div>
      )
    },
    {
      id: 'craft',
      label: 'Craft',
      isUnlocked: () => isBuildingBuilt('blacksmith'), // Only when blacksmith is built
      unlockTooltip: 'Unlock Blacksmith: Build Blacksmith L1 in Town',
      content: (
        <div>
          <BlacksmithPanel/>
        </div>
      )
    },
    {
      id: 'prestige',
      label: 'Prestige',
      isUnlocked: () => canPrestige(), // Only when prestige is available
      unlockTooltip: 'Unlock Prestige: Clear Void Nexus (Zone 11) at least once',
      content: (
        <div>
          <PrestigePanel/>
        </div>
      )
    }
  ]

  // Filter tabs based on unlock conditions
  const tabs = allTabs.filter(tab => tab.isUnlocked())
  
  // Get background image based on active tab
  const getBackgroundImage = () => {
    switch (activeTab) {
      case 'town':
        return '/src/images/town.jpg'
      case 'tavern':
        return '/src/images/town2.jpg'
      case 'craft':
        return '/src/images/blacksmith.jpg'
      default:
        return null
    }
  }
  
  return (
    <div className="app">
      <AudioControls />
      <div className="top">
        <div className="card">
          <b>Clicker V2</b>
          <div className="muted">RPG stats + town + drops + equipment</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <ResourceBar />
        </div>
      </div>
      <div className="layout">
        <div>
          <TabPanel 
            tabs={tabs}
            allTabs={allTabs}
            defaultTab="character"
            onTabChange={(tab) => {
              setActiveTab(tab)
              // Play ambient audio for certain tabs
              if (tab === 'town') playAmbientTrack('town')
              else if (tab === 'tavern') playAmbientTrack('tavern')
              else if (tab === 'character') playAmbientTrack('combat')
            }}
          />
        </div>
        <div 
          className={`right-column ${getBackgroundImage() ? 'with-background' : ''}`}
          style={getBackgroundImage() ? {
            backgroundImage: `url(${getBackgroundImage()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {}}
        >
          {/* Keep components rendered but hidden to maintain functionality */}
          <div style={{ display: getBackgroundImage() ? 'none' : 'block' }}>
            <MonsterPanel/>
            <div style={{height:12}}/>
            <LogWindow/>
          </div>
          
          {/* Hidden components for background processing */}
          {getBackgroundImage() && (
            <div style={{ display: 'none' }}>
              <MonsterPanel/>
              <LogWindow/>
            </div>
          )}
        </div>
      </div>
      
      {showZoneSelection && <ZoneSelectionScreen />}
      {offlineProgress && (
        <OfflineProgressPopup 
          progress={offlineProgress} 
          onClaim={handleClaimOfflineProgress} 
        />
      )}
      
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastNotification 
            key={toast.id} 
            toast={toast} 
            onClose={removeToast} 
          />
        ))}
      </div>
      
      <DebugOverlay />
    </div>
  )
}
