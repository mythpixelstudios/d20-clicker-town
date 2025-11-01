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
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      padding: '6px 8px',
      borderBottom: '1px solid var(--border)',
      fontSize: 12,
      lineHeight: 1.3
    }}>
      <span style={{ fontSize: 14, minWidth: 16 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: color, fontWeight: 500 }}>
          {log.message}
        </div>
        <div style={{ 
          color: 'var(--muted)', 
          fontSize: 10, 
          marginTop: 2 
        }}>
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
    <div className="card" style={{ height: 250 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8
      }}>
        <b>Activity Log</b>
        <button 
          onClick={clearLogs}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 10,
            color: 'var(--muted)',
            cursor: 'pointer'
          }}
          title="Clear logs"
        >
          Clear
        </button>
      </div>
      
      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 8,
        flexWrap: 'wrap'
      }}>
        {categories.map(category => {
          const info = getCategoryInfo(category)
          const isActive = activeFilter === category
          return (
            <button
              key={category}
              onClick={() => setFilter(category)}
              style={{
                background: isActive ? 'var(--primary)' : 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 10,
                color: isActive ? 'white' : 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s'
              }}
              title={info.label}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
            </button>
          )
        })}
      </div>
      
      <div style={{
        height: 160,
        overflowY: 'auto',
        border: '1px solid var(--border)',
        borderRadius: 4,
        backgroundColor: 'var(--background)'
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{
            padding: 16,
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: 12
          }}>
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