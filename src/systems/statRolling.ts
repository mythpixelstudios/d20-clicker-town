// D&D 5e Style Stat Rolling System

export type StatName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface RolledStats {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface StatRollSet {
  id: number
  stats: RolledStats
  total: number // Sum of all stats for comparison
  modifierTotal: number // Sum of all modifiers
}

/**
 * Roll for initial character stats
 * Rolls directly in the 8-18 range with even distribution
 * This gives starting scores from 8-18 (buffs/equipment can exceed this later)
 * Min: 8 (very weak starting point)
 * Max: 18 (heroic starting point)
 * Each value has an equal ~9% chance
 */
export function rollInitialStat(): number {
  // Roll directly in the 8-18 range (11 possible values)
  const roll = Math.floor(Math.random() * 11) + 8
  return roll
}

/**
 * Roll a standard d20 (1-20)
 * Used for skill checks, attack rolls, saving throws, etc.
 * Returns values from 1-20 with equal probability
 */
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

/**
 * Calculate D&D 5e ability modifier from raw stat
 * Formula: (stat - 10) / 2, rounded down
 * 
 * Note: Initial rolls are capped at 5-18, but equipment/buffs can push beyond this
 * Modifiers are always calculated from the final stat value (including bonuses)
 * 
 * Stat | Modifier
 * -----|----------
 *  1   |   -5
 *  5   |   -3 (minimum initial roll)
 *  8-9 |   -1
 * 10-11|    0
 * 12-13|   +1
 * 14-15|   +2
 * 16-17|   +3
 * 18-19|   +4 (18 is max initial roll)
 *  20+ |   +5 or higher (with equipment/buffs)
 */
export function calculateModifier(statValue: number): number {
  return Math.floor((statValue - 10) / 2)
}

/**
 * Get modifier as a formatted string (e.g., "+3", "-1", "0")
 */
export function formatModifier(modifier: number): string {
  if (modifier > 0) return `+${modifier}`
  return modifier.toString()
}

/**
 * Roll stats for all 6 abilities (for initial character creation)
 */
export function rollAllStats(): RolledStats {
  return {
    str: rollInitialStat(),
    dex: rollInitialStat(),
    con: rollInitialStat(),
    int: rollInitialStat(),
    wis: rollInitialStat(),
    cha: rollInitialStat()
  }
}

/**
 * Calculate the total value of a stat set
 */
export function calculateStatTotal(stats: RolledStats): number {
  return stats.str + stats.dex + stats.con + stats.int + stats.wis + stats.cha
}

/**
 * Calculate the total modifier value of a stat set
 */
export function calculateModifierTotal(stats: RolledStats): number {
  return (
    calculateModifier(stats.str) +
    calculateModifier(stats.dex) +
    calculateModifier(stats.con) +
    calculateModifier(stats.int) +
    calculateModifier(stats.wis) +
    calculateModifier(stats.cha)
  )
}

/**
 * Generate 3 sets of rolled stats for player to choose from
 */
export function generateThreeRollSets(): StatRollSet[] {
  const sets: StatRollSet[] = []
  
  for (let i = 0; i < 3; i++) {
    const stats = rollAllStats()
    sets.push({
      id: i + 1,
      stats,
      total: calculateStatTotal(stats),
      modifierTotal: calculateModifierTotal(stats)
    })
  }
  
  return sets
}

/**
 * Get the stat set with the highest total
 */
export function getBestRollSet(sets: StatRollSet[]): StatRollSet {
  return sets.reduce((best, current) => 
    current.total > best.total ? current : best
  )
}

/**
 * Get stat name display label
 */
export function getStatLabel(stat: StatName): string {
  const labels: Record<StatName, string> = {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma'
  }
  return labels[stat]
}

/**
 * Get stat name abbreviation
 */
export function getStatAbbreviation(stat: StatName): string {
  return stat.toUpperCase()
}

/**
 * Get stat description
 */
export function getStatDescription(stat: StatName): string {
  const descriptions: Record<StatName, string> = {
    str: 'Increases melee damage and click damage',
    dex: 'Increases attack speed and critical hit chance',
    con: 'Increases maximum health and survivability',
    int: 'Increases auto-clicker damage and magic power',
    wis: 'Increases experience gain and resource drops',
    cha: 'Improves shop prices and quest rewards'
  }
  return descriptions[stat]
}

/**
 * Calculate all modifiers for a stat set
 */
export function calculateAllModifiers(stats: RolledStats): Record<StatName, number> {
  return {
    str: calculateModifier(stats.str),
    dex: calculateModifier(stats.dex),
    con: calculateModifier(stats.con),
    int: calculateModifier(stats.int),
    wis: calculateModifier(stats.wis),
    cha: calculateModifier(stats.cha)
  }
}

/**
 * Get stat quality description based on value
 * Initial rolls range from 5-18 (equipment/buffs can exceed this)
 */
export function getStatQuality(statValue: number): { label: string; color: string } {
  if (statValue >= 18) return { label: 'Heroic', color: '#f59e0b' } // Orange/Gold (max initial roll)
  if (statValue >= 16) return { label: 'Exceptional', color: '#a855f7' } // Purple
  if (statValue >= 14) return { label: 'Great', color: '#3b82f6' } // Blue
  if (statValue >= 12) return { label: 'Good', color: '#22c55e' } // Green
  if (statValue >= 10) return { label: 'Average', color: '#9ca3af' } // Gray
  if (statValue >= 8) return { label: 'Below Average', color: '#ef4444' } // Red
  if (statValue >= 5) return { label: 'Poor', color: '#dc2626' } // Dark Red (min initial roll)
  return { label: 'Very Poor', color: '#991b1b' } // Darker Red (only possible with debuffs)
}

/**
 * Validate stat values are within acceptable range
 * Initial rolls: 5-18
 * With equipment/buffs: can go outside this range
 */
export function validateStats(stats: RolledStats): boolean {
  const values = Object.values(stats)
  // Allow a wider range for validation (1-30) to account for buffs/debuffs
  return values.every(v => v >= 1 && v <= 30)
}
