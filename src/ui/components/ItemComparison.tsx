import { useState, useCallback } from 'react'
import { useChar } from '@/state/charStore'
import type { Equipment } from '@/data/equipment'
import './ItemComparison.css'

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
    return (
      <span 
        className="rarity-badge"
        style={{ 
          color: getRarityColor(rarity),
          borderColor: getRarityColor(rarity)
        }}
      >
        {rarityName.charAt(0).toUpperCase() + rarityName.slice(1)}
      </span>
    )
  }
  
  return (
    <div 
      className="item-comparison-overlay"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="button"
      tabIndex={0}
      aria-label="Close comparison modal"
    >
      <div 
        className="item-comparison-tooltip"
        role="dialog"
        aria-modal="true"
      >
        <div className="comparison-header">
          <div className="comparison-title">Item Comparison</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="comparison-items">
          <div className="comparison-item current">
            <div className="item-header">
              <span className="item-label">Current</span>
              {currentItem && (
                <>
                  <span 
                    className="item-name"
                    style={{ color: getRarityColor(currentItem.rarity) }}
                  >
                    {currentItem.name}
                  </span>
                  {getRarityBadge(currentItem.rarity)}
                </>
              )}
              {!currentItem && (
                <span className="item-name empty">Nothing Equipped</span>
              )}
            </div>
          </div>
          
          <div className="comparison-arrow">→</div>
          
          <div className="comparison-item new">
            <div className="item-header">
              <span className="item-label">New</span>
              <span 
                className="item-name"
                style={{ color: getRarityColor(newItem.rarity) }}
              >
                {newItem.name}
              </span>
              {getRarityBadge(newItem.rarity)}
            </div>
          </div>
        </div>
        
        <div className="stat-deltas">
          {statDeltas.length > 0 ? (
            <div className="deltas-list">
              <div className="deltas-header">Stat Changes:</div>
              {statDeltas.map((delta) => (
                <div 
                  key={`${delta.stat}-${delta.delta}`} 
                  className={`stat-delta ${delta.isImprovement ? 'improvement' : 'downgrade'}`}
                >
                  <span className="stat-name">{formatStatName(delta.stat)}</span>
                  <span className="stat-values">
                    {delta.current} → {delta.new}
                  </span>
                  <span className="stat-change">
                    {delta.isImprovement ? '↑' : '↓'} {Math.abs(delta.delta)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-changes">
              No stat changes
            </div>
          )}
        </div>
        
        <div className="comparison-actions">
          <button className="equip-btn" onClick={() => { onEquip(); onClose(); }}>
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