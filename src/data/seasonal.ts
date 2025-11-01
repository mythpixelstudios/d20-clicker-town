/**
 * Seasonal System
 * 
 * Framework for seasonal content including:
 * - Seasonal themes with unique visual styles
 * - Seasonal items (equipment, relics, etc.)
 * - Seasonal events
 * - Seasonal currency and rewards
 * - Time-limited challenges
 * 
 * This is a scaffold that can be easily expanded with new seasons.
 */

export type SeasonId = 'winter_frost' | 'spring_bloom' | 'summer_heat' | 'autumn_harvest' | 'none'

export interface SeasonalTheme {
  id: SeasonId
  name: string
  description: string
  icon: string
  
  // Visual theming
  primaryColor: string
  secondaryColor: string
  backgroundEffect?: string // CSS class or animation identifier
  
  // Timing
  startMonth: number // 1-12
  endMonth: number // 1-12
  
  // Gameplay modifiers (optional global effects during season)
  globalModifiers?: {
    damageMultiplier?: number
    goldMultiplier?: number
    xpMultiplier?: number
    materialDropChance?: number
  }
}

export interface SeasonalItem {
  id: string
  name: string
  description: string
  seasonId: SeasonId
  type: 'equipment' | 'relic' | 'consumable' | 'cosmetic'
  rarity: 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
  icon: string
  
  // Availability
  requiresSeasonalCurrency?: number
  requiresLevel?: number
  limitedQuantity?: number // Max per player per season
  
  // Stats (type-dependent)
  stats?: any // Will vary based on type
}

export interface SeasonalEvent {
  id: string
  name: string
  description: string
  seasonId: SeasonId
  eventType: 'golden_meteor' | 'wandering_merchant' | 'monster_horde' | 'blessing' | 'seasonal'
  
  // Enhanced spawn rate during season
  spawnChanceMultiplier: number
  
  // Season-specific rewards
  additionalRewards?: Array<{
    type: string
    amount?: number
    itemId?: string
  }>
}

export interface SeasonalChallenge {
  id: string
  name: string
  description: string
  seasonId: SeasonId
  icon: string
  
  // Requirements
  objectives: Array<{
    id: string
    description: string
    target: number
    current?: number
  }>
  
  // Rewards
  rewards: Array<{
    type: 'seasonal_currency' | 'gold' | 'xp' | 'item'
    amount?: number
    itemId?: string
  }>
  
  // Tracking
  repeatable: boolean
}

export interface SeasonalCurrency {
  id: string
  name: string
  description: string
  seasonId: SeasonId
  icon: string
  
  // Can be earned from seasonal events and challenges
}

// Define seasonal themes
export const seasons: SeasonalTheme[] = [
  {
    id: 'winter_frost',
    name: 'Winter Frost',
    description: 'A season of ice and snow, where the cold brings unique challenges and rewards',
    icon: '❄️',
    primaryColor: '#60a5fa',
    secondaryColor: '#dbeafe',
    backgroundEffect: 'snowfall',
    startMonth: 12,
    endMonth: 2,
    globalModifiers: {
      materialDropChance: 0.05, // +5% material drop during winter
    }
  },
  {
    id: 'spring_bloom',
    name: 'Spring Bloom',
    description: 'Nature awakens with renewed vigor and growth',
    icon: '🌸',
    primaryColor: '#86efac',
    secondaryColor: '#dcfce7',
    backgroundEffect: 'petals-falling',
    startMonth: 3,
    endMonth: 5,
    globalModifiers: {
      xpMultiplier: 1.1, // +10% XP during spring
    }
  },
  {
    id: 'summer_heat',
    name: 'Summer Heat',
    description: 'The blazing sun brings fierce battles and golden rewards',
    icon: '☀️',
    primaryColor: '#fbbf24',
    secondaryColor: '#fef3c7',
    backgroundEffect: 'heat-shimmer',
    startMonth: 6,
    endMonth: 8,
    globalModifiers: {
      goldMultiplier: 1.15, // +15% gold during summer
    }
  },
  {
    id: 'autumn_harvest',
    name: 'Autumn Harvest',
    description: 'Reap the rewards of your efforts in this season of plenty',
    icon: '🍂',
    primaryColor: '#f97316',
    secondaryColor: '#fed7aa',
    backgroundEffect: 'leaves-falling',
    startMonth: 9,
    endMonth: 11,
    globalModifiers: {
      damageMultiplier: 1.1, // +10% damage during autumn
      materialDropChance: 0.1, // +10% material drop during harvest
    }
  }
]

// Seasonal items (examples - easily expandable)
export const seasonalItems: SeasonalItem[] = [
  // Winter items
  {
    id: 'frostbite_blade',
    name: 'Frostbite Blade',
    description: 'A weapon forged from eternal ice',
    seasonId: 'winter_frost',
    type: 'equipment',
    rarity: 'epic',
    icon: '🗡️',
    requiresSeasonalCurrency: 500,
    requiresLevel: 20,
    stats: {
      clickDamage: 50,
      critChance: 0.08,
      // Special: Chance to slow enemies
    }
  },
  {
    id: 'snowflake_charm',
    name: 'Snowflake Charm',
    description: 'Each snowflake is unique, like this precious relic',
    seasonId: 'winter_frost',
    type: 'relic',
    rarity: 'legendary',
    icon: '❄️',
    requiresSeasonalCurrency: 1000,
    requiresLevel: 30,
    limitedQuantity: 1,
  },

  // Spring items
  {
    id: 'blooming_staff',
    name: 'Blooming Staff',
    description: 'Life energy flows through this magical staff',
    seasonId: 'spring_bloom',
    type: 'equipment',
    rarity: 'rare',
    icon: '🌸',
    requiresSeasonalCurrency: 400,
    requiresLevel: 15,
  },
  {
    id: 'renewal_potion',
    name: 'Potion of Renewal',
    description: 'Instantly gain bonus XP',
    seasonId: 'spring_bloom',
    type: 'consumable',
    rarity: 'uncommon',
    icon: '🧪',
    requiresSeasonalCurrency: 50,
  },

  // Summer items
  {
    id: 'solar_hammer',
    name: 'Solar Hammer',
    description: 'Infused with the power of the sun',
    seasonId: 'summer_heat',
    type: 'equipment',
    rarity: 'epic',
    icon: '🔨',
    requiresSeasonalCurrency: 600,
    requiresLevel: 25,
  },
  {
    id: 'golden_trophy',
    name: 'Golden Trophy',
    description: 'A symbol of summer victories',
    seasonId: 'summer_heat',
    type: 'relic',
    rarity: 'epic',
    icon: '🏆',
    requiresSeasonalCurrency: 800,
  },

  // Autumn items
  {
    id: 'harvest_scythe',
    name: 'Harvest Scythe',
    description: 'Reap your enemies like wheat',
    seasonId: 'autumn_harvest',
    type: 'equipment',
    rarity: 'legendary',
    icon: '🪓',
    requiresSeasonalCurrency: 1200,
    requiresLevel: 35,
  },
  {
    id: 'cornucopia',
    name: 'Cornucopia',
    description: 'Overflowing with abundance',
    seasonId: 'autumn_harvest',
    type: 'relic',
    rarity: 'legendary',
    icon: '🌽',
    requiresSeasonalCurrency: 1500,
    limitedQuantity: 1,
  },

  // Universal seasonal cosmetics
  {
    id: 'seasonal_title_frame',
    name: 'Seasonal Title Frame',
    description: 'Display your seasonal pride',
    seasonId: 'none',
    type: 'cosmetic',
    rarity: 'rare',
    icon: '🎨',
    requiresSeasonalCurrency: 300,
  }
]

// Seasonal currency
export const seasonalCurrencies: SeasonalCurrency[] = [
  {
    id: 'frost_tokens',
    name: 'Frost Tokens',
    description: 'Currency earned during Winter Frost season',
    seasonId: 'winter_frost',
    icon: '❄️',
  },
  {
    id: 'bloom_petals',
    name: 'Bloom Petals',
    description: 'Currency earned during Spring Bloom season',
    seasonId: 'spring_bloom',
    icon: '🌸',
  },
  {
    id: 'sun_medallions',
    name: 'Sun Medallions',
    description: 'Currency earned during Summer Heat season',
    seasonId: 'summer_heat',
    icon: '☀️',
  },
  {
    id: 'harvest_coins',
    name: 'Harvest Coins',
    description: 'Currency earned during Autumn Harvest season',
    seasonId: 'autumn_harvest',
    icon: '🍂',
  }
]

// Seasonal challenges (examples)
export const seasonalChallenges: SeasonalChallenge[] = [
  {
    id: 'winter_monster_hunter',
    name: 'Winter Monster Hunter',
    description: 'Defeat 100 monsters during Winter Frost',
    seasonId: 'winter_frost',
    icon: '❄️',
    objectives: [
      {
        id: 'kill_monsters',
        description: 'Defeat monsters',
        target: 100,
      }
    ],
    rewards: [
      {
        type: 'seasonal_currency',
        amount: 200,
      },
      {
        type: 'item',
        itemId: 'winter_chest',
      }
    ],
    repeatable: false,
  },
  {
    id: 'spring_gatherer',
    name: 'Spring Gatherer',
    description: 'Collect 50 materials during Spring Bloom',
    seasonId: 'spring_bloom',
    icon: '🌸',
    objectives: [
      {
        id: 'collect_materials',
        description: 'Collect materials',
        target: 50,
      }
    ],
    rewards: [
      {
        type: 'seasonal_currency',
        amount: 150,
      },
      {
        type: 'xp',
        amount: 500,
      }
    ],
    repeatable: true,
  },
  // Add more challenges as needed
]

// Helper functions
export function getCurrentSeason(): SeasonalTheme {
  const currentMonth = new Date().getMonth() + 1 // 1-12
  
  const activeSeason = seasons.find(season => {
    // Handle seasons that span across year boundary (e.g., Dec-Feb)
    if (season.startMonth > season.endMonth) {
      return currentMonth >= season.startMonth || currentMonth <= season.endMonth
    }
    return currentMonth >= season.startMonth && currentMonth <= season.endMonth
  })
  
  return activeSeason || seasons[0] // Default to first season if none match
}

export function getSeasonById(seasonId: SeasonId): SeasonalTheme | undefined {
  return seasons.find(s => s.id === seasonId)
}

export function getSeasonalItemsBySeason(seasonId: SeasonId): SeasonalItem[] {
  return seasonalItems.filter(item => item.seasonId === seasonId || item.seasonId === 'none')
}

export function getSeasonalChallengesBySeason(seasonId: SeasonId): SeasonalChallenge[] {
  return seasonalChallenges.filter(c => c.seasonId === seasonId)
}

export function getSeasonalCurrency(seasonId: SeasonId): SeasonalCurrency | undefined {
  return seasonalCurrencies.find(c => c.seasonId === seasonId)
}

export function isSeasonActive(seasonId: SeasonId): boolean {
  const current = getCurrentSeason()
  return current.id === seasonId
}

// Calculate how many days until next season
export function getDaysUntilNextSeason(): number {
  const now = new Date()
  const currentSeason = getCurrentSeason()
  
  // Find the end month of current season
  let nextSeasonMonth = currentSeason.endMonth + 1
  if (nextSeasonMonth > 12) nextSeasonMonth = 1
  
  // Calculate days
  const nextSeasonDate = new Date(now.getFullYear(), nextSeasonMonth - 1, 1)
  if (nextSeasonDate < now) {
    nextSeasonDate.setFullYear(nextSeasonDate.getFullYear() + 1)
  }
  
  const diffTime = nextSeasonDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Integration notes:
 * 
 * 1. Create a seasonalStore to manage:
 *    - Current season state
 *    - Player's seasonal currency balances
 *    - Completed seasonal challenges
 *    - Owned seasonal items
 * 
 * 2. Apply global modifiers from active season to:
 *    - Combat calculations
 *    - Gold/XP rewards
 *    - Material drop rates
 * 
 * 3. UI components needed:
 *    - SeasonalShop panel for purchasing items
 *    - SeasonalChallenges panel
 *    - Season indicator in main UI
 *    - Countdown timer to next season
 * 
 * 4. Seasonal event integration:
 *    - Modify event spawn chances during active season
 *    - Add seasonal currency to event rewards
 *    - Enable seasonal-specific events
 * 
 * 5. Seasonal progression:
 *    - Track player's seasonal level/progress
 *    - Unlock items as they progress
 *    - Reset seasonal progress each season (but keep purchased items)
 */
