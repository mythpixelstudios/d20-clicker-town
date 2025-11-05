import { useEconomy } from '@/state/economyStore'
import { useState } from 'react'

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

  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-gray-400/10 border-gray-400/20'
      case 'advanced':
        return 'bg-blue-500/10 border-blue-500/30'
      case 'rare':
        return 'bg-purple-500/10 border-purple-500/30'
      case 'epic':
        return 'bg-pink-500/10 border-pink-500/30'
      case 'legendary':
        return 'bg-gradient-to-br from-yellow-400/15 to-pink-500/15 border-yellow-400/40 animate-[legendary-glow_3s_ease-in-out_infinite]'
      default:
        return 'bg-white/5 border-white/10'
    }
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <div className="flex items-center gap-1 bg-gold/15 border border-gold/40 rounded-lg px-2 py-1 min-w-[60px] transition-all duration-200 hover:bg-gold/[0.08] hover:border-gold/20 hover:-translate-y-0.5 text-gold">
        <span className="text-sm leading-none">💰</span>
        <span className="font-semibold text-[13px] min-w-[20px] text-right">{formatNumber(gold)}</span>
        <span className="text-[11px] text-muted capitalize whitespace-nowrap max-w-[90px] overflow-hidden text-ellipsis">Gold</span>
      </div>

      {displayMaterials.map(([materialId, amount]) => {
        const category = getCategory(materialId)
        const displayName = materialId.replace(/_/g, ' ')

        return (
          <div
            key={materialId}
            className={`flex items-center gap-1 border rounded-lg px-2 py-1 min-w-[60px] transition-all duration-200 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 ${getCategoryClasses(category)}`}
            title={`${displayName}: ${amount.toLocaleString()}`}
          >
            <span className="text-sm leading-none">{getIcon(materialId)}</span>
            <span className="font-semibold text-[13px] min-w-[20px] text-right">{formatNumber(amount)}</span>
            <span className="text-[11px] text-muted capitalize whitespace-nowrap max-w-[90px] overflow-hidden text-ellipsis">{displayName}</span>
          </div>
        )
      })}

      {hiddenCount > 0 && (
        <button
          className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 rounded-lg px-2 py-1 min-w-[60px] cursor-pointer transition-all duration-200 text-text hover:bg-blue-500/25 hover:border-blue-500/50 hover:-translate-y-0.5"
          onClick={() => setShowAll(!showAll)}
          title={showAll ? 'Show less' : `Show ${hiddenCount} more materials`}
        >
          <span className="text-[10px] leading-none">{showAll ? '◀' : '▶'}</span>
          <span className="text-[11px] font-medium">{showAll ? 'Less' : `+${hiddenCount}`}</span>
        </button>
      )}
    </div>
  )
}