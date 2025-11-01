# D&D vs Current Game: XP Progression Analysis

## D&D 5th Edition Progression

### Level-Up Table (D&D 5e)
| Level | Total XP | XP for Next Level | Stat Points (ASI) |
|-------|----------|-------------------|-------------------|
| 1     | 0        | 300               | 0                 |
| 2     | 300      | 600               | 0                 |
| 3     | 900      | 1,800             | 0                 |
| 4     | 2,700    | 3,800             | +2 (ASI)          |
| 5     | 6,500    | 7,500             | 0                 |
| 6     | 14,000   | 9,000             | 0                 |
| 7     | 23,000   | 11,000            | 0                 |
| 8     | 34,000   | 14,000            | +2 (ASI)          |
| 9     | 48,000   | 16,000            | 0                 |
| 10    | 64,000   | 21,000            | 0                 |
| 11    | 85,000   | 15,000            | 0                 |
| 12    | 100,000  | 20,000            | +2 (ASI)          |
| 13    | 120,000  | 20,000            | 0                 |
| 14    | 140,000  | 25,000            | 0                 |
| 15    | 165,000  | 30,000            | 0                 |
| 16    | 195,000  | 30,000            | +2 (ASI)          |
| 17    | 225,000  | 40,000            | 0                 |
| 18    | 265,000  | 40,000            | 0                 |
| 19    | 305,000  | 50,000            | +2 (ASI)          |
| 20    | 355,000  | -                 | 0                 |

**Key Points:**
- Stat points (ASI = Ability Score Improvement) only at levels 4, 8, 12, 16, 19
- That's **10 total stat points** across 20 levels (5 ASIs × 2 points each)
- Most power comes from class features, spells, and equipment
- Level 20 is typically the maximum

### D&D Monster XP Rewards (by Challenge Rating)

| CR   | Monster Type         | XP Reward | Equivalent Level |
|------|----------------------|-----------|------------------|
| 0    | Rat, Commoner        | 10        | -                |
| 1/8  | Guard, Bandit        | 25        | 1                |
| 1/4  | Goblin, Skeleton     | 50        | 1                |
| 1/2  | Orc, Black Bear      | 100       | 1-2              |
| 1    | Dire Wolf, Specter   | 200       | 2-4              |
| 2    | Ogre, Ghast          | 450       | 3-5              |
| 3    | Veteran, Mummy       | 700       | 4-6              |
| 4    | Ettin, Black Pudding | 1,100     | 5-7              |
| 5    | Hill Giant, Troll    | 1,800     | 6-8              |
| 6    | Chimera, Wyvern      | 2,300     | 7-9              |
| 7    | Stone Giant          | 2,900     | 8-10             |
| 8    | Frost Giant          | 3,900     | 9-11             |
| 9    | Fire Giant           | 5,000     | 10-12            |
| 10   | Stone Golem          | 5,900     | 11-13            |
| 15   | Adult Red Dragon     | 13,000    | 15-17            |
| 20   | Pit Fiend            | 25,000    | 18-20            |
| 30   | Tarrasque            | 155,000   | 20               |

---

## Current Game Progression

### Current Level-Up Table
| Level | XP Required | Cumulative XP | Stat Points Gained |
|-------|-------------|---------------|-------------------|
| 1     | 0           | 0             | 5 (starting)      |
| 2     | 50          | 50            | +3                |
| 3     | 63          | 113           | +3                |
| 4     | 78          | 191           | +3                |
| 5     | 98          | 289           | +3                |
| 10    | 279         | 1,935         | +3                |
| 20    | 2,620       | 25,884        | +3                |
| 30    | 24,580      | 287,914       | +3                |

**Formula:** `Math.ceil(50 * Math.pow(1.25, level - 1))`

**Problems:**
- Players get **3 stat points EVERY level** = 60 stat points by level 20!
- Way too generous compared to D&D's 10 points total
- Makes gear feel less important when you can just pump stats

### Current Monster XP Rewards
| Zone | XP per Kill | XP per Boss |
|------|-------------|-------------|
| 1    | 10          | 10          |
| 2    | 11          | 11          |
| 3    | 12          | 12          |
| 5    | 13          | 13          |
| 10   | 15          | 15          |

**Formula:** `10 + Math.floor(zone * 0.5)`

**Problems:**
- XP rewards don't scale with zone difficulty
- Boss XP is the same as regular monsters!
- No incentive to fight tougher enemies

---

## Recommended Changes (D&D-Inspired)

### 1. Stat Points (ASI System)
**Change from:** 3 stat points per level  
**Change to:** Stat points only at specific levels

```typescript
// New stat point awards (levels 4, 8, 12, 16, 20, 24, 28, 32)
function getStatPointsForLevel(level: number): number {
  if (level === 1) return 5 // Starting allocation
  if (level % 4 === 0) return 2 // Every 4 levels
  return 0
}
```

**Benefits:**
- Level 20 = 15 total stat points (5 starting + 10 from leveling)
- Makes gear the primary source of power
- Each stat point feels meaningful
- Closer to D&D's progression feel

### 2. Monster XP Rewards
**Change from:** `10 + Math.floor(zone * 0.5)`  
**Change to:** Exponential scaling with boss multiplier

```typescript
// New XP formula
function xpPerKill(zone: number, isBoss: boolean): number {
  // Scale exponentially like D&D CR
  const baseXP = zone <= 10
    ? 25 * Math.pow(1.3, zone - 1)  // Early game: 25, 33, 42, 55, 72...
    : 25 * Math.pow(1.3, 9) * Math.pow(1.2, zone - 10) // Late game slower
  
  return Math.ceil(baseXP * (isBoss ? 5 : 1)) // Bosses give 5x XP
}
```

**Zone XP Comparison:**
| Zone | Regular Monster | Boss Monster | D&D Equivalent |
|------|-----------------|--------------|----------------|
| 1    | 25              | 125          | CR 1/8         |
| 2    | 33              | 165          | CR 1/4         |
| 3    | 42              | 210          | CR 1/2         |
| 5    | 72              | 360          | CR 1           |
| 10   | 248             | 1,240        | CR 3-4         |
| 15   | 614             | 3,070        | CR 7-8         |
| 20   | 1,278           | 6,390        | CR 10-11       |

### 3. Level Curve Adjustment
Keep current XP curve but it will feel slower with reduced stat points:

**Player Power Sources:**
1. **Equipment** (Primary) - Weapons, armor, affixes
2. **Relics** (Major) - Global multipliers
3. **Buildings** (Significant) - Auto-attack, bonuses
4. **Stats** (Moderate) - Rare and meaningful
5. **Prestige** (Meta) - Long-term progression

---

## Implementation Changes Needed

### File: `src/state/charStore.ts`
```typescript
addXP: (amount) => {
  let { xp, level, statPoints } = get()
  const totalStats = get().getTotalStats()
  const xpMultiplier = 1 + (totalStats.xpBonus || 0)
  xp += Math.floor(amount * xpMultiplier)
  
  let levelsGained = 0
  let statPointsGained = 0
  
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level)
    level++
    levelsGained++
    
    // Stat points only every 4 levels (ASI system)
    if (level % 4 === 0) {
      statPointsGained += 2
    }
  }
  
  if (levelsGained > 0) {
    logLevelUp(level, statPointsGained)
  }
  
  set({ xp, level, statPoints: statPoints + statPointsGained })
},
```

### File: `src/state/combatStore.ts`
```typescript
// Update XP calculation
const baseXP = zone <= 10
  ? 25 * Math.pow(1.3, zone - 1)
  : 25 * Math.pow(1.3, 9) * Math.pow(1.2, zone - 10)

const bossMultiplier = isBoss ? 5 : 1
const xpGained = Math.ceil(baseXP * bossMultiplier * rewardMultiplier)
```

---

## Summary

**D&D Philosophy:**
- Levels are milestones, not constant power creep
- Equipment is king
- Stats are precious and meaningful
- Bosses are significantly more rewarding

**Benefits of Adopting This:**
1. ✅ Makes equipment actually matter
2. ✅ Makes relics feel more impactful
3. ✅ Slows power creep naturally
4. ✅ Makes leveling feel special again
5. ✅ Creates better progression curve
6. ✅ Reduces need for infinite levels
7. ✅ Bosses finally worth fighting!

**Player Impact:**
- Early game: Slightly slower (but more meaningful)
- Mid game: Much more reliant on gear (better itemization value)
- Late game: Progression through gear/relics/prestige (not pure stats)
