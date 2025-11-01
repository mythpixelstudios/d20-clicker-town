# Quest and Weapon System Update

## Overview
This update makes NPCs and quests significantly more valuable by:
1. Adding advanced quests that reward rare materials needed for progression
2. Implementing a weapon type system with boss vulnerabilities/resistances
3. Making later bosses require specific weapon types to defeat effectively

## Changes Made

### 1. Weapon Type System (`src/data/equipment.ts`)

#### New Weapon Types
- `slashing` - Traditional swords and blades
- `piercing` - Rapiers, spears, and stabbing weapons
- `bludgeoning` - Hammers and crushing weapons
- `magical` - Arcane enchanted weapons
- `fire` - Flame-based weapons
- `ice` - Frost-based weapons
- `holy` - Divine/blessed weapons
- `void` - Weapons from the void realm

#### New Weapons Added
- **War Hammer** (Uncommon, Bludgeoning) - Iron + Stone
- **Blade of Flames** (Rare, Fire) - Fire Crystal + Obsidian + Iron
- **Frost Spear** (Rare, Ice) - Ice Crystal + Frozen Wood + Iron
- **Holy Mace** (Epic, Holy) - Magic Dust + Crystal + Enchanted Leaf + Mystic Wood
- **Void Dagger** (Legendary, Void) - Void Essence + Demon Core + Soul Crystal + Reality Shard
- **Piercing Rapier** (Rare, Piercing) - Iron + Crystal + Fiber

All existing weapons now have weapon types assigned.

### 2. Boss Vulnerabilities System (`src/data/monsters.ts`)

#### Boss Mechanics
Each boss (Zone 3+) now has:
- **Vulnerabilities** - Take 150% damage from these weapon types (+50% damage)
- **Resistances** - Take 50% damage from these weapon types (-50% damage)
- **Immunities** - Take 0% damage from these weapon types (immune!)

#### Boss Breakdown

**Zone 3 - Stone Golem**
- Vulnerabilities: Bludgeoning
- Resistances: Slashing, Piercing

**Zone 4 - Crystal Spider**
- Vulnerabilities: Bludgeoning, Magical
- Resistances: Fire, Ice

**Zone 5 - Flame Titan**
- Vulnerabilities: Ice, Magical
- Resistances: Slashing, Piercing, Bludgeoning
- Immunities: Fire

**Zone 6 - Ice King**
- Vulnerabilities: Fire, Bludgeoning
- Resistances: Piercing
- Immunities: Ice

**Zone 7 - Sand Wraith**
- Vulnerabilities: Magical, Holy
- Immunities: Piercing, Slashing (ghost)

**Zone 8 - Arcane Treant**
- Vulnerabilities: Fire, Slashing
- Resistances: Magical

**Zone 9 - Wind Drake**
- Vulnerabilities: Piercing, Magical
- Resistances: Ice, Fire

**Zone 10 - Demon Lord**
- Vulnerabilities: Holy, Void
- Resistances: Slashing, Piercing, Bludgeoning, Magical
- Immunities: Fire

### 3. Combat System Integration (`src/state/combatStore.ts`)

The combat system now:
1. Checks equipped weapon type when fighting bosses
2. Calculates damage multiplier based on vulnerabilities/resistances/immunities
3. Logs messages to the player about effectiveness (e.g., "Demon Lord is vulnerable to holy damage! (+50%)")
4. Applies the multiplier to final damage output

### 4. Advanced Material Quests (`src/data/npcs.ts`)

Nine new high-level quests added:

#### Quest List

1. **Harvest Mystical Crystals** (Level 12)
   - Duration: 20 minutes
   - Rewards: Crystal (6), Magic Dust (3), 50 XP, 200 Gold
   - Requires: Mine Level 5

2. **Mine Volcanic Obsidian** (Level 15)
   - Duration: 25 minutes
   - Rewards: Obsidian (4), Fire Crystal (5), Sulfur (6), 65 XP, 250 Gold
   - Requires: Mine Level 7

3. **Collect Frozen Shards** (Level 18)
   - Duration: 23 minutes
   - Rewards: Ice Crystal (7), Frozen Wood (5), Ice Essence (3), 60 XP, 230 Gold
   - Requires: Warehouse Level 5

4. **Delve into Demon Realm** (Level 25)
   - Duration: 40 minutes
   - Rewards: Demon Core (2), Soul Crystal (3), Hell Fire (4), 120 XP, 500 Gold
   - Requires: Barracks Level 8

5. **Sky Islands Expedition** (Level 22)
   - Duration: 30 minutes
   - Rewards: Sky Metal (5), Wind Crystal (6), Cloud Essence (4), 85 XP, 350 Gold
   - Requires: Tavern Level 6

6. **Harvest Mystic Grove** (Level 20)
   - Duration: 27 minutes
   - Rewards: Mystic Wood (6), Enchanted Leaf (8), Magic Dust (5), 70 XP, 280 Gold
   - Requires: Library Level 5

7. **Ancient Ruins Excavation** (Level 21)
   - Duration: 33 minutes
   - Rewards: Sand Glass (7), Ancient Coin (4), Dried Herb (6), 95 XP, 400 Gold
   - Requires: Library Level 6

8. **Forge Specialized Alloys** (Level 24)
   - Duration: 37 minutes
   - Rewards: Sky Metal (3), Soul Crystal (2), Fire Crystal (4), 100 XP, 450 Gold
   - Requires: Blacksmith Level 10, Iron (10), Crystal (8), Obsidian (5)

9. **Void Realm Expedition** (Level 30)
   - Duration: 50 minutes
   - Rewards: Void Essence (3), Reality Shard (2), Time Crystal (2), 150 XP, 800 Gold
   - Requires: Tower Level 8

## Gameplay Impact

### Strategic Depth
- Players must now craft/acquire specific weapon types to defeat certain bosses
- Some bosses are nearly impossible without the right weapon (e.g., Demon Lord with resistances/immunities)
- Creates clear progression gates that require planning

### NPC Value Proposition
- NPCs can now gather rare endgame materials that are otherwise hard to obtain
- High-level quests provide substantial gold and XP rewards
- Makes investing in NPC leveling and friendship worthwhile

### Progression Loop
1. Player reaches a new zone
2. Encounters boss with specific vulnerabilities
3. Needs specific materials to craft appropriate weapon
4. Sends NPCs on quests to gather those materials
5. Crafts weapon and defeats boss
6. Unlocks next zone

### Material Dependency Chain
- Early zones: Basic materials (wood, iron, fiber)
- Mid zones: Elemental materials (crystals, fire/ice crystals)
- Late zones: Rare materials (demon cores, soul crystals, void essence)
- NPCs bridge the gap by making rare materials accessible through quests

## Future Considerations

### Potential Enhancements
1. Add weapon type indicators in UI
2. Show boss vulnerabilities in Monster Compendium
3. Add crafting achievements for specific weapon types
4. Create NPC specializations for material gathering
5. Add auto-attack weapon effectiveness calculation
6. Show damage multiplier in combat log

### Balance Adjustments
- Quest durations may need tuning based on playtesting
- Material quantities in rewards can be adjusted
- Boss resistance values can be fine-tuned
- Some bosses might be too difficult without right weapon (intended design)

## Testing Checklist
- [ ] Verify all weapon types craft correctly
- [ ] Test boss damage multipliers (0x, 0.5x, 1.0x, 1.5x)
- [ ] Confirm quest rewards grant correct materials
- [ ] Check NPC quest effectiveness with new materials
- [ ] Verify weapon type shows in equipment tooltips
- [ ] Test progression through zones with weapon requirements
- [ ] Validate material costs for new weapons are balanced

## Files Modified
1. `src/data/equipment.ts` - Added weapon types and new weapons
2. `src/data/monsters.ts` - Added boss vulnerabilities and effectiveness calculation
3. `src/state/combatStore.ts` - Integrated weapon effectiveness into damage calculation
4. `src/data/npcs.ts` - Added 9 new advanced material gathering quests
