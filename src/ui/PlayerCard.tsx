import { useChar } from '@/state/charStore'
import { useEconomy } from '@/state/economyStore'
import { xpForLevel, calculatePlayerAC } from '@/systems/math'
import { calculateModifier, formatModifier } from '@/systems/statRolling'
import { useState } from 'react'

type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

type StatButtonProps = {
  readonly statKey: StatKey
  readonly statValue: number
}

const statDescriptions = {
  str: 'Strength (STR): Increases click damage and melee combat effectiveness',
  dex: 'Dexterity (DEX): Increases attack speed, critical hit chance, and AC',
  con: 'Constitution (CON): Increases health, stamina, and survivability',
  int: 'Intelligence (INT): Increases magic damage, auto-clicker effectiveness',
  wis: 'Wisdom (WIS): Increases XP gain and resource drop rates',
  cha: 'Charisma (CHA): Improves shop prices, quest rewards, and NPC interactions'
}

function StatButton({ statKey, statValue }: StatButtonProps) {  // Removed canUpgrade and onUpgrade
  const [showTooltip, setShowTooltip] = useState(false)
  const { getTotalStats } = useChar()
  
  // Get equipment bonuses for this stat
  const totalStats = getTotalStats()
  const baseStat = statValue
  const equipmentBonus = totalStats[statKey] - baseStat
  const totalStatValue = totalStats[statKey]
  
  // Calculate D&D modifier
  const modifier = calculateModifier(totalStatValue)
  const modifierText = formatModifier(modifier)

  return (
    <div className="stat" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          {statKey.toUpperCase()}
        </div>
        <button 
          className="info-icon"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          style={{ 
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'help',
            fontSize: 10,
            color: 'var(--muted)',
            opacity: 0.7
          }}
          aria-label={`Info about ${statKey}`}
        >
          ℹ️
        </button>
      </div>
      
      {showTooltip && (
        <div className="tooltip">
          {statDescriptions[statKey]}
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        marginTop: 4
      }}>
        {/* Main stat value with equipment bonus */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <b style={{ fontSize: 18 }}>{baseStat}</b>
          {equipmentBonus > 0 && (
            <span style={{ color: '#6fe19a', fontSize: 12, fontWeight: 'bold' }}>
              +{equipmentBonus}
            </span>
          )}
        </div>
        
        {/* Modifier display */}
        <div style={{ 
          fontSize: 10, 
          color: modifier >= 0 ? '#6fe19a' : '#ef4444',
          fontWeight: 'bold',
          padding: '2px 6px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 3,
          minWidth: 32,
          textAlign: 'center'
        }}>
          {modifierText}
        </div>
      </div>
    </div>
  )
}

export default function PlayerCard() {
  const { name, level, xp, skillPoints, stats, skills, getTotalStats, getSkillBonuses } = useChar()  // Added getSkillBonuses
  const { gold } = useEconomy()
  const [showCraftingTooltip, setCraftingTooltip] = useState(false)
  const [showACTooltip, setShowACTooltip] = useState(false)
  const experienceNeeded = xpForLevel(level)
  const experiencePercent = Math.min(100, Math.floor((xp / experienceNeeded) * 100))

  const craftingLevel = skills.crafting.level
  const craftingXP = skills.crafting.xp
  const craftingXPNeeded = 100 * craftingLevel
  
  // Calculate player's AC with skill bonuses
  const totalStats = getTotalStats()
  const skillBonuses = getSkillBonuses()
  const playerAC = calculatePlayerAC(totalStats, skillBonuses.acBonus)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <b>{name}</b>
        <span className="muted">Lv {level}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <div style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: 14 }}>
          💰 {gold.toLocaleString()} gold
        </div>
        <div style={{ position: 'relative' }}>
          <button
            className="info-icon"
            onMouseEnter={() => setShowACTooltip(true)}
            onMouseLeave={() => setShowACTooltip(false)}
            onFocus={() => setShowACTooltip(true)}
            onBlur={() => setShowACTooltip(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              padding: '4px 8px',
              borderRadius: 6,
              cursor: 'help',
              color: 'var(--text)',
              fontSize: 13,
              fontWeight: 'bold'
            }}
            aria-label="Armor Class info"
          >
            <span>🛡️</span>
            <span>AC {playerAC}</span>
          </button>
          {showACTooltip && (
            <div className="tooltip" style={{ right: 0, left: 'auto', minWidth: 220 }}>
              <strong>Armor Class (AC)</strong><br/>
              • Base: 10 + DEX modifier<br/>
              • Equipment adds AC bonus<br/>
              • Higher AC = harder to hit<br/>
              • Enemies must roll ≥ {playerAC} to hit you
            </div>
          )}
        </div>
      </div>
      
      {/* Combat Stats Breakdown */}
      <div style={{ 
        marginTop: 8, 
        padding: 8, 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: 6,
        fontSize: 12
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 6, color: 'var(--muted)' }}>
          Combat Stats
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Attack Bonus:</span>
            <span style={{ color: '#6fe19a' }}>
              +{Math.floor(level / 4) + 1} (prof) + {calculateModifier(totalStats.str)} (STR) + {skillBonuses.attackBonus.toFixed(1)} (skills) = +{(Math.floor(level / 4) + 1 + calculateModifier(totalStats.str) + skillBonuses.attackBonus).toFixed(1)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Skill Damage:</span>
            <span style={{ color: '#6fe19a' }}>+{skillBonuses.damageBonus.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Skill AC:</span>
            <span style={{ color: '#6fe19a' }}>+{skillBonuses.acBonus.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="xpbar" style={{ marginTop: 6 }}>
        <span style={{ width: experiencePercent + '%' }} />
      </div>
      
      <div className="muted" style={{ marginTop: 4 }}>
        {xp} / {experienceNeeded} XP — Skill points: {skillPoints}
      </div>

      <div style={{ marginTop: 8, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 'bold' }}>Crafting</span>
            <button 
              className="info-icon"
              onMouseEnter={() => setCraftingTooltip(true)}
              onMouseLeave={() => setCraftingTooltip(false)}
              onFocus={() => setCraftingTooltip(true)}
              onBlur={() => setCraftingTooltip(false)}
              style={{ 
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'help',
                fontSize: 10,
                color: 'var(--muted)',
                opacity: 0.7
              }}
              aria-label="Info about crafting skill"
            >
              ℹ️
            </button>
          </div>
          <span className="muted" style={{ fontSize: 11 }}>Lv {craftingLevel}</span>
        </div>
        
        {showCraftingTooltip && (
          <div className="tooltip" style={{ top: '100%', left: 0, marginTop: 4 }}>
            <strong>Crafting Skill</strong><br/>
            • Primary factor in crafting success (50% weight)<br/>
            • Gained through successful crafting attempts<br/>
            • Works with Intelligence (25%) and Dexterity (25%)<br/>
            • Higher level = better success rates
          </div>
        )}
        
        <div className="xpbar" style={{ marginTop: 2 }}>
          <span style={{ width: Math.min(100, (craftingXP / craftingXPNeeded) * 100) + '%' }} />
        </div>
        <div className="muted" style={{ fontSize: 10, marginTop: 2 }}>
          {craftingXP} / {craftingXPNeeded} XP
        </div>
      </div>
      
      <div style={{ marginTop: 8 }}>
        {/* Top row: STR, DEX, CON */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 8 }}>
          <StatButton 
            statKey="str" 
            statValue={stats.str} 
          />
          <StatButton 
            statKey="dex" 
            statValue={stats.dex} 
          />
          <StatButton 
            statKey="con" 
            statValue={stats.con} 
          />
        </div>
        
        {/* Bottom row: INT, WIS, CHA */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <StatButton 
            statKey="int" 
            statValue={stats.int} 
          />
          <StatButton 
            statKey="wis" 
            statValue={stats.wis} 
          />
          <StatButton 
            statKey="cha" 
            statValue={stats.cha} 
          />
        </div>
      </div>
    </div>
  )
}
