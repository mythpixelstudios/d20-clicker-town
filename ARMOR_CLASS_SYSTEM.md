# Armor Class (AC) System Implementation

## Overview
Implemented D&D 5e style Armor Class system where attacks must roll to hit before dealing damage.

## How It Works

### Attack Rolls
- Player rolls d20 + attack bonus when clicking
- Must meet or exceed monster's AC to hit
- Natural 20 = automatic hit + critical (2x damage)
- Natural 1 = automatic miss

### Attack Bonus Calculation
```
Attack Bonus = Proficiency Bonus + Ability Modifier
- Proficiency = (Level / 4) + 1
- Ability Modifier = STR modifier (for melee/clicks)
```

### Player AC Calculation
```
Player AC = 10 + DEX modifier + Equipment AC bonuses
```

### Monster AC Values
**Zone 1 (Forest Outskirts)**: AC 8-10 (easy to hit)
**Zone 2 (Dark Woods)**: AC 10-12  
**Zone 3 (Mountain Base)**: AC 12-14 (armored)
**Zone 4 (Crystal Caves)**: AC 13-15 (crystalline armor)
**Zone 5 (Volcanic Fields)**: AC 14-16 (heat-hardened)
**Zone 6 (Frozen Tundra)**: AC 15-17 (frozen armor)
**Zone 7 (Desert Ruins)**: AC 16-18 (ancient armor)
**Zone 8 (Mystic Grove)**: AC 15-17 (magical protection)
**Zone 9 (Sky Islands)**: AC 16-18 (agile, hard to hit)
**Zone 10 (Demon Realm)**: AC 17-19 (demonic armor)

### Boss AC Values
- Zone 1: AC 12
- Zone 2: AC 14
- Zone 3: AC 16
- Zone 4: AC 17
- Zone 5: AC 18
- Zone 6: AC 19
- Zone 7: AC 20
- Zone 8: AC 21
- Zone 9: AC 22
- Zone 10: AC 23

## Equipment AC Bonuses

### Chest Armor (Primary AC source)
- **Leather Vest** (Common): +1 AC
- **Chainmail** (Uncommon): +2 AC
- **Plate Armor** (Rare): +3 AC
- **Mithril Chainmail** (Epic): +4 AC
- **Dragonscale Armor** (Legendary): +6 AC

### Other Armor Pieces
**Helmets**: +0 to +2 AC
**Legs**: +0 to +2 AC
**Boots**: +0 to +1 AC (focus on mobility)
**Gloves**: +0 to +1 AC (focus on dexterity)

### Rings
Some magical rings may provide small AC bonuses (+1 to +2)

## UI Changes

### Monster Panel
- Displays monster AC below name with shield icon 🛡️
- Example: "🛡️ AC 15"

### Player Card
- Shows player AC in top-right with tooltip
- Tooltip explains AC calculation
- Example: "🛡️ AC 13"

### Damage Numbers
- **Hit**: Shows damage normally (white or orange for crit)
- **Miss**: Shows "MISS" in gray text
- **Critical**: Shows damage with "🎯" and 2x damage

## Files Modified

### Core System Files
1. **src/systems/math.ts**
   - Added `rollD20()` - Roll d20 for attacks
   - Added `calculateAttackBonus()` - Calculate player's attack bonus
   - Added `makeAttackRoll()` - Roll attack vs AC
   - Added `calculatePlayerAC()` - Calculate player's AC

2. **src/data/monsters.ts**
   - Added `armorClass` to Monster interface
   - Added AC values to all 50 regular monsters (10 zones × 5 monsters)
   - Added AC values to all 10 bosses

3. **src/data/equipment.ts**
   - Added `armorClass?: number` to EquipmentStats interface
   - Added AC bonuses to chest armor pieces (primary AC source)
   - TODO: Add AC to remaining armor pieces (helmets, legs, boots, gloves)

### State Management
4. **src/state/combatStore.ts**
   - Added `monsterAC` to CombatState
   - Updated `click()` to use attack rolls
   - Attack misses trigger damage callback with `isMiss = true`
   - Critical hits deal 2x damage
   - Updated callback signature: `(damage, isCrit, isMiss?)`

5. **src/state/charStore.ts**
   - Already supports equipment AC bonuses via `getTotalStats()`

### UI Components
6. **src/ui/MonsterPanel.tsx**
   - Added `monsterAC` display below monster name
   - Updated `addDamageNumber` to accept `isMiss` parameter
   - Shows AC with shield icon

7. **src/ui/PlayerCard.tsx**
   - Added player AC display in top-right
   - Shows AC with shield icon and tooltip
   - Tooltip explains AC calculation
   - Imported `calculatePlayerAC` function

8. **src/ui/components/DamageNumberContainer.tsx**
   - Added `isMiss?: boolean` to DamageNumber interface
   - Shows "MISS" text when `isMiss = true`
   - Added bold styling for misses
   - Added 🎯 emoji for critical hits

## Gameplay Impact

### Early Game (Zones 1-3)
- Low monster AC (8-14) means high hit rate
- Players feel powerful, damage is consistent
- Introducing mechanic gradually

### Mid Game (Zones 4-7)
- Medium monster AC (13-18) creates variety
- Some misses start happening
- Equipment AC becomes important
- DEX stat gains value (increases player AC)

### Late Game (Zones 8-10)
- High monster AC (15-19) makes combat strategic
- Players need good equipment and stats
- Bosses (AC 21-23) are challenging to hit
- Proficiency bonus scaling keeps hit rate viable

### Boss Fights
- Boss AC is significantly higher (+2 to +5 over regular monsters)
- Makes boss fights more dynamic
- Critical hits become crucial
- Natural 20s always hit (important for progression)

## Balance Considerations

### Hit Rate Formula
```
Hit Chance = (21 + Attack Bonus - Monster AC) / 20
```

**Example at Level 10 vs Zone 5 Monster (AC 15)**:
- Proficiency: (10/4) + 1 = 3.5 → 3
- STR Modifier: Assume 14 STR = +2
- Attack Bonus: 3 + 2 = +5
- Total Attack: d20 + 5
- Need 15 to hit
- Hit Chance: (21 + 5 - 15) / 20 = 55%
- With Nat 1 always miss, Nat 20 always hit: Still ~55%

### Progression Scaling
- Player attack bonus increases with level (proficiency)
- Player AC increases with equipment
- Monster AC increases with zones
- System stays balanced through progression

## Testing Checklist

- [x] Attack rolls calculate correctly
- [x] Natural 20 crits and always hits
- [x] Natural 1 always misses
- [x] Monster AC displays in UI
- [x] Player AC displays in UI
- [x] Miss indicators show properly
- [x] Crit indicators show with 2x damage
- [x] Equipment AC bonuses apply
- [x] DEX modifier affects player AC
- [ ] All armor pieces have AC values (partial - chest done)
- [ ] Auto-attacks use AC system (future work)
- [ ] Balance testing across all zones

## Future Enhancements

### Auto-Attacks
Currently auto-attacks don't use the AC system. Future enhancement:
- Auto-attacks should also roll to hit
- Use DEX modifier for ranged auto-attacks
- Show small miss indicators for auto-attacks

### Advanced Mechanics
- **Advantage/Disadvantage**: Roll 2d20, take higher/lower
- **Cover System**: Monsters behind cover get +2 or +5 AC
- **Flanking**: Attack from behind gets advantage
- **Magic Attacks**: Use INT modifier instead of STR
- **Touch AC**: Certain attacks ignore armor (DEX only)

### Equipment Expansion
- **Shields**: +1 to +3 AC (new equipment slot?)
- **Armor Sets**: Bonus AC for wearing full set
- **Enchantments**: Magical +1/+2/+3 AC bonuses
- **Dodge Boots**: AC bonus when not wearing heavy armor

## Notes
- System is fully functional for manual clicks
- Creates more engaging, dynamic combat
- Adds value to DEX stat (was underused)
- Makes equipment choices more interesting
- Maintains D&D 5e compatibility
