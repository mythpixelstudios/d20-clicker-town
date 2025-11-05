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
    <div className="relative">
      <div className="flex items-center justify-center gap-1">
        <div className="text-xs text-muted">
          {statKey.toUpperCase()}
        </div>
        <button
          className="bg-transparent border-none p-0 cursor-help text-[10px] text-muted opacity-70 hover:opacity-100 transition-opacity"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
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

      <div className="flex flex-col items-center gap-0.5 mt-1">
        {/* Main stat value with equipment bonus */}
        <div className="flex items-baseline gap-1">
          <b className="text-lg">{baseStat}</b>
          {equipmentBonus > 0 && (
            <span className="text-[#6fe19a] text-xs font-bold">
              +{equipmentBonus}
            </span>
          )}
        </div>

        {/* Modifier display */}
        <div
          className="text-[10px] font-bold px-1.5 py-0.5 bg-black/30 rounded min-w-[32px] text-center"
          style={{ color: modifier >= 0 ? '#6fe19a' : '#ef4444' }}
        >
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
    <div className="bg-panel border border-white/[0.06] rounded-xl p-4 shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
      <div className="flex justify-between">
        <b>{name}</b>
        <span className="text-muted">Lv {level}</span>
      </div>

      <div className="flex justify-between items-center mt-1">
        <div className="text-gold font-bold text-sm">
          💰 {gold.toLocaleString()} gold
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/40 px-2 py-1 rounded-md cursor-help text-text text-[13px] font-bold hover:bg-blue-500/30 transition-colors"
            onMouseEnter={() => setShowACTooltip(true)}
            onMouseLeave={() => setShowACTooltip(false)}
            onFocus={() => setShowACTooltip(true)}
            onBlur={() => setShowACTooltip(false)}
            aria-label="Armor Class info"
          >
            <span>🛡️</span>
            <span>AC {playerAC}</span>
          </button>
          {showACTooltip && (
            <div className="tooltip right-0 left-auto min-w-[220px]">
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
      <div className="mt-2 p-2 bg-black/20 rounded-md text-xs">
        <div className="font-bold mb-1.5 text-muted">
          Combat Stats
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Attack Bonus:</span>
            <span className="text-[#6fe19a]">
              +{Math.floor(level / 4) + 1} (prof) + {calculateModifier(totalStats.str)} (STR) + {skillBonuses.attackBonus.toFixed(1)} (skills) = +{(Math.floor(level / 4) + 1 + calculateModifier(totalStats.str) + skillBonuses.attackBonus).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Skill Damage:</span>
            <span className="text-[#6fe19a]">+{skillBonuses.damageBonus.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span>Skill AC:</span>
            <span className="text-[#6fe19a]">+{skillBonuses.acBonus.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300 rounded-full"
          style={{ width: experiencePercent + '%' }}
        />
      </div>

      <div className="text-muted mt-1 text-sm">
        {xp} / {experienceNeeded} XP — Skill points: {skillPoints}
      </div>

      <div className="mt-2 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold">Crafting</span>
            <button
              className="bg-transparent border-none p-0 cursor-help text-[10px] text-muted opacity-70 hover:opacity-100 transition-opacity"
              onMouseEnter={() => setCraftingTooltip(true)}
              onMouseLeave={() => setCraftingTooltip(false)}
              onFocus={() => setCraftingTooltip(true)}
              onBlur={() => setCraftingTooltip(false)}
              aria-label="Info about crafting skill"
            >
              ℹ️
            </button>
          </div>
          <span className="text-muted text-[11px]">Lv {craftingLevel}</span>
        </div>

        {showCraftingTooltip && (
          <div className="tooltip top-full left-0 mt-1">
            <strong>Crafting Skill</strong><br/>
            • Primary factor in crafting success (50% weight)<br/>
            • Gained through successful crafting attempts<br/>
            • Works with Intelligence (25%) and Dexterity (25%)<br/>
            • Higher level = better success rates
          </div>
        )}

        <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mt-0.5">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-300 rounded-full"
            style={{ width: Math.min(100, (craftingXP / craftingXPNeeded) * 100) + '%' }}
          />
        </div>
        <div className="text-muted text-[10px] mt-0.5">
          {craftingXP} / {craftingXPNeeded} XP
        </div>
      </div>

      <div className="mt-2">
        {/* Top row: STR, DEX, CON */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <StatButton
              statKey="str"
              statValue={stats.str}
            />
          </div>
          <div className="flex-1">
            <StatButton
              statKey="dex"
              statValue={stats.dex}
            />
          </div>
          <div className="flex-1">
            <StatButton
              statKey="con"
              statValue={stats.con}
            />
          </div>
        </div>

        {/* Bottom row: INT, WIS, CHA */}
        <div className="flex gap-2">
          <div className="flex-1">
            <StatButton
              statKey="int"
              statValue={stats.int}
            />
          </div>
          <div className="flex-1">
            <StatButton
              statKey="wis"
              statValue={stats.wis}
            />
          </div>
          <div className="flex-1">
            <StatButton
              statKey="cha"
              statValue={stats.cha}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
