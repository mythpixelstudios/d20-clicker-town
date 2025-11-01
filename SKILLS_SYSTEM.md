# Combat Skills System

## Overview
The skills system replaces the old stat point allocation system with a D&D-inspired skill-based progression system. This provides more granular character customization and slows progression for better game balance.

## Key Changes from Previous System

### Stat Points → Skill Points
- **Old System**: Stat points every 4 levels, directly increased base stats (STR, DEX, etc.)
- **New System**: Skill points every 2 levels, upgrade combat skills that provide fractional bonuses
- **Reason**: Slows progression, encourages specialization, more D&D authentic

### Base Stats
- All base stats now start at **10** (D&D standard)
- Stats are rolled at character creation and remain fixed
- No more stat upgrades through leveling
- Stats only increase through equipment bonuses

### Skill Point Gain
- **1 skill point per 2 levels** (levels 2, 4, 6, 8, etc.)
- More frequent than the old ASI system (every 4 levels)
- Encourages gradual specialization

## Combat Skills

### 16 Skills in 5 Categories

#### 1. Weapon Skills
- **Swordsmanship**: +0.5 attack, +0.25 damage with slashing weapons
- **Axe Mastery**: +0.5 attack, +0.25 damage with axes
- **Archery**: +0.5 attack, +0.25 damage with bows
- **Unarmed Combat**: +0.5 attack, +0.3 damage when no weapon equipped

#### 2. Combat Skills
- **Heavy Armor**: +0.5 AC when wearing heavy armor
- **Light Armor**: +0.3 AC, +0.1 APS when wearing light armor
- **Dodge**: +0.5 AC from agility (works with all armor)
- **Parry**: +0.3 AC, +0.2 block chance in melee

#### 3. Offensive Skills
- **Critical Strike**: +0.5% crit chance per rank
- **Power Attack**: +0.3 damage per rank (all attacks)
- **Cleave**: +0.2 damage to groups, +0.1 APS
- **Quick Draw**: +0.1 attack speed per rank

#### 4. Knowledge Skills
- **Monster Lore**: +0.2 damage vs all monsters per rank
- **Boss Tactics**: +0.5 damage vs bosses per rank

#### 5. Utility Skills
- **Perception**: +2% gold drops per rank
- **Treasure Hunter**: +3% equipment drop chance per rank

## Fractional Bonuses

### Why Fractional?
- Prevents exponential power growth
- Makes each rank meaningful but not overpowering
- Encourages investing in multiple skills
- Better long-term balance

### Example Progression
**Level 1 Character (5 skill points)**
- 3 ranks Swordsmanship: +1.5 attack, +0.75 damage
- 2 ranks Dodge: +1.0 AC

**Level 20 Character (10 skill points)**
- 5 ranks Swordsmanship: +2.5 attack, +1.25 damage
- 3 ranks Dodge: +1.5 AC
- 2 ranks Critical Strike: +1.0% crit chance

## Technical Implementation

### Character Store (`charStore.ts`)
```typescript
export type CombatSkills = {
  // Weapon Skills
  swordsmanship: number
  axemastery: number
  archery: number
  unarmed: number
  // Combat Skills
  heavyArmor: number
  lightArmor: number
  dodge: number
  parry: number
  // Offensive Skills
  criticalStrike: number
  powerAttack: number
  cleave: number
  quickDraw: number
  // Knowledge Skills
  monsterLore: number
  bossTactics: number
  // Utility Skills
  perception: number
  treasureHunter: number
}
```

### getSkillBonuses()
Returns calculated bonuses from all skills:
```typescript
{
  attackBonus: number      // Applied to attack rolls
  damageBonus: number      // Added to damage calculations
  acBonus: number          // Added to player AC
  critChance: number       // Critical hit percentage
  attackSpeed: number      // Attack speed bonus (APS)
  goldBonus: number        // Gold drop multiplier (%)
}
```

### Math Functions Updated
- `calculateAttackBonus()`: Now accepts `skillAttackBonus` parameter
- `calculatePlayerAC()`: Now accepts `skillAcBonus` parameter
- `computeClickDamage()`: Now accepts `skillDamageBonus` parameter
- `computeAutoDamage()`: Now accepts `skillDamageBonus` parameter

### Combat Integration
In `combatStore.ts`:
```typescript
// Get skill bonuses
const skillBonuses = charState.getSkillBonuses()

// Apply to attack roll
const attackBonus = calculateAttackBonus(
  totalStats, 
  charState.level, 
  skillBonuses.attackBonus, 
  false
)

// Apply to damage
let damage = computeClickDamage(
  totalStats, 
  charState.level, 
  skillBonuses.damageBonus
)
```

### UI Components

#### SkillsPanel.tsx
- Displays all 16 skills in 5 categories
- Shows current rank and effects
- Upgrade buttons when skill points available
- Tooltips with detailed descriptions

#### PlayerCard.tsx
- Shows skill points in header (with alert when > 0)
- Displays base stats (no upgrade buttons)
- Shows AC including skill bonuses

#### CharacterPanel.tsx
- "Skills" tab with alert badge
- Alerts user when skill points available

## Weapon Type Checking

### Current Implementation
Skills check equipped weapon type:
```typescript
if (weapon?.weaponType === 'slashing' && combat.swordsmanship > 0) {
  attackBonus += combat.swordsmanship * 0.5
  damageBonus += combat.swordsmanship * 0.25
}
```

### Future Expansion
Add more weapon types:
- Slashing (swords, longswords)
- Axes (battleaxes, greataxes)
- Bows (shortbow, longbow)
- Piercing (daggers, spears)
- Blunt (maces, hammers)
- Polearms (pikes, halberds)

## Balance Philosophy

### Slow, Meaningful Progression
- Fractional bonuses prevent power spikes
- Multiple viable build paths
- Encourages experimentation
- Long-term investment feels rewarding

### D&D Authenticity
- Skills over ability score increases
- Specialization in combat styles
- Proficiency-based system
- Expertise through practice

### Player Choice
- 16 different skills to invest in
- No "wrong" choices
- Multiple builds viable
- Can respec later (future feature)

## Future Features

### Potential Additions
1. **Skill Synergies**: Bonuses for certain skill combinations
2. **Skill Caps**: Maximum ranks per skill (e.g., 10 ranks max)
3. **Prestige Skills**: Unlock at high levels
4. **Skill Respec**: Allow resetting skills for gold
5. **Skill Trees**: Prerequisites for advanced skills
6. **Passive Abilities**: Skills unlock special abilities at certain ranks

### Data Tracking
Consider tracking:
- Most used skills
- Skill effectiveness metrics
- Popular build paths
- Skill point distribution

## Migration Notes

### Storage Version: char-v4
- Converts `statPoints` → `skillPoints`
- Converts `addStat()` → `addSkillPoint()`
- Initializes all combat skills to 0
- Sets base stats to 10

### Breaking Changes
- Old save files auto-migrate on load
- Stat upgrade buttons removed from UI
- Attack/damage calculations now include skill bonuses
- AC calculation includes skill bonuses

## Testing Recommendations

1. **Verify skill bonuses apply correctly in combat**
   - Attack rolls increase with weapon skills
   - Damage increases with power/weapon skills
   - AC increases with dodge/armor skills

2. **Test weapon type checking**
   - Swordsmanship only applies with slashing weapons
   - Unarmed combat applies when no weapon equipped

3. **Validate progression balance**
   - Early game (levels 1-10): 5 skill points
   - Mid game (levels 10-30): 15 total skill points
   - Late game (levels 30+): 30+ total skill points

4. **UI responsiveness**
   - Skill points alert badge works
   - Skills tab shows correct ranks
   - Tooltips display accurate information

## Summary

The skills system provides:
- ✅ More meaningful progression
- ✅ Better game balance through fractional bonuses
- ✅ D&D-authentic character development
- ✅ Multiple viable build paths
- ✅ Specialization and customization
- ✅ Slower, more satisfying progression curve
