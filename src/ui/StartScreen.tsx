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
      const charData = localStorage.getItem('char-v4')
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
    <div className="fixed inset-0 bg-gradient-to-b from-bg via-panel to-black overflow-hidden">
      <div className="relative h-full flex flex-col items-center justify-center">
        {/* Knight silhouette and campfire scene */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <div className="text-6xl animate-pulse">🔥</div>
              <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-3xl"></div>
            </div>
            <div className="relative mt-20">
              <div className="text-8xl">⚔️</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/50 rounded-full blur-md"></div>
            </div>
            <div className="absolute top-0 left-0 right-0 text-4xl text-center animate-pulse">✨ ⭐ ✨</div>
          </div>
        </div>

        {/* Title */}
        <div className="relative z-10 text-center mb-12">
          <h1 className="text-6xl font-bold text-gold mb-4 drop-shadow-[0_0_20px_rgba(225,184,102,0.5)]">Clicker Town</h1>
          <p className="text-xl text-muted italic">A Tale of Heroes and Adventure</p>
        </div>

        {/* Action buttons */}
        <div className="relative z-10 flex flex-col gap-4 min-w-[300px]">
          {hasExistingSave && (
            <button
              className="bg-gradient-to-r from-gold to-yellow-600 text-bg font-bold py-4 px-8 rounded-lg text-lg cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(225,184,102,0.5)] active:scale-95"
              onClick={handleContinueAdventure}
            >
              🗡️ Continue Adventure
            </button>
          )}

          <button
            className="bg-panel border-2 border-gold/50 text-gold font-bold py-4 px-8 rounded-lg text-lg cursor-pointer transition-all hover:bg-gold/10 hover:border-gold hover:scale-105 active:scale-95"
            onClick={handleNewAdventure}
          >
            ⚔️ Start New Adventure
          </button>
        </div>
      </div>

      {/* Name input modal */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-panel border border-gold/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(225,184,102,0.3)]">
            <h2 className="text-2xl font-bold text-gold mb-2">Choose Your Name, Hero</h2>
            <p className="text-muted mb-6">What shall the tales call you?</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              className="w-full bg-bg border border-white/20 rounded-lg px-4 py-3 text-text text-lg mb-6 focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNameInput(false)}
                className="bg-transparent border border-white/20 text-muted px-6 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/5 hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleNameSubmit}
                disabled={!playerName.trim()}
                className="bg-gradient-to-r from-gold to-yellow-600 text-bg font-bold px-6 py-2 rounded-lg cursor-pointer transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next: Roll Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stat Rolling Modal */}
      {showStatRolling && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-panel border border-gold/30 rounded-2xl p-6 max-w-4xl w-full my-8 shadow-[0_0_40px_rgba(225,184,102,0.3)]">
            <h2 className="text-3xl font-bold text-gold mb-2 text-center">🎲 Roll Your Ability Scores</h2>
            <p className="text-muted text-sm mb-6 text-center max-w-2xl mx-auto">
              Roll a d20 for each ability (capped at 5-18). You get 3 attempts - on the final roll, compare all three and choose your best set!
            </p>

            {/* Roll Counter */}
            <div className="bg-black/30 rounded-lg px-4 py-2 mb-4 text-center">
              <span className="text-text font-semibold">Rolls Used: {rollCount} / 3</span>
            </div>

            {/* Context message */}
            {rollSets.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                {rollCount < 3 ? (
                  <p className="text-sm text-muted text-center m-0">
                    This is your current roll. You can keep it or roll again to see if you get better stats.
                  </p>
                ) : (
                  <p className="text-sm text-muted text-center m-0">
                    Here are all three of your rolls. Select the one you want to start your adventure with!
                  </p>
                )}
              </div>
            )}

            {/* Roll Sets Display */}
            {rollSets.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-6">
                {rollSets.map((rollSet, index) => {
                  const statOrder: StatName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
                  const isSelected = selectedRollIndex === index

                  return (
                    <div
                      key={rollSet.id}
                      className={`flex-1 min-w-[250px] bg-black/30 border-2 rounded-xl p-4 cursor-pointer transition-all hover:scale-105 ${
                        isSelected
                          ? 'border-gold shadow-[0_0_20px_rgba(225,184,102,0.4)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => handleSelectRoll(index)}
                    >
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                        <h3 className="text-lg font-bold text-text m-0">Set {rollSet.id}</h3>
                        <div className="text-xs text-muted">
                          Total: {rollSet.total} (Mods: {rollSet.modifierTotal >= 0 ? '+' : ''}{rollSet.modifierTotal})
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {statOrder.map((statName) => {
                          const value = rollSet.stats[statName]
                          const modifier = calculateModifier(value)
                          const quality = getStatQuality(value)

                          return (
                            <div key={statName} className="flex-1 min-w-[90px] bg-panel rounded p-2">
                              <div className="text-[10px] text-muted uppercase font-bold mb-1">{getStatLabel(statName)}</div>
                              <div className="flex items-center justify-between">
                                <div
                                  className="text-2xl font-bold"
                                  style={{ color: quality.color }}
                                >
                                  {value}
                                </div>
                                <div className="text-sm text-muted">
                                  {formatModifier(modifier)}
                                </div>
                              </div>
                              <div
                                className="text-[10px] font-medium mt-1"
                                style={{ color: quality.color }}
                              >
                                {quality.label}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {isSelected && (
                        <div className="bg-gold text-bg text-center py-1 rounded font-bold text-sm">✓ Selected</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button
                onClick={handleRollStats}
                disabled={rollCount >= 3}
                className="bg-purple text-text font-bold px-6 py-3 rounded-lg cursor-pointer transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                🎲 {rollCount === 0 ? 'Roll Stats' : 'Roll Again'} ({3 - rollCount} left)
              </button>

              {rollCount === 3 && (
                <button
                  onClick={handleKeepBestAutomatically}
                  className="bg-blue-500 text-white font-bold px-6 py-3 rounded-lg cursor-pointer transition-all hover:scale-105"
                >
                  ⭐ Auto-Select Best
                </button>
              )}

              <button
                onClick={handleConfirmStats}
                disabled={selectedRollIndex === null}
                className="bg-gradient-to-r from-gold to-yellow-600 text-bg font-bold px-6 py-3 rounded-lg cursor-pointer transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                ✓ {rollCount === 3 ? 'Confirm & Begin Adventure' : 'Keep This Roll'}
              </button>
            </div>

            {/* Stat Explanations */}
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-text font-bold mb-3 text-center">Ability Score Guide:</h4>
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="flex-1 min-w-[200px] text-muted"><strong className="text-text">STR (Strength):</strong> Melee & click damage</div>
                <div className="flex-1 min-w-[200px] text-muted"><strong className="text-text">DEX (Dexterity):</strong> Attack speed & crit chance</div>
                <div className="flex-1 min-w-[200px] text-muted"><strong className="text-text">CON (Constitution):</strong> Health & survivability</div>
                <div className="flex-1 min-w-[200px] text-muted"><strong className="text-text">INT (Intelligence):</strong> Magic & auto damage</div>
                <div className="flex-1 min-w-[200px] text-muted"><strong className="text-text">WIS (Wisdom):</strong> XP gain & resource drops</div>
                <div className="flex-1 min-w-[200px] text-muted"><strong className="text-text">CHA (Charisma):</strong> Shop prices & quest rewards</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}