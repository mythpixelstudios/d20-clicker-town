# Priority List - Bug Fixes & Features

## 🔴 Critical (Do First)

### 1. Verify New Game/Load Game Fix
**Status:** Fixed, needs testing  
**Priority:** P0  
**Estimate:** 5 minutes  
**Tasks:**
- [ ] Test new game clears all data
- [ ] Test continue game loads properly
- [ ] Verify no data leakage between saves

---

## 🟡 High Priority (Core Functionality)

### 2. Event System Integration
**Status:** Data + Store done, UI missing  
**Priority:** P1  
**Estimate:** 2-3 hours  
**Tasks:**
- [ ] Create EventNotification overlay component
- [ ] Add event spawn checking to game tick
- [ ] Apply event buff multipliers to damage calculations
- [ ] Apply event buff multipliers to gold/XP gains
- [ ] Test event spawning and rewards
- [ ] Add visual feedback for active events

### 3. Relic System UI
**Status:** Data + Store done, UI missing  
**Priority:** P1  
**Estimate:** 3-4 hours  
**Tasks:**
- [ ] Create RelicPanel component
- [ ] Show discovered relics
- [ ] Allow equipping/unequipping relics
- [ ] Display relic slots by rarity
- [ ] Show relic stat bonuses
- [ ] Apply relic bonuses to gameplay calculations
- [ ] Add relic discovery notifications
- [ ] Test relic system end-to-end

### 4. Combat System Verification
**Status:** Should be working  
**Priority:** P1  
**Estimate:** 30 minutes  
**Tasks:**
- [ ] Test D&D attack rolls
- [ ] Verify AC calculations
- [ ] Test weapon effectiveness vs bosses
- [ ] Check damage scaling by zone
- [ ] Verify skill bonuses apply correctly
- [ ] Test critical hits
- [ ] Check miss indicators

---

## 🟢 Medium Priority (Enhancement)

### 5. Expedition System UI
**Status:** Data + Store done, UI missing  
**Priority:** P2  
**Estimate:** 4-5 hours  
**Tasks:**
- [ ] Create ExpeditionPanel component
- [ ] Integrate into TavernPanel
- [ ] Show available expeditions
- [ ] Allow starting expeditions with NPCs
- [ ] Display expedition progress
- [ ] Show completion rewards
- [ ] Add NPC trait synergy indicators
- [ ] Test expedition flow

### 6. Seasonal System Implementation
**Status:** Data only, needs store + UI  
**Priority:** P2  
**Estimate:** 5-6 hours  
**Tasks:**
- [ ] Create seasonalStore
- [ ] Track player seasonal progress
- [ ] Create SeasonalShop UI
- [ ] Apply seasonal modifiers globally
- [ ] Add seasonal item rewards
- [ ] Create seasonal challenge tracking
- [ ] Test seasonal transitions

### 7. Skills Panel Enhancement
**Status:** Skills system exists, UI basic  
**Priority:** P2  
**Estimate:** 2 hours  
**Tasks:**
- [ ] Improve SkillsPanel layout
- [ ] Add skill descriptions
- [ ] Show skill bonuses clearly
- [ ] Add skill tree visualization
- [ ] Test skill point allocation

### 8. Monster Compendium Panel
**Status:** Store exists, may need dedicated UI  
**Priority:** P2  
**Estimate:** 2-3 hours  
**Tasks:**
- [ ] Check if compendium has dedicated panel
- [ ] If not, create MonsterCompendiumPanel
- [ ] Show all discovered monsters
- [ ] Display encounter/kill stats
- [ ] Show affix variants
- [ ] Display passive bonuses
- [ ] Add filter/search functionality

---

## 🔵 Low Priority (Polish & Content)

### 9. More Achievements
**Status:** System working, needs content  
**Priority:** P3  
**Estimate:** 1-2 hours  
**Tasks:**
- [ ] Design 20+ new achievements
- [ ] Add achievement data to achievementStore
- [ ] Test new achievements trigger correctly
- [ ] Add achievement categories
- [ ] Create achievement showcase UI

### 10. Additional Events
**Status:** System ready, needs content  
**Priority:** P3  
**Estimate:** 1-2 hours  
**Tasks:**
- [ ] Design 5+ new events
- [ ] Add event data to events.ts
- [ ] Balance event spawn rates
- [ ] Test new event rewards
- [ ] Add event variety

### 11. More Relics
**Status:** System ready, needs content  
**Priority:** P3  
**Estimate:** 1-2 hours  
**Tasks:**
- [ ] Design 10+ new relics
- [ ] Add relic data to relics.ts
- [ ] Balance relic power levels
- [ ] Create interesting synergies
- [ ] Test new relics

### 12. Additional Zones
**Status:** System working  
**Priority:** P3  
**Estimate:** 2-3 hours  
**Tasks:**
- [ ] Design zones 12-15
- [ ] Create new boss mechanics
- [ ] Add zone-specific rewards
- [ ] Balance difficulty curve
- [ ] Test zone progression

### 13. UI Polish
**Status:** Good but can improve  
**Priority:** P3  
**Estimate:** 3-4 hours  
**Tasks:**
- [ ] Improve mobile responsiveness
- [ ] Add more animations
- [ ] Enhance visual feedback
- [ ] Improve loading states
- [ ] Add more sound effects
- [ ] Create better hover states

### 14. Performance Optimization
**Status:** Good but can improve  
**Priority:** P3  
**Estimate:** 2-3 hours  
**Tasks:**
- [ ] Profile damage calculation performance
- [ ] Optimize render cycles
- [ ] Reduce unnecessary re-renders
- [ ] Improve animation performance
- [ ] Optimize localStorage operations

---

## 📊 Testing & Quality

### 15. Comprehensive Testing
**Status:** Manual testing only  
**Priority:** P2  
**Estimate:** 4-6 hours  
**Tasks:**
- [ ] Run full manual test suite
- [ ] Document all bugs found
- [ ] Test all equipment combinations
- [ ] Test edge cases (max level, max gold, etc.)
- [ ] Test prestige flow thoroughly
- [ ] Test offline progress accuracy
- [ ] Verify save/load robustness

### 16. Automated Testing
**Status:** No test suite  
**Priority:** P3  
**Estimate:** 8-10 hours  
**Tasks:**
- [ ] Set up testing framework (Vitest + Testing Library)
- [ ] Write unit tests for math functions
- [ ] Write tests for store logic
- [ ] Create integration tests for key flows
- [ ] Add E2E tests for critical paths
- [ ] Set up CI/CD pipeline

---

## 📝 Documentation

### 17. Documentation Completion
**Status:** Mostly done, some gaps  
**Priority:** P2  
**Estimate:** 2-3 hours  
**Tasks:**
- [ ] Review and update IMPLEMENTATION_TESTING_CHECKLIST.md
- [ ] Review and update DND_EQUIPMENT_CRAFTING_UPDATE.md
- [ ] Review and update QUEST_AND_WEAPON_SYSTEM_SUMMARY.md
- [ ] Create EVENTS_SYSTEM.md
- [ ] Create RELICS_SYSTEM.md
- [ ] Create EXPEDITIONS_SYSTEM.md
- [ ] Create SEASONAL_SYSTEM.md
- [ ] Update API documentation

---

## 🚀 Future Features (Icebox)

### 18. Export/Import Save
**Priority:** P4  
**Estimate:** 2-3 hours  

### 19. Leaderboards
**Priority:** P4  
**Estimate:** 8-10 hours  

### 20. Cosmetic System
**Priority:** P4  
**Estimate:** 6-8 hours  

### 21. Battle Pass
**Priority:** P4  
**Estimate:** 10-12 hours  

### 22. Monetization
**Priority:** P5  
**Estimate:** TBD  

---

## Recommended Execution Order

**Week 1 - Core Fixes:**
1. Verify new game/load game fix (P0)
2. Combat system verification (P1)
3. Event system integration (P1)
4. Comprehensive testing (P2)

**Week 2 - Tier 4 UI:**
5. Relic system UI (P1)
6. Expedition system UI (P2)
7. Skills panel enhancement (P2)
8. Monster compendium panel (P2)

**Week 3 - Seasonal & Polish:**
9. Seasonal system implementation (P2)
10. Documentation completion (P2)
11. UI polish (P3)
12. Performance optimization (P3)

**Week 4 - Content & Testing:**
13. More achievements (P3)
14. Additional events (P3)
15. More relics (P3)
16. Additional zones (P3)
17. Automated testing setup (P3)

---

## Success Metrics

**Core Functionality:**
- [ ] No critical bugs in live gameplay
- [ ] Save/load works 100% of the time
- [ ] All Tier 3 features fully functional
- [ ] Tier 4 features have working UI

**Quality:**
- [ ] 60 FPS sustained gameplay
- [ ] No console errors during normal play
- [ ] All documentation up to date
- [ ] 80%+ test coverage on critical paths

**Content:**
- [ ] 50+ achievements
- [ ] 20+ relics
- [ ] 15+ events
- [ ] 15+ zones
- [ ] 100+ equipment items

**User Experience:**
- [ ] Clear onboarding flow
- [ ] Intuitive UI/UX
- [ ] Helpful tooltips everywhere
- [ ] Good visual feedback
- [ ] Accessible to all players
