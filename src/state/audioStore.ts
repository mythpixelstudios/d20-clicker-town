import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AudioState {
  isMuted: boolean
  volume: number
  currentAmbient: string | null
  
  // Actions
  toggleMute: () => void
  setVolume: (volume: number) => void
  playSound: (soundId: string) => void
  playAmbient: (ambientId: string) => void
  stopAmbient: () => void
}

// Sound effect registry (using Data URIs for simple beeps or external URLs)
const soundEffects: Record<string, string> = {
  click: 'data:audio/wav;base64,UklGRhYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAACAA==',
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  craftingComplete: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  achievement: 'https://assets.mixkit.co/active_storage/sfx/1999/1999-preview.mp3',
  itemDrop: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
  buttonClick: 'data:audio/wav;base64,UklGRhYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAACAA=='
}

// Ambient tracks for different tabs
const ambientTracks: Record<string, string> = {
  combat: 'https://assets.mixkit.co/active_storage/sfx/2479/2479-preview.mp3',
  town: 'https://assets.mixkit.co/active_storage/sfx/2470/2470-preview.mp3',
  tavern: 'https://assets.mixkit.co/active_storage/sfx/2466/2466-preview.mp3'
}

// Audio manager instance
let audioContext: AudioContext | null = null
let currentAmbientAudio: HTMLAudioElement | null = null

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export const useAudio = create<AudioState>()(
  persist(
    (set, get) => ({
      isMuted: false,
      volume: 0.5,
      currentAmbient: null,

      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }))
        if (get().isMuted && currentAmbientAudio) {
          currentAmbientAudio.pause()
        } else if (!get().isMuted && currentAmbientAudio) {
          currentAmbientAudio.play().catch(console.error)
        }
      },

      setVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume))
        set({ volume: clampedVolume })
        if (currentAmbientAudio) {
          currentAmbientAudio.volume = clampedVolume
        }
      },

      playSound: (soundId: string) => {
        const { isMuted, volume } = get()
        if (isMuted) return

        const soundUrl = soundEffects[soundId]
        if (!soundUrl) return

        // Use Web Audio API for short sounds
        if (soundUrl.startsWith('data:')) {
          try {
            const context = getAudioContext()
            const oscillator = context.createOscillator()
            const gainNode = context.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(context.destination)
            
            oscillator.frequency.value = 800
            gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1)
            
            oscillator.start(context.currentTime)
            oscillator.stop(context.currentTime + 0.1)
          } catch (error) {
            console.error('Error playing sound:', error)
          }
        } else {
          // Use HTML5 Audio for external URLs
          const audio = new Audio(soundUrl)
          audio.volume = volume
          audio.play().catch(console.error)
        }
      },

      playAmbient: (ambientId: string) => {
        const { isMuted, volume, currentAmbient } = get()
        
        // Don't restart if already playing the same track
        if (currentAmbient === ambientId && currentAmbientAudio) return

        // Stop current ambient
        if (currentAmbientAudio) {
          currentAmbientAudio.pause()
          currentAmbientAudio = null
        }

        const trackUrl = ambientTracks[ambientId]
        if (!trackUrl || isMuted) {
          set({ currentAmbient: null })
          return
        }

        try {
          currentAmbientAudio = new Audio(trackUrl)
          currentAmbientAudio.volume = volume * 0.3 // Lower volume for ambient
          currentAmbientAudio.loop = true
          
          if (!isMuted) {
            currentAmbientAudio.play().catch(console.error)
          }
          
          set({ currentAmbient: ambientId })
        } catch (error) {
          console.error('Error playing ambient:', error)
        }
      },

      stopAmbient: () => {
        if (currentAmbientAudio) {
          currentAmbientAudio.pause()
          currentAmbientAudio = null
        }
        set({ currentAmbient: null })
      }
    }),
    {
      name: 'audio-settings',
      partialize: (state) => ({
        isMuted: state.isMuted,
        volume: state.volume
      })
    }
  )
)

// Helper functions for common sounds
export const playSoundEffect = (effect: 'click' | 'levelUp' | 'craftingComplete' | 'achievement' | 'itemDrop' | 'buttonClick') => {
  useAudio.getState().playSound(effect)
}

export const playAmbientTrack = (tab: 'combat' | 'town' | 'tavern') => {
  useAudio.getState().playAmbient(tab)
}
