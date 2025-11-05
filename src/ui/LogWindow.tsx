import { useLog, LogEntry, LogType, LogCategory } from '../state/logStore'

// Get appropriate icon and color for each log type
const getLogStyle = (type: LogType) => {
  switch (type) {
    case 'monster_death':
      return { icon: '⚔️', color: '#ff6b6b' }
    case 'zone_upgrade':
      return { icon: '🚀', color: '#4ecdc4' }
    case 'crafting_success':
      return { icon: '🔨', color: '#6fe19a' }
    case 'crafting_failure':
      return { icon: '💥', color: '#ffa726' }
    case 'item_drop':
      return { icon: '💎', color: '#ba68c8' }
    case 'level_up':
      return { icon: '⭐', color: '#ffeb3b' }
    case 'town_upgrade':
      return { icon: '🏛️', color: '#8d6e63' }
    case 'tavern_quest':
      return { icon: '🍺', color: '#ff9800' }
    case 'daily_quest':
      return { icon: '📋', color: '#03a9f4' }
    case 'achievement':
      return { icon: '🏆', color: '#ffd700' }
    case 'prestige':
      return { icon: '✨', color: '#9c27b0' }
    case 'compendium':
      return { icon: '📖', color: '#00bcd4' }
    default:
      return { icon: 'ℹ️', color: '#9e9e9e' }
  }
}

// Get category display info
const getCategoryInfo = (category: LogCategory | 'all') => {
  switch (category) {
    case 'combat':
      return { label: 'Combat', icon: '⚔️' }
    case 'crafting':
      return { label: 'Crafting', icon: '🔨' }
    case 'town':
      return { label: 'Town', icon: '🏛️' }
    case 'tavern':
      return { label: 'Tavern', icon: '🍺' }
    case 'progression':
      return { label: 'Progress', icon: '⭐' }
    case 'general':
      return { label: 'General', icon: 'ℹ️' }
    case 'all':
    default:
      return { label: 'All', icon: '📜' }
  }
}

// Format timestamp to show time passed
const formatTimestamp = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 1000) return 'now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

interface LogItemProps {
  readonly log: LogEntry
}

function LogItem({ log }: LogItemProps) {
  const { icon, color } = getLogStyle(log.type)

  return (
    <div className="flex items-start gap-2 px-2 py-1.5 border-b border-white/[0.06] text-xs leading-snug">
      <span className="text-sm min-w-[16px]">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium" style={{ color: color }}>
          {log.message}
        </div>
        <div className="text-muted text-[10px] mt-0.5">
          {formatTimestamp(log.timestamp)}
        </div>
      </div>
    </div>
  )
}

export default function LogWindow() {
  const { clearLogs, getFilteredLogs, activeFilter, setFilter } = useLog()
  const filteredLogs = getFilteredLogs()

  const categories: Array<LogCategory | 'all'> = ['all', 'combat', 'crafting', 'town', 'tavern', 'progression']

  return (
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-card h-[250px]">
      <div className="flex justify-between items-center mb-2">
        <b>Activity Log</b>
        <button
          onClick={clearLogs}
          className="bg-transparent border border-white/[0.06] rounded px-1.5 py-0.5 text-[10px] text-muted cursor-pointer hover:bg-white/5 hover:text-text transition-colors"
          title="Clear logs"
        >
          Clear
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {categories.map(category => {
          const info = getCategoryInfo(category)
          const isActive = activeFilter === category
          return (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`border rounded px-2 py-0.5 text-[10px] cursor-pointer flex items-center gap-1 transition-all ${
                isActive
                  ? 'bg-gold/20 border-gold/40 text-text'
                  : 'bg-bg border-white/[0.06] text-text hover:bg-white/5'
              }`}
              title={info.label}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
            </button>
          )
        })}
      </div>

      <div className="h-40 overflow-y-auto border border-white/[0.06] rounded bg-bg">
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-center text-muted text-xs">
            {activeFilter === 'all'
              ? 'No activity yet...'
              : `No ${getCategoryInfo(activeFilter).label.toLowerCase()} activity yet...`}
          </div>
        ) : (
          filteredLogs.map(log => (
            <LogItem key={log.id} log={log} />
          ))
        )}
      </div>
    </div>
  )
}