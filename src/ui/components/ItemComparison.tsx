import { useState, useCallback } from 'react'
import { useChar } from '@/state/charStore'
import type { Equipment } from '@/data/equipment'

interface StatDelta {
  stat: string
  current: number
  new: number
  delta: number
  isImprovement: boolean
}

interface ItemComparisonProps {
  readonly newItem: Equipment
  readonly currentItem?: Equipment
  readonly onClose: () => void
  readonly onEquip: () => void
}

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
  mythic: '#f44336'
}

export function ItemComparison({ newItem, currentItem, onClose, onEquip }: ItemComparisonProps) {
  const calculateStatDeltas = useCallback((newEquipment: Equipment, currentEquipment?: Equipment): StatDelta[] => {
    const deltas: StatDelta[] = []
    
    // Get all possible stats from both items
    const allStats = new Set([
      ...Object.keys(newEquipment.stats || {}),
      ...Object.keys(currentEquipment?.stats || {})
    ])
    
    for (const stat of allStats) {
      const newValue = (newEquipment.stats as any)?.[stat] || 0
      const currentValue = (currentEquipment?.stats as any)?.[stat] || 0
      const delta = newValue - currentValue
      
      if (delta !== 0) {
        deltas.push({
          stat,
          current: currentValue,
          new: newValue,
          delta,
          isImprovement: delta > 0
        })
      }
    }
    
    return deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  }, [])
  
  const statDeltas = calculateStatDeltas(newItem, currentItem)
  
  const formatStatName = (stat: string) => {
    switch (stat) {
      case 'str': return 'STR'
      case 'dex': return 'DEX'
      case 'con': return 'CON'
      case 'int': return 'INT'
      case 'wis': return 'WIS'
      case 'clickDamage': return 'Click Damage'
      case 'autoDamage': return 'Auto Damage'
      default: return stat.charAt(0).toUpperCase() + stat.slice(1)
    }
  }
  
  const getRarityColor = (rarity?: string) => {
    return RARITY_COLORS[rarity || 'common'] || RARITY_COLORS.common
  }
  
  const getRarityBadge = (rarity?: string) => {
    const rarityName = rarity || 'common'
    const color = getRarityColor(rarity)
    return (
      <span
        className="text-[0.7em] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide bg-black/30 inline-block mt-1"
        style={{
          color: color,
          borderColor: color
        }}
      >
        {rarityName.charAt(0).toUpperCase() + rarityName.slice(1)}
      </span>
    )
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 z-[1000] flex items-center justify-center p-5"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="button"
      tabIndex={0}
      aria-label="Close comparison modal"
    >
      <div
        className="relative bg-panel border border-white/20 rounded-lg p-4 min-w-[300px] max-w-[400px] max-h-[90vh] w-full overflow-y-auto shadow-[0_8px_24px_rgba(0,0,0,0.5)] animate-[fadeIn_0.2s_ease-out]"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
          <div className="font-bold text-[1.1em] text-text">Item Comparison</div>
          <button className="bg-transparent border-0 text-muted text-lg cursor-pointer p-1 w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 hover:text-text" onClick={onClose}>×</button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-[0.8em] text-muted uppercase font-medium">Current</span>
              {currentItem && (
                <>
                  <span
                    className="text-[0.9em] text-text font-bold"
                    style={{ color: getRarityColor(currentItem.rarity) }}
                  >
                    {currentItem.name}
                  </span>
                  {getRarityBadge(currentItem.rarity)}
                </>
              )}
              {!currentItem && (
                <span className="text-[0.9em] text-muted italic font-bold">Nothing Equipped</span>
              )}
            </div>
          </div>

          <div className="text-[1.2em] text-muted flex-shrink-0">→</div>

          <div className="flex-1 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-[0.8em] text-muted uppercase font-medium">New</span>
              <span
                className="text-[0.9em] text-text font-bold"
                style={{ color: getRarityColor(newItem.rarity) }}
              >
                {newItem.name}
              </span>
              {getRarityBadge(newItem.rarity)}
            </div>
          </div>
        </div>

        <div className="bg-black/20 rounded-md p-3 mb-4">
          {statDeltas.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <div className="text-[0.9em] text-text font-semibold mb-2">Stat Changes:</div>
              {statDeltas.map((delta) => (
                <div
                  key={`${delta.stat}-${delta.delta}`}
                  className={`flex justify-between items-center px-2 py-1 rounded text-[0.85em] ${delta.isImprovement ? 'bg-green-500/20 border-l-[3px] border-l-green-500' : 'bg-red-500/20 border-l-[3px] border-l-red-500'}`}
                >
                  <span className="font-medium text-text min-w-[60px] text-left">{formatStatName(delta.stat)}</span>
                  <span className="text-muted text-[0.9em] flex-1 text-center">
                    {delta.current} → {delta.new}
                  </span>
                  <span className={`font-bold min-w-[40px] text-right ${delta.isImprovement ? 'text-green-500' : 'text-red-500'}`}>
                    {delta.isImprovement ? '↑' : '↓'} {Math.abs(delta.delta)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted italic p-3">
              No stat changes
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 rounded-md px-4 py-2 cursor-pointer font-medium transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(76,175,80,0.3)]" onClick={() => { onEquip(); onClose(); }}>
            Equip Item
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for managing item comparison state
export function useItemComparison(onEquip?: (item: Equipment) => void) {
  const [comparison, setComparison] = useState<{
    newItem: Equipment
    currentItem?: Equipment
    position?: { x: number; y: number }
  } | null>(null)
  
  const { equipped } = useChar()
  
  const showComparison = useCallback((newItem: Equipment, mouseEvent?: React.MouseEvent) => {
    const currentItem = equipped[newItem.slot as keyof typeof equipped]
    
    const position = mouseEvent ? {
      x: mouseEvent.clientX + 10,
      y: mouseEvent.clientY + 10
    } : undefined
    
    setComparison({
      newItem,
      currentItem,
      position
    })
  }, [equipped])
  
  const hideComparison = useCallback(() => {
    setComparison(null)
  }, [])
  
  const handleEquip = useCallback(() => {
    if (comparison?.newItem && onEquip) {
      onEquip(comparison.newItem)
    }
  }, [comparison, onEquip])
  
  return {
    comparison,
    showComparison,
    hideComparison,
    ComparisonTooltip: comparison ? (
      <ItemComparison
        newItem={comparison.newItem}
        currentItem={comparison.currentItem}
        onClose={hideComparison}
        onEquip={handleEquip}
      />
    ) : null
  }
}