/**
 * Visual Novel Style Dialogue Overlay
 * Displays character portraits and dialogue with slide-in animation from the right
 * Pauses the game while active
 */

import { useEffect, useState } from 'react'
import { useStory } from '@/state/storyStore'
import { getCharacter } from '@/data/characters'

export default function DialogueOverlay() {
  const { activeDialogue, advanceDialogue, selectChoice, closeDialogue } = useStory()
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    if (activeDialogue?.isActive) {
      // Trigger slide-in animation
      setTimeout(() => setIsVisible(true), 50)
    } else {
      setIsVisible(false)
    }
  }, [activeDialogue?.isActive])
  
  if (!activeDialogue || !activeDialogue.isActive) {
    return null
  }
  
  const currentLine = activeDialogue.dialogueLines[activeDialogue.currentLineIndex]
  const character = getCharacter(currentLine.characterId)
  
  if (!character) {
    return null
  }
  
  const hasChoices = currentLine.choices && currentLine.choices.length > 0
  const isLastLine = activeDialogue.currentLineIndex === activeDialogue.dialogueLines.length - 1
  
  const handleContinue = () => {
    if (hasChoices) return // Don't auto-advance if there are choices
    advanceDialogue()
  }
  
  const handleChoice = (choiceIndex: number) => {
    selectChoice(choiceIndex)
  }
  
  const handleSkip = () => {
    closeDialogue()
  }
  
  // Emotion-based styling
  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return 'border-yellow-400'
      case 'sad':
      case 'worried':
        return 'border-blue-400'
      case 'angry':
        return 'border-red-400'
      case 'surprised':
        return 'border-purple-400'
      default:
        return 'border-white/30'
    }
  }
  
  return (
    <>
      {/* Darkened overlay to pause game visually */}
      <div className="fixed inset-0 bg-black/60 z-[950] backdrop-blur-sm" />

      {/* Dialogue panel - slides in from right */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-gradient-to-l from-bg via-bg to-bg/95 z-[1000] flex flex-col shadow-2xl border-l-4 ${getEmotionColor(currentLine.emotion)} transition-transform duration-500 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Character Portrait Section */}
        <div className="flex-shrink-0 p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Large character portrait */}
            <div className="text-8xl leading-none">{character.portrait}</div>
            
            {/* Character info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text m-0">{character.name}</h2>
              <p className="text-sm text-gold m-0">{character.title}</p>
              {currentLine.emotion && (
                <p className="text-xs text-muted mt-1 italic capitalize">
                  {currentLine.emotion}
                </p>
              )}
            </div>
            
            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              Skip ⏭️
            </button>
          </div>
        </div>
        
        {/* Dialogue Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dialogue text box */}
          <div className="bg-black/40 border border-white/20 rounded-lg p-6 mb-4">
            <p className="text-lg text-text leading-relaxed m-0 whitespace-pre-line">
              {currentLine.text}
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300"
                style={{
                  width: `${((activeDialogue.currentLineIndex + 1) / activeDialogue.dialogueLines.length) * 100}%`
                }}
              />
            </div>
            <span className="text-xs text-muted">
              {activeDialogue.currentLineIndex + 1} / {activeDialogue.dialogueLines.length}
            </span>
          </div>
          
          {/* Choices or Continue button */}
          {hasChoices ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted mb-2">Choose your response:</p>
              {currentLine.choices!.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(index)}
                  className="w-full bg-gradient-to-r from-purple/20 to-purple/10 hover:from-purple/30 hover:to-purple/20 border border-purple/50 rounded-lg p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  <p className="text-text m-0">{choice.text}</p>
                  {choice.effects && (
                    <div className="flex gap-2 mt-2 text-xs text-gold">
                      {choice.effects.addGold && <span>+{choice.effects.addGold} Gold</span>}
                      {choice.effects.addXP && <span>+{choice.effects.addXP} XP</span>}
                      {choice.effects.unlockQuest && <span>🎯 New Quest</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-bg font-bold py-4 px-6 rounded-lg transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              {isLastLine ? 'Close' : 'Continue →'}
            </button>
          )}
        </div>
        
        {/* Context info at bottom */}
        {activeDialogue.chapterId && (
          <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/20">
            <p className="text-xs text-muted m-0 text-center">
              📖 Story Chapter in Progress
            </p>
          </div>
        )}
      </div>
    </>
  )
}

