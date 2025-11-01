import { useAudio } from '@/state/audioStore'
import './AudioControls.css'

export default function AudioControls() {
  const { isMuted, volume, toggleMute, setVolume } = useAudio()

  return (
    <div className="audio-controls">
      <button
        className="audio-toggle-btn"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        title={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      
      <div className="volume-control">
        <label htmlFor="volume-slider" className="sr-only">
          Volume
        </label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className="volume-slider"
          aria-label="Volume control"
          disabled={isMuted}
        />
        <span className="volume-value" aria-live="polite">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  )
}
