import { useState, useEffect } from 'react'
import { useChar } from '@/state/charStore'
import { useCombat } from '@/state/combatStore'
import { useTown } from '@/state/townStore'
import { useZoneProgression } from '@/state/zoneProgressionStore'
import { computeClickDamage } from '@/systems/math'

interface GuidanceMessage {
  id: string
  message: string
  priority: number
  condition: () => boolean
  dismissable?: boolean
}

export default function GuidanceBanner() {
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set())
  const [timeWithZeroDamage, setTimeWithZeroDamage] = useState(0)
  const [avgKillTime, setAvgKillTime] = useState(0)
  const [recentKills, setRecentKills] = useState<number[]>([])
  
  const { getTotalStats, statPoints, level } = useChar()
  const { killCount } = useCombat()
  const { isBuildingBuilt } = useTown()
  const { currentZone } = useZoneProgression()
  
  // Track time with zero damage
  useEffect(() => {
    const totalStats = getTotalStats()
    const clickDamage = computeClickDamage(totalStats, level)
    
    const interval = setInterval(() => {
      if (clickDamage <= 0) {
        setTimeWithZeroDamage(prev => prev + 1)
      } else {
        setTimeWithZeroDamage(0)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [getTotalStats, level])
  
  // Track average kill time for high TTK detection
  useEffect(() => {
    setRecentKills(prev => {
      const lastKillCount = prev.length
      if (killCount > lastKillCount) {
        const now = Date.now()
        const newKills = [...prev, now].slice(-5) // Keep last 5 kills

        // Calculate average time between kills
        if (newKills.length >= 3) {
          const timeDiffs = []
          for (let i = 1; i < newKills.length; i++) {
            timeDiffs.push((newKills[i] - newKills[i - 1]) / 1000) // seconds
          }
          const avg = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
          setAvgKillTime(avg)
        }

        return newKills
      }
      return prev
    })
  }, [killCount])
  
  // Define guidance messages
  const guidanceMessages: GuidanceMessage[] = [
    {
      id: 'assign_stats_zero_damage',
      message: "💪 Assign STR or WIS to begin dealing damage! Use the + buttons next to your stats.",
      priority: 1,
      condition: () => timeWithZeroDamage > 10 && statPoints > 0,
      dismissable: true
    },
    {
      id: 'high_time_to_kill',
      message: "⚡ Monsters taking too long to kill? Assign more STR for higher damage or visit the Town to upgrade buildings!",
      priority: 2,
      condition: () => avgKillTime > 15 && killCount >= 5 && (currentZone || 1) >= 2,
      dismissable: true
    },
    {
      id: 'first_stat_assignment',
      message: "🎯 Great start! Assign more stat points to increase your damage and unlock new abilities.",
      priority: 3,
      condition: () => {
        const stats = getTotalStats()
        const hasAnyStats = stats.str > 0 || stats.dex > 0 || stats.con > 0 || stats.int > 0 || stats.wis > 0
        return hasAnyStats && killCount === 0 && statPoints > 0
      },
      dismissable: true
    },
    {
      id: 'first_kills',
      message: "⚔️ Excellent! Keep clicking monsters to gain XP, gold, and materials. Each kill makes you stronger!",
      priority: 4,
      condition: () => killCount >= 1 && killCount < 5,
      dismissable: true
    },
    {
      id: 'build_town',
      message: "🏘️ Visit the Town tab to upgrade buildings that boost your combat effectiveness!",
      priority: 5,
      condition: () => killCount >= 5 && !isBuildingBuilt('keep') && (currentZone || 1) >= 2,
      dismissable: true
    },
    {
      id: 'unlock_blacksmith',
      message: "🔨 Build a Blacksmith in the Town to unlock crafting powerful weapons and equipment!",
      priority: 6,
      condition: () => killCount >= 10 && !isBuildingBuilt('blacksmith'),
      dismissable: true
    },
    {
      id: 'progress_zones',
      message: "🗺️ You're doing great! Try progressing to higher zones for better rewards and stronger monsters.",
      priority: 7,
      condition: () => killCount >= 20 && (currentZone || 1) < 3,
      dismissable: true
    }
  ]
  
  // Find the highest priority active message that hasn't been dismissed
  const activeMessage = guidanceMessages
    .filter(msg => msg.condition() && !dismissedMessages.has(msg.id))
    .sort((a, b) => a.priority - b.priority)[0]
  
  const handleDismiss = (messageId: string) => {
    setDismissedMessages(prev => new Set([...prev, messageId]))
  }
  
  if (!activeMessage) {
    return null
  }

  return (
    <div className="sticky top-0 z-[100] bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-3 rounded-b-lg shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-3 animate-slide-in">
      <div className="flex items-center justify-between gap-3 max-w-full">
        <span className="flex-1 text-[0.9em] leading-[1.4] font-medium">{activeMessage.message}</span>
        {activeMessage.dismissable && (
          <button
            className="bg-white/20 border-0 text-white w-6 h-6 rounded-full cursor-pointer text-base font-bold flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-white/30 hover:scale-110"
            onClick={() => handleDismiss(activeMessage.id)}
            title="Dismiss this tip"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}