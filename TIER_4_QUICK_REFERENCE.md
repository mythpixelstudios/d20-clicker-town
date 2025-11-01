# Quick Reference: Adding New Tier 4 Content

This guide shows you exactly how to add new relics, events, expeditions, and seasonal items to the game.

## Adding a New Relic

**File:** `src/data/relics.ts`

Add to the `relics` array:

```typescript
{
  id: 'your_relic_id', // Unique identifier
  name: 'Your Relic Name',
  description: 'Short description of what it does',
  lore: 'Optional flavor text about its origin', // Optional
  rarity: 'rare', // uncommon | rare | epic | legendary | mythic
  category: 'combat', // combat | economy | progression | exploration | crafting
  icon: '⚡', // Emoji or icon
  
  effects: [
    {
      id: 'effect_id',
      description: 'What this effect does',
      stats: {
        // Choose from available stats:
        damageMultiplier: 1.15,           // +15% damage
        critChanceBonus: 0.05,            // +5% crit chance
        critDamageMultiplier: 1.25,       // +25% crit damage
        autoSpeedMultiplier: 1.2,         // +20% attack speed
        goldMultiplier: 1.2,              // +20% gold
        materialDropChance: 0.1,          // +10% material drops
        xpMultiplier: 1.15,               // +15% XP
        prestigeTokenMultiplier: 1.1,     // +10% prestige tokens
        craftingSpeedMultiplier: 1.25,    // +25% crafting speed
        craftingQualityChance: 0.05,      // +5% quality upgrade chance
        offlineProgressMultiplier: 1.3,   // +30% offline progress
        dailyQuestRewardMultiplier: 1.2,  // +20% daily quest rewards
        expeditionSpeedMultiplier: 1.15,  // +15% expedition speed
      }
    }
  ],
  
  // Discovery requirements (all optional)
  discoveryRequirements: {
    level: 15,                           // Player level
    zone: 4,                             // Zone number
    bossDefeats: {                       // Boss defeats required
      'dragon_boss': 1
    },
    achievementIds: ['achievement_id'],  // Required achievements
    prestigeLevel: 2,                    // Prestige level
  }
}
```

**Slot Limits by Rarity:**
- Uncommon: 2 slots
- Rare: 2 slots
- Epic: 1 slot
- Legendary: 1 slot
- Mythic: 1 slot

---

## Adding a New Event

**File:** `src/data/events.ts`

Add to the `gameEvents` array:

```typescript
{
  id: 'your_event_id',
  name: 'Your Event Name',
  description: 'What players see when event spawns',
  type: 'golden_meteor', // golden_meteor | wandering_merchant | monster_horde | blessing | seasonal
  rarity: 'rare', // common | uncommon | rare | epic | legendary
  icon: '☄️',
  
  // Visual effects (optional)
  animationEffect: 'meteor-fall', // CSS class
  soundEffect: 'meteor_whoosh',   // Sound ID
  
  // Spawn configuration
  spawnChance: 0.05,      // 5% chance per check (0-1)
  spawnInterval: 60,      // Check every 60 seconds
  duration: 15,           // Event lasts 15 seconds
  
  // Requirements (optional)
  spawnRequirements: {
    minLevel: 5,
    minZone: 2,
    timeOfDay: 'any',     // day | night | any
    activeOnly: true,     // Only spawn when player active
  },
  
  // Interaction type
  interactionType: 'click', // click | automatic | choice
  clicksRequired: 1,        // For click type only
  
  // For choice type, add this:
  choices: [
    {
      id: 'choice_1',
      text: 'Option 1 text',
      rewards: [/* reward objects */],
      chance: 1.0,  // Success chance (optional, default 1.0)
    },
    {
      id: 'choice_2',
      text: 'Option 2 text',
      rewards: [/* reward objects */],
      chance: 0.5,  // 50% success rate
    }
  ],
  
  // Rewards
  baseRewards: [
    {
      type: 'gold',
      amount: 500,
    },
    {
      type: 'xp',
      amount: 250,
    },
    {
      type: 'buff',
      buffId: 'meteor_blessing',
      duration: 300, // seconds
    }
  ],
  
  // Bonus rewards (optional)
  bonusRewards: [
    {
      type: 'materials',
      materialIds: {
        'star_fragment': 1,
        'gold_ore': 3,
      }
    }
  ],
  bonusChance: 0.25, // 25% chance for bonus
  
  cooldown: 300, // 5 minute cooldown before can spawn again
}
```

**Reward Types:**
- `gold`: { type: 'gold', amount: 500 }
- `xp`: { type: 'xp', amount: 250 }
- `materials`: { type: 'materials', materialIds: { 'item_id': amount } }
- `buff`: { type: 'buff', buffId: 'buff_id', duration: 300 }
- `relic`: { type: 'relic', itemId: 'relic_id' }
- `equipment`: { type: 'equipment', itemId: 'equipment_id' }

---

## Adding a New Event Buff

**File:** `src/data/events.ts`

Add to the `eventBuffs` array:

```typescript
{
  id: 'your_buff_id',
  name: 'Buff Name',
  description: 'What the buff does',
  icon: '✨',
  duration: 300, // 5 minutes in seconds
  
  effects: {
    damageMultiplier: 1.25,      // +25% damage
    goldMultiplier: 1.5,         // +50% gold
    xpMultiplier: 1.3,           // +30% XP
    materialDropChance: 0.15,    // +15% materials
    critChanceBonus: 0.1,        // +10% crit chance
    autoSpeedMultiplier: 1.3,    // +30% attack speed
  }
}
```

---

## Adding a New Expedition

**File:** `src/data/expeditions.ts`

Add to the `expeditions` array:

```typescript
{
  id: 'your_expedition_id',
  name: 'Expedition Name',
  description: 'Brief description',
  lore: 'Optional backstory',
  type: 'exploration', // exploration | gathering | combat | diplomatic | treasure_hunt
  difficulty: 'medium', // easy | medium | hard | expert | legendary
  icon: '🗺️',
  
  // Duration and success
  baseDuration: 600,        // 10 minutes in seconds
  baseSuccessChance: 0.75,  // 75% base success rate
  
  // Requirements (optional)
  requirements: {
    minPlayerLevel: 15,
    minZone: 4,
    npcLevel: 3,                    // Min NPC level
    npcTraits: ['scout'],           // Preferred traits
    completedExpeditions: ['other_expedition'], // Prerequisites
    buildings: [
      { id: 'mine', level: 3 }
    ],
    materials: {
      'ancient_map': 1
    }
  },
  
  // Costs
  cost: {
    gold: 200,
    materials: {
      'torch': 3,
      'rope': 1,
    }
  },
  
  // Rewards
  successRewards: [
    {
      type: 'gold',
      amount: 500,
    },
    {
      type: 'materials',
      materialIds: {
        'iron_ore': 15,
        'gems': 5,
      }
    },
    {
      type: 'npc_xp',
      npcXpAmount: 150, // XP for the NPC
    }
  ],
  
  // Failure rewards (optional, partial)
  failureRewards: [
    {
      type: 'materials',
      materialIds: {
        'iron_ore': 3,
      }
    }
  ],
  
  repeatable: true, // Can do multiple times
  
  // Random events during expedition (optional)
  events: [
    {
      id: 'treasure_found',
      description: 'Your NPC found extra treasure!',
      chance: 0.15, // 15% chance
      effects: {
        additionalRewards: [
          { type: 'gold', amount: 300 }
        ]
      }
    },
    {
      id: 'delay',
      description: 'Progress was slowed!',
      chance: 0.1,
      effects: {
        durationMultiplier: 1.3, // 30% longer
      }
    }
  ],
  
  // NPC synergy bonuses (optional)
  npcSynergy: {
    traitBonuses: {
      'scout': {
        durationReduction: 0.25,  // 25% faster
        successBonus: 0.1,        // +10% success
        rewardBonus: 1.2,         // 20% more rewards
      },
      'brave': {
        successBonus: 0.15,
      }
    }
  }
}
```

**Difficulty Stats:**
| Difficulty | Success | Duration | Rewards |
|------------|---------|----------|---------|
| Easy       | 90%     | 1x       | 1x      |
| Medium     | 75%     | 1.5x     | 1.5x    |
| Hard       | 60%     | 2x       | 2.5x    |
| Expert     | 40%     | 3x       | 4x      |
| Legendary  | 25%     | 4x       | 6x      |

---

## Adding a New Seasonal Item

**File:** `src/data/seasonal.ts`

Add to the `seasonalItems` array:

```typescript
{
  id: 'your_item_id',
  name: 'Item Name',
  description: 'What it does',
  seasonId: 'winter_frost', // winter_frost | spring_bloom | summer_heat | autumn_harvest | none
  type: 'equipment', // equipment | relic | consumable | cosmetic
  rarity: 'epic', // uncommon | rare | epic | legendary | mythic
  icon: '⚔️',
  
  // Purchase requirements
  requiresSeasonalCurrency: 500, // Cost in seasonal currency
  requiresLevel: 20,              // Player level required
  limitedQuantity: 1,             // Max purchases per season (optional)
  
  // Stats (varies by type)
  stats: {
    // For equipment:
    clickDamage: 50,
    critChance: 0.08,
    
    // For relics, use relic stat format
    // For consumables, define effect
  }
}
```

**Season IDs:**
- `winter_frost`: December - February
- `spring_bloom`: March - May
- `summer_heat`: June - August
- `autumn_harvest`: September - November
- `none`: Available year-round

---

## Adding a New Season

**File:** `src/data/seasonal.ts`

Add to the `seasons` array:

```typescript
{
  id: 'your_season_id',
  name: 'Season Name',
  description: 'Season flavor text',
  icon: '🌺',
  
  // Visual theming
  primaryColor: '#10b981',
  secondaryColor: '#d1fae5',
  backgroundEffect: 'petals-falling', // CSS class
  
  // Timing (1-12)
  startMonth: 3,  // March
  endMonth: 5,    // May
  
  // Global modifiers (optional)
  globalModifiers: {
    damageMultiplier: 1.1,       // +10% damage
    goldMultiplier: 1.15,        // +15% gold
    xpMultiplier: 1.1,           // +10% XP
    materialDropChance: 0.05,    // +5% materials
  }
}
```

---

## Testing Your New Content

### Test Relics
```typescript
// In browser console
const store = window.relicStore.getState()

// Discover your relic
store.discoverRelic('your_relic_id')

// Equip it
store.equipRelic('your_relic_id')

// Check stats
console.log(store.getTotalStats())
```

### Test Events
```typescript
const store = window.eventStore.getState()

// Force spawn check (may need multiple tries)
store.checkForEventSpawns()

// Check active event
console.log(store.activeEvent)

// Interact with event
store.interactWithEvent()

// Or for choice event
store.interactWithEvent('choice_id')
```

### Test Expeditions
```typescript
const expStore = window.expeditionStore.getState()
const tavernStore = window.tavernStore.getState()

// Get an NPC
const npcId = Object.keys(tavernStore.npcs)[0]

// Start expedition
expStore.startExpedition('your_expedition_id', npcId)

// Check progress
console.log(expStore.activeExpeditions)

// Force complete (for testing)
const activeId = Object.keys(expStore.activeExpeditions)[0]
expStore.completeExpedition(activeId)
```

### Test Seasonal
```typescript
// Import functions
const { getCurrentSeason, getSeasonalItemsBySeason } = await import('./src/data/seasonal')

// Check current season
console.log(getCurrentSeason())

// Get items for season
console.log(getSeasonalItemsBySeason('winter_frost'))
```

---

## Common Patterns

### Multiplicative vs Additive
- **Multiplicative** (e.g., damage): Stack as multipliers (1.1 * 1.2 = 1.32)
- **Additive** (e.g., crit chance): Add together (0.05 + 0.03 = 0.08)

### Duration Format
Always in seconds:
- 1 minute = 60
- 5 minutes = 300
- 10 minutes = 600
- 1 hour = 3600

### Reward Scaling
Event/expedition rewards scale with player level:
```typescript
finalAmount = baseAmount * (1 + playerLevel * 0.1)
```

### Success Chances
- Always between 0 and 1 (0.5 = 50%)
- System clamps between 5% and 95%
- NPC level adds 1% per level
- Trait bonuses are additive

---

## Best Practices

1. **Unique IDs**: Use descriptive, unique IDs (snake_case)
2. **Balanced Stats**: Compare to existing items of same rarity
3. **Clear Descriptions**: Be explicit about what bonuses do
4. **Test Thoroughly**: Use console commands to verify
5. **Progressive Unlocks**: Lock high-power items behind requirements
6. **Flavor Text**: Add lore to make items interesting
7. **Icon Consistency**: Use appropriate emojis for categories

---

## Getting Help

- Check existing items in data files for examples
- All interfaces are TypeScript - follow the types
- Console.log stores to see current state
- Read `TIER_4_IMPLEMENTATION.md` for architecture details
