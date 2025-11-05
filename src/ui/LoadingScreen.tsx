import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoadComplete: () => void
}

export default function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('Preparing your adventure...')

  useEffect(() => {
    const messages = [
      'Preparing your adventure...',
      'Rolling dice...',
      'Sharpening swords...',
      'Brewing potions...',
      'Gathering the party...',
      'Loading the realm...'
    ]

    let currentProgress = 0
    let messageIndex = 0

    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5 // Random increment between 5-20
      
      if (currentProgress >= 100) {
        currentProgress = 100
        setProgress(100)
        clearInterval(interval)
        
        // Small delay before transitioning
        setTimeout(() => {
          onLoadComplete()
        }, 300)
      } else {
        setProgress(currentProgress)
        
        // Update message based on progress
        const newMessageIndex = Math.floor((currentProgress / 100) * messages.length)
        if (newMessageIndex !== messageIndex && newMessageIndex < messages.length) {
          messageIndex = newMessageIndex
          setLoadingMessage(messages[messageIndex])
        }
      }
    }, 200) // Update every 200ms

    return () => clearInterval(interval)
  }, [onLoadComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-bg to-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 max-w-md w-full px-4">
        {/* Placeholder for loading image - can be replaced with actual artwork */}
        <div className="relative">
          <div className="relative flex items-center justify-center">
            <div className="text-8xl animate-pulse">⚔️</div>
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
        </div>

        {/* Loading message */}
        <div className="text-text text-xl font-medium text-center animate-pulse">
          {loadingMessage}
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="h-3 bg-panel border border-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-gold to-yellow-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-muted text-sm text-center">
            {Math.floor(progress)}%
          </div>
        </div>
      </div>
    </div>
  )
}

