# Stat Rolling System Constraints

## Initial Roll Range
- **Minimum Roll**: 5
- **Maximum Roll**: 18
- **Method**: Roll d20, clamp to 5-18 range
- **Attempts**: 3 roll sets, player chooses best

## After Character Creation
- **Equipment Bonuses**: Can push stats above 18 or below 5
- **Buffs/Debuffs**: Can modify stats beyond initial roll range
- **No Hard Cap**: With enough equipment, stats can exceed 18
- **Modifiers Always Calculate**: Modifier formula `(stat - 10) / 2` applies to final stat value

## Modifier Calculation
The modifier calculation remains unchanged regardless of how the stat was obtained:

| Stat Value | Modifier | Notes |
|------------|----------|-------|
| 1          | -5       | Only possible with severe debuffs |
| 5          | -3       | **Minimum initial roll** |
| 8-9        | -1       | Below average |
| 10-11      | 0        | Average |
| 12-13      | +1       | Above average |
| 14-15      | +2       | Great |
| 16-17      | +3       | Exceptional |
| 18-19      | +4       | **18 is max initial roll** |
| 20-21      | +5       | Only with equipment/buffs |
| 22-23      | +6       | Legendary with equipment |
| 24+        | +7+      | Mythic with equipment |

## Why This Matters
1. **Initial Balance**: Players start with reasonable stats (5-18 range)
2. **Progression**: Equipment and buffs provide meaningful upgrades
3. **Skill Checks**: Future action systems will use these modifiers
4. **D&D Accuracy**: Matches D&D 5e's standard stat range
5. **No Artificial Caps**: Modifiers can scale indefinitely with gear

## Quality Ratings
- **Heroic** (18+): Orange/Gold - Maximum initial roll
- **Exceptional** (16-17): Purple - Very strong
- **Great** (14-15): Blue - Strong
- **Good** (12-13): Green - Above average
- **Average** (10-11): Gray - Baseline
- **Below Average** (8-9): Red - Weak
- **Poor** (5-7): Dark Red - Minimum initial range
- **Very Poor** (<5): Darker Red - Only with debuffs

## Implementation Files
- `src/systems/statRolling.ts` - Core rolling and calculation logic
- `src/ui/StartScreen.tsx` - Character creation UI
- `src/state/charStore.ts` - Character stat storage
- `src/systems/math.ts` - Combat calculations using modifiers
- `src/ui/PlayerCard.tsx` - Stat display with modifiers

## Future Considerations
When implementing skill checks or action systems:
- Use the **modifier** value, not raw stat
- Allow equipment bonuses to influence checks
- Consider situational modifiers
- Remember: modifiers can be negative or positive regardless of the initial roll range
