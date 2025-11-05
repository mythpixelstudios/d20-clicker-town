import React, { useState } from 'react'
import { useMonsterCompendium } from '../state/monsterCompendiumStore'

export default function MonsterCompendiumPanel() {
  const {
    discoveredMonsters,
    totalMonstersEncountered,
    totalMonstersKilled,
    getDiscoveryPercentage,
    getZoneDiscoveryPercentage,
    getAllDiscoveredMonsters,
    getRecentDiscoveries,
    getCompendiumBonuses
  } = useMonsterCompendium()

  const [selectedZone, setSelectedZone] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'encounters' | 'zone' | 'recent'>('recent')

  const allMonsters = getAllDiscoveredMonsters()
  const recentDiscoveries = getRecentDiscoveries(5)
  const overallDiscovery = getDiscoveryPercentage()
  const compendiumBonuses = getCompendiumBonuses()

  // Filter and sort monsters
  let filteredMonsters = selectedZone 
    ? allMonsters.filter(m => m.zone === selectedZone)
    : allMonsters

  switch (sortBy) {
    case 'name':
      filteredMonsters.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'encounters':
      filteredMonsters.sort((a, b) => b.timesEncountered - a.timesEncountered)
      break
    case 'zone':
      filteredMonsters.sort((a, b) => a.zone - b.zone)
      break
    case 'recent':
    default:
      filteredMonsters.sort((a, b) => b.lastEncountered - a.lastEncountered)
      break
  }

  const zones = Array.from(new Set(allMonsters.map(m => m.zone))).sort((a, b) => a - b)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatAffixVariants = (affixVariants: Set<string>) => {
    const variants = Array.from(affixVariants)
    if (variants.length === 1 && variants[0] === 'none') {
      return 'Normal'
    }
    return `${variants.length} variant${variants.length !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text mb-3">Monster Compendium</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[120px] bg-panel border border-white/10 rounded-lg p-3 text-center">
            <span className="text-xs text-muted block mb-1">Discovery:</span>
            <span className="text-lg font-bold text-gold">{overallDiscovery.toFixed(1)}%</span>
          </div>
          <div className="flex-1 min-w-[120px] bg-panel border border-white/10 rounded-lg p-3 text-center">
            <span className="text-xs text-muted block mb-1">Encountered:</span>
            <span className="text-lg font-bold text-text">{totalMonstersEncountered.toLocaleString()}</span>
          </div>
          <div className="flex-1 min-w-[120px] bg-panel border border-white/10 rounded-lg p-3 text-center">
            <span className="text-xs text-muted block mb-1">Defeated:</span>
            <span className="text-lg font-bold text-green-400">{totalMonstersKilled.toLocaleString()}</span>
          </div>
          <div className="flex-1 min-w-[120px] bg-panel border border-white/10 rounded-lg p-3 text-center">
            <span className="text-xs text-muted block mb-1">Unique Species:</span>
            <span className="text-lg font-bold text-purple">{Object.keys(discoveredMonsters).length}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-sm text-muted m-0">
          Track your encounters with the various creatures of the realm.
          Discovering new species and affix variants contributes to your understanding of the world.
        </p>
      </div>

      <div className="bg-panel border border-white/10 rounded-lg p-4">
        <h3 className="text-base font-bold text-gold mb-3 m-0">📊 Active Compendium Bonuses</h3>
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex-1 min-w-[100px] text-center">
            <span className="text-2xl block mb-1">⚔️</span>
            <span className="text-xs text-muted block">Damage:</span>
            <span className="text-sm font-bold text-green-400">+{compendiumBonuses.damageBonus.toFixed(1)}%</span>
          </div>
          <div className="flex-1 min-w-[100px] text-center">
            <span className="text-2xl block mb-1">💰</span>
            <span className="text-xs text-muted block">Gold:</span>
            <span className="text-sm font-bold text-gold">+{compendiumBonuses.goldBonus.toFixed(1)}%</span>
          </div>
          <div className="flex-1 min-w-[100px] text-center">
            <span className="text-2xl block mb-1">⭐</span>
            <span className="text-xs text-muted block">XP:</span>
            <span className="text-sm font-bold text-blue-400">+{compendiumBonuses.xpBonus.toFixed(1)}%</span>
          </div>
          <div className="flex-1 min-w-[100px] text-center">
            <span className="text-2xl block mb-1">💥</span>
            <span className="text-xs text-muted block">Crit Chance:</span>
            <span className="text-sm font-bold text-orange-400">+{compendiumBonuses.critChanceBonus.toFixed(1)}%</span>
          </div>
        </div>
        <div className="text-xs text-muted">
          💡 Bonuses increase as you discover more monsters! +1% damage per 10% completion.
          Kill milestones: 1,000 (+2% damage), 5,000 (+3% damage), 10,000 (+5% damage).
        </div>
      </div>

      {recentDiscoveries.length > 0 && (
        <div className="bg-panel border border-white/10 rounded-lg p-4">
          <h3 className="text-base font-bold text-text mb-3 m-0">🔍 Recent Discoveries</h3>
          <div className="space-y-2">
            {recentDiscoveries.map(monster => (
              <div key={monster.monsterId} className="flex justify-between items-center text-sm bg-black/20 rounded px-3 py-2">
                <span className="text-text font-bold">{monster.name}</span>
                <span className="text-muted">Zone {monster.zone}</span>
                <span className="text-xs text-muted">{formatDate(monster.firstEncountered)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="zone-filter" className="text-xs text-muted block mb-1">Zone Filter:</label>
          <select
            id="zone-filter"
            className="w-full bg-panel border border-white/20 rounded px-3 py-2 text-text text-sm"
            value={selectedZone || ''}
            onChange={(e) => setSelectedZone(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Zones</option>
            {zones.map(zone => (
              <option key={zone} value={zone}>
                Zone {zone} ({getZoneDiscoveryPercentage(zone).toFixed(1)}% discovered)
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="sort-filter" className="text-xs text-muted block mb-1">Sort By:</label>
          <select
            id="sort-filter"
            className="w-full bg-panel border border-white/20 rounded px-3 py-2 text-text text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="recent">Recently Encountered</option>
            <option value="name">Name</option>
            <option value="encounters">Encounter Count</option>
            <option value="zone">Zone</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {filteredMonsters.length === 0 ? (
          <div className="w-full text-center py-8">
            <p className="text-muted">
              {selectedZone
                ? `No monsters discovered in Zone ${selectedZone} yet.`
                : 'No monsters discovered yet. Start your adventure to begin cataloging creatures!'
              }
            </p>
          </div>
        ) : (
          filteredMonsters.map(monster => (
            <div key={monster.monsterId} className="flex-1 min-w-[280px] max-w-[400px] bg-panel border border-white/10 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-text m-0">{monster.name}</h3>
                <div className="text-xs text-muted bg-black/30 px-2 py-0.5 rounded">Zone {monster.zone}</div>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Encounters:</span>
                  <span className="text-text font-bold">{monster.timesEncountered}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Defeats:</span>
                  <span className="text-green-400 font-bold">{monster.timesKilled}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Success Rate:</span>
                  <span className="text-blue-400 font-bold">
                    {monster.timesEncountered > 0
                      ? `${((monster.timesKilled / monster.timesEncountered) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Affix Variants:</span>
                  <span className="text-purple font-bold">{formatAffixVariants(monster.affixVariants)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted">First Seen:</span>
                  <span className="text-text">{formatDate(monster.firstEncountered)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted">Last Seen:</span>
                  <span className="text-text">{formatDate(monster.lastEncountered)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}