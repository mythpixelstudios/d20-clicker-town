import React, { useState } from 'react'
import { 
  generateThreeRollSets, 
  getBestRollSet, 
  calculateModifier, 
  formatModifier, 
  getStatLabel,
  getStatQuality,
  type StatRollSet, 
  type StatName 
} from '@/systems/statRolling'

interface StartScreenProps {
  readonly onStartAdventure: (playerName?: string, stats?: StatRollSet['stats']) => void
}

export default function StartScreen({ onStartAdventure }: StartScreenProps) {
  const [showNameInput, setShowNameInput] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [showStatRolling, setShowStatRolling] = useState(false)
  const [rollSets, setRollSets] = useState<StatRollSet[]>([])
  const [selectedRollIndex, setSelectedRollIndex] = useState<number | null>(null)
  const [rollCount, setRollCount] = useState(0)
  const [allRollSets, setAllRollSets] = useState<StatRollSet[]>([]) // Store all rolls made
  
  // Check if there's existing save data
  const hasSaveData = () => {
    try {
      const charData = localStorage.getItem('char-v3')
      const economyData = localStorage.getItem('econ-v2')
      return charData && economyData && 
             (JSON.parse(charData)?.state?.level > 1 || 
              JSON.parse(economyData)?.state?.gold > 0 ||
              JSON.parse(economyData)?.state?.inventory?.length > 0)
    } catch {
      return false
    }
  }

  const clearAllSaveData = () => {
    // Clear all localStorage keys for the game
    const gameKeys = [
      'char-v4',  // Updated version
      'econ-v2', 
      'town-v3',
      'zone-progression-store',
      'combat-v3',
      'crafting-store',
      'tavern-v2',
      'achievement-store-v2',
      'daily-quests-store',
      'offline-progress-store',
      'analytics-store',
      'meta-store',
      'monster-compendium-store',
      'player-name',
      'audio-settings',
      'clicker-town-expeditions',
      'clicker-town-events',
      'clicker-town-relics'
    ]
    
    for (const key of gameKeys) {
      localStorage.removeItem(key)
    }
    
    // Force reload the page to reinitialize all stores with default state
    window.location.reload()
  }

  const handleNewAdventure = () => {
    if (hasSaveData()) {
      if (confirm('Starting a new adventure will erase all current progress. Are you sure?')) {
        clearAllSaveData()
        setShowNameInput(true)
      }
    } else {
      setShowNameInput(true)
    }
  }

  const handleContinueAdventure = () => {
    onStartAdventure()
  }

  const handleNameSubmit = () => {
    if (playerName.trim()) {
      // Store player name in localStorage
      localStorage.setItem('player-name', playerName.trim())
      // Move to stat rolling
      setShowNameInput(false)
      setShowStatRolling(true)
      handleRollStats() // Auto-roll first set
    }
  }

  const handleRollStats = () => {
    const newRollSets = generateThreeRollSets()
    const currentRollSet = newRollSets[0] // Get just one roll set
    
    // Update the ID to match the roll number
    const newRollCount = rollCount + 1
    currentRollSet.id = newRollCount
    
    // Store the current roll in allRollSets
    setAllRollSets(prev => [...prev, currentRollSet])
    
    // Increment roll count
    setRollCount(newRollCount)
    
    // If this is the third roll, show all three sets; otherwise show only current
    if (newRollCount === 3) {
      // On third roll, combine all rolls to show all three
      const allThree = [...allRollSets, currentRollSet]
      setRollSets(allThree)
    } else {
      // Show only the current roll
      setRollSets([currentRollSet])
    }
    
    setSelectedRollIndex(null) // Reset selection
  }

  const handleSelectRoll = (index: number) => {
    setSelectedRollIndex(index)
  }

  const handleKeepBestAutomatically = () => {
    if (rollCount === 3) {
      // On third roll, select the best from all three
      const bestSet = getBestRollSet(rollSets)
      const bestIndex = rollSets.findIndex(set => set.id === bestSet.id)
      setSelectedRollIndex(bestIndex)
    } else {
      // If not on third roll yet, just select the current roll
      setSelectedRollIndex(0)
    }
  }

  const handleConfirmStats = () => {
    if (selectedRollIndex !== null) {
      const selectedStats = rollSets[selectedRollIndex].stats
      onStartAdventure(playerName.trim(), selectedStats)
    }
  }

  const hasExistingSave = hasSaveData()

  return (
    <div className="start-screen">
      <div className="start-screen-background">
        {/* Knight silhouette and campfire scene */}
        <div className="knight-scene">
          <div className="fire-container">
            <div className="fire">🔥</div>
            <div className="fire-glow"></div>
          </div>
          <div className="knight-silhouette">
            <div className="knight-body">⚔️</div>
            <div className="knight-shadow"></div>
          </div>
          <div className="stars">✨ ⭐ ✨</div>
        </div>

        {/* Title */}
        <div className="game-title">
          <h1>Clicker Town</h1>
          <p className="subtitle">A Tale of Heroes and Adventure</p>
        </div>

        {/* Action buttons */}
        <div className="start-buttons">
          {hasExistingSave && (
            <button 
              className="continue-button"
              onClick={handleContinueAdventure}
            >
              🗡️ Continue Adventure
            </button>
          )}
          
          <button 
            className="new-adventure-button"
            onClick={handleNewAdventure}
          >
            ⚔️ Start New Adventure
          </button>
        </div>
      </div>

      {/* Name input modal */}
      {showNameInput && (
        <div className="name-input-modal">
          <div className="modal-content">
            <h2>Choose Your Name, Hero</h2>
            <p>What shall the tales call you?</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            />
            <div className="modal-buttons">
              <button 
                onClick={() => setShowNameInput(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleNameSubmit}
                disabled={!playerName.trim()}
                className="confirm-button"
              >
                Next: Roll Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stat Rolling Modal */}
      {showStatRolling && (
        <div className="stat-rolling-modal">
          <div className="modal-content-large">
            <h2>🎲 Roll Your Ability Scores</h2>
            <p className="modal-subtitle">
              Roll a d20 for each ability (capped at 5-18). You get 3 attempts - on the final roll, compare all three and choose your best set!
            </p>

            {/* Roll Counter */}
            <div className="roll-counter">
              <span>Rolls Used: {rollCount} / 3</span>
            </div>

            {/* Context message */}
            {rollSets.length > 0 && (
              <div className="roll-context-message">
                {rollCount < 3 ? (
                  <p>
                    This is your current roll. You can keep it or roll again to see if you get better stats.
                  </p>
                ) : (
                  <p>
                    Here are all three of your rolls. Select the one you want to start your adventure with!
                  </p>
                )}
              </div>
            )}

            {/* Roll Sets Display */}
            {rollSets.length > 0 && (
              <div className="roll-sets-container">
                {rollSets.map((rollSet, index) => {
                  const statOrder: StatName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
                  const isSelected = selectedRollIndex === index

                  return (
                    <div
                      key={rollSet.id}
                      className={`roll-set-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectRoll(index)}
                    >
                      <div className="roll-set-header">
                        <h3>Set {rollSet.id}</h3>
                        <div className="roll-set-total">
                          Total: {rollSet.total} (Mods: {rollSet.modifierTotal >= 0 ? '+' : ''}{rollSet.modifierTotal})
                        </div>
                      </div>

                      <div className="stats-grid">
                        {statOrder.map((statName) => {
                          const value = rollSet.stats[statName]
                          const modifier = calculateModifier(value)
                          const quality = getStatQuality(value)

                          return (
                            <div key={statName} className="stat-item">
                              <div className="stat-label">{getStatLabel(statName)}</div>
                              <div className="stat-value-container">
                                <div 
                                  className="stat-value"
                                  style={{ color: quality.color }}
                                >
                                  {value}
                                </div>
                                <div className="stat-modifier">
                                  {formatModifier(modifier)}
                                </div>
                              </div>
                              <div 
                                className="stat-quality"
                                style={{ color: quality.color }}
                              >
                                {quality.label}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {isSelected && (
                        <div className="selected-indicator">✓ Selected</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="stat-rolling-actions">
              <button
                onClick={handleRollStats}
                disabled={rollCount >= 3}
                className="roll-button"
              >
                🎲 {rollCount === 0 ? 'Roll Stats' : 'Roll Again'} ({3 - rollCount} left)
              </button>

              {rollCount === 3 && (
                <button
                  onClick={handleKeepBestAutomatically}
                  className="auto-select-button"
                >
                  ⭐ Auto-Select Best
                </button>
              )}

              <button
                onClick={handleConfirmStats}
                disabled={selectedRollIndex === null}
                className="confirm-stats-button"
              >
                ✓ {rollCount === 3 ? 'Confirm & Begin Adventure' : 'Keep This Roll'}
              </button>
            </div>

            {/* Stat Explanations */}
            <div className="stat-help-text">
              <h4>Ability Score Guide:</h4>
              <div className="stat-help-grid">
                <div><strong>STR (Strength):</strong> Melee & click damage</div>
                <div><strong>DEX (Dexterity):</strong> Attack speed & crit chance</div>
                <div><strong>CON (Constitution):</strong> Health & survivability</div>
                <div><strong>INT (Intelligence):</strong> Magic & auto damage</div>
                <div><strong>WIS (Wisdom):</strong> XP gain & resource drops</div>
                <div><strong>CHA (Charisma):</strong> Shop prices & quest rewards</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}