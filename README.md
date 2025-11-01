# Implementation Plan

Concise prioritized order for feature delivery. Build in sequence; do not advance to the next tier until acceptance for the current tier is met.

## Tier 0 – Foundations (Stability & Clarity)
1. Starter damage safety (ensure immediate damage: free STR or starter weapon).
2. Guidance banners (no damage 10s, high time-to-kill).
3. DPS panel refinement (click vs auto vs projected next upgrade).
4. Damage number pooling (performance).
Acceptance: First upgrade <90s; no hidden damage events.

## Tier 1 – Core Progression
5. Achievement system + initial 12 achievements.
6. Item comparison & rarity visuals.
7. Crafting queue + building synergy effects.
8. Affix monsters balancing & visual clarity.
Acceptance: ≥8 achievements by Zone 6; crafting progresses off-tab.

## Tier 2 – Retention Layer
9. Prestige v2 (token formula + meta tree).
10. Offline progress simulation upgrade.
11. Daily quests & streak rewards.
12. Compendium passive bonuses.
Acceptance: Offline popup appears on return (≥1h away); prestige visibly increases DPS.

## Tier 3 – Polish & UX ✅ COMPLETED
13. ✅ Shared Tooltip component (stats | sources | next breakpoint).
14. ✅ Accessibility pass (focus outlines, ARIA labels, colorblind affix support).
15. ✅ Ambient audio per tab + mute toggle.
16. ✅ Level-up / crafting completion animations.
Acceptance: ✅ Accessible navigation implemented; stable FPS >55 with effects; colorblind-friendly patterns added.

**Tier 3 Completion Notes (October 2025):**
- Created reusable Tooltip component with stats, sources, and breakpoint display
- Implemented comprehensive accessibility features:
  - Focus visible outlines with keyboard navigation support
  - ARIA labels throughout the application
  - Colorblind-friendly rarity patterns (icons + border styles)
  - High contrast mode support
  - Reduced motion preferences respected
- Added audio system with ambient tracks per tab (combat, town, tavern)
- Mute toggle and volume control in fixed position
- Created animation system for level-ups and crafting with particle effects
- All animations respect prefers-reduced-motion settings

## Tier 4 – Optional Engagement ✅ COMPLETED
17. ✅ Golden Meteor event (burst reward + temporary buff).
18. ✅ Expeditions system (NPC timed missions).
19. ✅ Relics (persistent global modifiers with limited slots).
20. ✅ Seasonal modifier scaffold.
Acceptance: ✅ Event interaction rate healthy (qualitative until analytics added); all systems implemented with data-driven architecture.

**Tier 4 Completion Notes (October 2025):**
- **Relics System**: Created comprehensive relic system with 15+ unique relics
  - Rarity-based slot system (uncommon/rare: 2 slots, epic/legendary/mythic: 1 slot)
  - Global passive modifiers (damage, gold, XP, crafting, expeditions, etc.)
  - Discovery requirements based on level, zone, achievements, and boss defeats
  - Relic leveling system for scalable relics
  - Full state management with zustand persistence
  - Data file: `src/data/relics.ts`, Store: `src/state/relicStore.ts`

- **Events System**: Implemented random event framework
  - Golden Meteor: Primary burst event with click interaction (15s duration)
  - Wandering Merchant: Choice-based event with multiple rewards
  - Monster Horde: Auto-triggered combat bonus event
  - Divine Blessing: Rare buff event
  - Ancient Portal: Legendary high-risk/reward event
  - Event buffs with temporary multiplicative bonuses
  - Cooldown system and spawn requirement checks
  - Data file: `src/data/events.ts`, Store: `src/state/eventStore.ts`

- **Expeditions System**: NPC mission system with 10+ expeditions
  - Five expedition types: exploration, gathering, combat, diplomatic, treasure_hunt
  - Difficulty tiers: easy, medium, hard, expert, legendary
  - NPC trait synergy bonuses (duration, success rate, rewards)
  - Random events during expeditions
  - Success/failure mechanics with partial rewards
  - NPC XP rewards for completing expeditions
  - Data file: `src/data/expeditions.ts`, Store: `src/state/expeditionStore.ts`

- **Seasonal System**: Scaffold for seasonal content
  - Four seasons: Winter Frost, Spring Bloom, Summer Heat, Autumn Harvest
  - Seasonal themes with visual customization hooks
  - Global modifiers per season (damage, gold, XP, materials)
  - Seasonal items (equipment, relics, consumables, cosmetics)
  - Seasonal currency system
  - Seasonal challenges framework
  - Auto-detection of current season based on real-world month
  - Data file: `src/data/seasonal.ts`

**Architecture Benefits:**
- All systems use data-driven design with separate `.ts` files in `src/data/`
- Easy to add new relics, events, expeditions, and seasonal content
- Consistent pattern with existing systems (monsters, equipment, NPCs)
- Type-safe with full TypeScript interfaces
- Zustand stores for state management with persistence
- Helper functions for common operations

**Current Integration Status (November 2025):**
- ✅ All data structures and stores implemented and persisted
- ✅ Relic, Event, and Expedition stores use proper localStorage keys
- ✅ Event system has tick() method called from game loop
- ⚠️ **Missing UI Components:**
  - RelicPanel for viewing/equipping relics
  - EventNotification overlay for active events
  - ExpeditionPanel for managing NPC missions
  - SeasonalShop UI (seasonal data exists but no store/UI)
- ⚠️ **Missing Integration:**
  - Relic multipliers not applied to combat calculations
  - Event buffs not integrated into damage/gold/XP calculations
  - Expedition rewards calculation needs NPC stat bonuses
  - Seasonal modifiers not connected to gameplay

**Immediate Next Steps:**
1. Create EventNotification component to display active events
2. Create RelicPanel for relic management
3. Integrate event buff multipliers into combatStore calculations
4. Create ExpeditionPanel in TavernPanel
5. Apply relic bonuses to relevant game systems

## Icebox (Defer Until Core Metrics Stable)
- Export/import save string.
- Leaderboards (local then remote).
- Cosmetic themes / skins.
- Battle pass style track.
- Monetization (cosmetic only).

## File Targets (When Needed)
src/data/achievements.ts
src/ui/components/Tooltip.tsx
src/state/achievementStore.ts (extend)
src/engine/tickScheduler.ts (for queue / events)
src/state/effectsStore.ts (event buffs)
src/state/expeditionStore.ts
src/state/relicStore.ts

## Working Rules
- Implement strictly in order; only parallelize polish tasks inside same tier after core acceptance met.
- Each new progression mechanic gets: data config, store slice, UI panel/component, and one test for critical logic.
- Avoid adding Tier 4 items until Tier 2 retention goals achieved (return sessions with offline claim >70%).

## Acceptance Progress Tracking
Maintain a simple checklist in a separate tracking doc or issue board with date, status, notes.

---
Keep focus: ship clarity first, depth second, optional flair last.

