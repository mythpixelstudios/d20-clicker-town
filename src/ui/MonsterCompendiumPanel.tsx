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
    <div className="monster-compendium-panel">
      <div className="compendium-header">
        <h2>Monster Compendium</h2>
        <div className="compendium-stats">
          <div className="compendium-stat-item">
            <span className="compendium-stat-label">Discovery:</span>
            <span className="compendium-stat-value">{overallDiscovery.toFixed(1)}%</span>
          </div>
          <div className="compendium-stat-item">
            <span className="compendium-stat-label">Encountered:</span>
            <span className="compendium-stat-value">{totalMonstersEncountered.toLocaleString()}</span>
          </div>
          <div className="compendium-stat-item">
            <span className="compendium-stat-label">Defeated:</span>
            <span className="compendium-stat-value">{totalMonstersKilled.toLocaleString()}</span>
          </div>
          <div className="compendium-stat-item">
            <span className="compendium-stat-label">Unique Species:</span>
            <span className="compendium-stat-value">{Object.keys(discoveredMonsters).length}</span>
          </div>
        </div>
      </div>

      <div className="compendium-description">
        <p>
          Track your encounters with the various creatures of the realm. 
          Discovering new species and affix variants contributes to your understanding of the world.
        </p>
      </div>

      <div className="compendium-bonuses">
        <h3>📊 Active Compendium Bonuses</h3>
        <div className="bonuses-grid">
          <div className="bonus-item">
            <span className="bonus-icon">⚔️</span>
            <span className="bonus-label">Damage:</span>
            <span className="bonus-value">+{compendiumBonuses.damageBonus.toFixed(1)}%</span>
          </div>
          <div className="bonus-item">
            <span className="bonus-icon">💰</span>
            <span className="bonus-label">Gold:</span>
            <span className="bonus-value">+{compendiumBonuses.goldBonus.toFixed(1)}%</span>
          </div>
          <div className="bonus-item">
            <span className="bonus-icon">⭐</span>
            <span className="bonus-label">XP:</span>
            <span className="bonus-value">+{compendiumBonuses.xpBonus.toFixed(1)}%</span>
          </div>
          <div className="bonus-item">
            <span className="bonus-icon">💥</span>
            <span className="bonus-label">Crit Chance:</span>
            <span className="bonus-value">+{compendiumBonuses.critChanceBonus.toFixed(1)}%</span>
          </div>
        </div>
        <div className="bonuses-info">
          <small>
            💡 Bonuses increase as you discover more monsters! +1% damage per 10% completion.
            Kill milestones: 1,000 (+2% damage), 5,000 (+3% damage), 10,000 (+5% damage).
          </small>
        </div>
      </div>

      {recentDiscoveries.length > 0 && (
        <div className="recent-discoveries">
          <h3>🔍 Recent Discoveries</h3>
          <div className="discoveries-list">
            {recentDiscoveries.map(monster => (
              <div key={monster.monsterId} className="discovery-item">
                <span className="discovery-name">{monster.name}</span>
                <span className="discovery-zone">Zone {monster.zone}</span>
                <span className="discovery-date">{formatDate(monster.firstEncountered)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="compendium-filters">
        <div className="filter-group">
          <label htmlFor="zone-filter">Zone Filter:</label>
          <select 
            id="zone-filter"
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

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By:</label>
          <select id="sort-filter" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="recent">Recently Encountered</option>
            <option value="name">Name</option>
            <option value="encounters">Encounter Count</option>
            <option value="zone">Zone</option>
          </select>
        </div>
      </div>

      <div className="monsters-grid">
        {filteredMonsters.length === 0 ? (
          <div className="no-monsters">
            <p>
              {selectedZone 
                ? `No monsters discovered in Zone ${selectedZone} yet.`
                : 'No monsters discovered yet. Start your adventure to begin cataloging creatures!'
              }
            </p>
          </div>
        ) : (
          filteredMonsters.map(monster => (
            <div key={monster.monsterId} className="monster-card">
              <div className="monster-header">
                <h3>{monster.name}</h3>
                <div className="monster-zone">Zone {monster.zone}</div>
              </div>
              
              <div className="monster-stats">
                <div className="stat-row">
                  <span className="stat-label">Encounters:</span>
                  <span className="stat-value">{monster.timesEncountered}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Defeats:</span>
                  <span className="stat-value">{monster.timesKilled}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Success Rate:</span>
                  <span className="stat-value">
                    {monster.timesEncountered > 0 
                      ? `${((monster.timesKilled / monster.timesEncountered) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Affix Variants:</span>
                  <span className="stat-value">{formatAffixVariants(monster.affixVariants)}</span>
                </div>
              </div>
              
              <div className="monster-dates">
                <div className="date-item">
                  <span className="date-label">First Seen:</span>
                  <span className="date-value">{formatDate(monster.firstEncountered)}</span>
                </div>
                <div className="date-item">
                  <span className="date-label">Last Seen:</span>
                  <span className="date-value">{formatDate(monster.lastEncountered)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}