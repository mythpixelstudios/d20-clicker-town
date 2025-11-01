import { useEconomy } from '@/state/economyStore'
import { useState } from 'react'
import './ResourceBar.css'

// Material categories and icons
const MATERIAL_CONFIG: Record<string, { icon: string; category: 'basic' | 'advanced' | 'rare' | 'epic' | 'legendary' }> = {
  // Basic materials (Zone 1-3)
  'wood': { icon: '🪵', category: 'basic' },
  'iron': { icon: '⚙️', category: 'basic' },
  'stone': { icon: '🪨', category: 'basic' },
  'fiber': { icon: '🧵', category: 'basic' },
  
  // Advanced materials (Zone 4-6)
  'crystal': { icon: '💎', category: 'advanced' },
  'magic_dust': { icon: '✨', category: 'advanced' },
  'obsidian': { icon: '🌋', category: 'advanced' },
  'fire_crystal': { icon: '🔥', category: 'advanced' },
  'sulfur': { icon: '☠️', category: 'advanced' },
  'frozen_wood': { icon: '🧊', category: 'advanced' },
  'ice_crystal': { icon: '❄️', category: 'advanced' },
  'ice_essence': { icon: '💠', category: 'advanced' },
  
  // Rare materials (Zone 7-9)
  'dark_essence': { icon: '🌑', category: 'rare' },
  'sand_glass': { icon: '⏳', category: 'rare' },
  'ancient_coin': { icon: '🪙', category: 'rare' },
  'dried_herb': { icon: '🌿', category: 'rare' },
  'sky_metal': { icon: '☁️', category: 'rare' },
  'wind_crystal': { icon: '💨', category: 'rare' },
  'cloud_essence': { icon: '🌤️', category: 'rare' },
  
  // Epic materials (Zone 10-11)
  'enchanted_leaf': { icon: '🍃', category: 'epic' },
  'mystic_wood': { icon: '🪄', category: 'epic' },
  'soul_crystal': { icon: '👻', category: 'epic' },
  'hell_fire': { icon: '🔥', category: 'epic' },
  'demon_core': { icon: '😈', category: 'epic' },
  
  // Legendary materials
  'void_essence': { icon: '🌌', category: 'legendary' },
  'reality_shard': { icon: '🔮', category: 'legendary' },
  'time_crystal': { icon: '⌛', category: 'legendary' }
}

export default function ResourceBar() {
  const { gold, materials } = useEconomy()
  const [showAll, setShowAll] = useState(false)

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Get icon for material
  const getIcon = (materialId: string) => {
    return MATERIAL_CONFIG[materialId]?.icon || '📦'
  }

  // Get category for material
  const getCategory = (materialId: string) => {
    return MATERIAL_CONFIG[materialId]?.category || 'basic'
  }

  // Sort materials by category priority
  const sortedMaterials = Object.entries(materials)
    .filter(([_, amount]) => amount > 0)
    .sort(([idA], [idB]) => {
      const categoryOrder = { basic: 0, advanced: 1, rare: 2, epic: 3, legendary: 4 }
      const catA = getCategory(idA)
      const catB = getCategory(idB)
      
      if (categoryOrder[catA] !== categoryOrder[catB]) {
        return categoryOrder[catA] - categoryOrder[catB]
      }
      return idA.localeCompare(idB)
    })

  // Only show first 8 materials unless expanded
  const displayMaterials = showAll ? sortedMaterials : sortedMaterials.slice(0, 8)
  const hiddenCount = sortedMaterials.length - displayMaterials.length

  return (
    <div className="resource-bar">
      <div className="resource-item gold">
        <span className="resource-icon">💰</span>
        <span className="resource-amount">{formatNumber(gold)}</span>
        <span className="resource-label">Gold</span>
      </div>
      
      {displayMaterials.map(([materialId, amount]) => {
        const category = getCategory(materialId)
        const displayName = materialId.replace(/_/g, ' ')
        
        return (
          <div 
            key={materialId} 
            className={`resource-item ${category}`}
            title={`${displayName}: ${amount.toLocaleString()}`}
          >
            <span className="resource-icon">{getIcon(materialId)}</span>
            <span className="resource-amount">{formatNumber(amount)}</span>
            <span className="resource-label">{displayName}</span>
          </div>
        )
      })}

      {hiddenCount > 0 && (
        <button 
          className="resource-toggle"
          onClick={() => setShowAll(!showAll)}
          title={showAll ? 'Show less' : `Show ${hiddenCount} more materials`}
        >
          <span className="resource-icon">{showAll ? '◀' : '▶'}</span>
          <span className="resource-amount">{showAll ? 'Less' : `+${hiddenCount}`}</span>
        </button>
      )}
    </div>
  )
}