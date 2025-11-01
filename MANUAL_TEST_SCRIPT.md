# Manual Testing Script

## Quick Test (5 minutes)

### Test 1: New Game Flow
1. Open http://localhost:5174
2. Click "Start New Adventure" (if you have a save, it will ask to confirm)
3. Enter your name (e.g., "TestHero")
4. Roll stats 3 times
5. Select a stat set (or use Auto-Select Best)
6. Click "Confirm & Begin Adventure"
7. ✅ Verify: Game loads to character screen with your name and rolled stats

### Test 2: Combat Basics
1. Click on the monster several times
2. ✅ Verify: Damage numbers appear
3. ✅ Verify: Monster HP decreases
4. ✅ Verify: Monster dies and new monster spawns
5. ✅ Verify: Gold and XP are gained (check resource bar)
6. ✅ Verify: Combat log shows monster death

### Test 3: Equipment
1. Wait to get some equipment drops or craft basic gear
2. Go to Character tab
3. Click on equipment in inventory
4. ✅ Verify: Equipment stats are shown
5. Click "Equip"
6. ✅ Verify: Equipment appears in slot
7. ✅ Verify: Character stats increase

### Test 4: Town Building
1. Go to Town tab
2. Click "Upgrade" on Marketplace
3. ✅ Verify: Gold is spent
4. ✅ Verify: Building level increases
5. ✅ Verify: Building provides stated bonus

### Test 5: Save/Load
1. Make some progress (kill monsters, gain gold, level up)
2. Refresh the page (F5)
3. ✅ Verify: Game continues from where you left off
4. ✅ Verify: Character name is preserved
5. ✅ Verify: Stats and equipment are preserved

### Test 6: New Game Reset
1. Click browser back or manually go to start screen
2. Click "Start New Adventure"
3. Confirm the warning dialog
4. ✅ Verify: Page reloads
5. ✅ Verify: Name input appears (old name is cleared)
6. ✅ Verify: Stats need to be rolled again
7. Create new character
8. ✅ Verify: Start at level 1 with no gold or equipment

## Detailed Test (15 minutes)

### Test 7: Crafting System
1. Collect materials from monster drops
2. Go to Town → Build Blacksmith
3. Go to Craft tab
4. Select an item to craft
5. ✅ Verify: Material requirements shown
6. ✅ Verify: Success rate shown
7. Click "Craft"
8. Wait for crafting to complete
9. ✅ Verify: Item appears in inventory or auto-equips
10. ✅ Verify: Crafting XP is gained

### Test 8: Zone Progression
1. Kill monsters until boss is available
2. Click "Fight Boss"
3. Defeat the boss
4. ✅ Verify: Zone selection screen appears
5. ✅ Verify: Current zone shows "Cleared"
6. ✅ Verify: Next zone is unlocked
7. Select next zone
8. ✅ Verify: Monsters are stronger
9. ✅ Verify: Rewards are better

### Test 9: Achievements
1. Go to Goals tab
2. ✅ Verify: Some achievements are completed
3. Click "Claim" on an achievement
4. ✅ Verify: Reward is received (gold/XP/stat points)
5. ✅ Verify: Achievement marked as claimed

### Test 10: Daily Quests
1. Go to Goals tab → Daily Quests
2. ✅ Verify: 3 daily quests are shown
3. Make progress on a quest (kill monsters, etc.)
4. ✅ Verify: Quest progress updates
5. Complete a quest
6. Click "Claim Reward"
7. ✅ Verify: Reward is received

### Test 11: Tavern & NPCs
1. Go to Town → Build Tavern (requires level 5 and Marketplace L3)
2. Go to Tavern tab
3. Click "Recruit" on an NPC
4. ✅ Verify: Gold is spent
5. ✅ Verify: NPC appears in owned list
6. Select a quest and assign the NPC
7. Wait for quest to complete
8. Click "Claim"
9. ✅ Verify: Rewards are received

### Test 12: Offline Progress
1. Note your current level and gold
2. Close the browser tab
3. Wait 2-3 minutes
4. Reopen the game
5. ✅ Verify: Offline progress popup appears
6. ✅ Verify: Progress shows XP and gold gained
7. Click "Claim"
8. ✅ Verify: Resources are added

### Test 13: Skills System
1. Level up to gain skill points
2. Go to Character → Skills tab (if implemented)
3. ✅ Verify: Skill points are available
4. Spend points on a skill
5. ✅ Verify: Skill level increases
6. ✅ Verify: Bonus is applied (check combat effectiveness)

### Test 14: Monster Compendium
1. Kill various monsters in different zones
2. Go to Character → Compendium (if implemented as separate panel)
3. ✅ Verify: Discovered monsters are listed
4. ✅ Verify: Kill counts are tracked
5. ✅ Verify: Discovery percentage shown
6. ✅ Verify: Passive bonuses are active

### Test 15: Prestige (Advanced)
1. Reach zone 11 and clear it
2. Go to Prestige tab
3. ✅ Verify: Prestige is available
4. Review prestige rewards
5. Click "Prestige"
6. Confirm
7. ✅ Verify: Character resets to level 1
8. ✅ Verify: Gold and equipment are lost
9. ✅ Verify: Prestige level increases
10. ✅ Verify: Meta upgrades are available
11. ✅ Verify: Permanent bonuses apply

## Known Missing Features (Expected to Not Work)

- ❌ Events don't spawn (no UI)
- ❌ Relics can't be viewed/equipped (no UI)  
- ❌ Expeditions can't be started (no UI)
- ❌ Seasonal bonuses (not integrated)

## Bug Report Template

If you find a bug, report it with:

```
**Bug:** [Brief description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Additional Info:** [Screenshots, console errors, etc.]
```

## Performance Check

While testing, monitor:
- ✅ Smooth animations (60 FPS)
- ✅ No lag when clicking monsters
- ✅ Fast UI transitions
- ✅ No console errors
- ✅ Reasonable memory usage

## Console Commands (for Testing)

Open browser console (F12) and try:

```javascript
// Check localStorage keys
Object.keys(localStorage).filter(k => k.includes('clicker') || k.includes('char') || k.includes('econ'))

// Check current character state
JSON.parse(localStorage.getItem('char-v4'))

// Check current gold
JSON.parse(localStorage.getItem('econ-v2'))

// Clear all game data (WARNING: Deletes save)
['char-v4', 'econ-v2', 'town-v3', 'zone-progression-store', 'combat-v3', 'crafting-store', 'tavern-v2', 'achievement-store-v2', 'daily-quests-store', 'offline-progress-store', 'analytics-store', 'meta-store', 'monster-compendium-store', 'player-name', 'audio-settings', 'clicker-town-expeditions', 'clicker-town-events', 'clicker-town-relics'].forEach(k => localStorage.removeItem(k)); location.reload()
```

## Testing Completion

After running all tests, fill out:

- [ ] All ✅ items verified
- [ ] Bugs found: [number] (list them)
- [ ] Performance issues: [Yes/No]
- [ ] Ready for next development phase: [Yes/No]
- [ ] Priority fixes needed: [list them]

---

**Tester:** __________  
**Date:** __________  
**Build:** __________  
**Notes:** 
