import { useAudio } from '@/state/audioStore'

export default function AudioControls() {
  const { isMuted, volume, toggleMute, setVolume } = useAudio()

  return (
    <div className="fixed top-3 right-3 flex items-center gap-2 bg-panel/95 border border-white/10 rounded-lg px-3 py-2 z-[900] shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-[10px]">
      <button
        className="bg-transparent border-0 text-xl cursor-pointer p-1 flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        title={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <div className="flex items-center gap-2">
        <label htmlFor="volume-slider" className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0, 0, 0, 0)' }}>
          Volume
        </label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className="w-20 h-1 appearance-none bg-white/20 rounded-sm outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:bg-amber-500 [&::-webkit-slider-thumb]:hover:scale-120 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:bg-amber-500 [&::-moz-range-thumb]:hover:scale-120"
          aria-label="Volume control"
          disabled={isMuted}
        />
        <span className="text-[11px] text-muted min-w-[32px] text-right font-semibold" aria-live="polite">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  )
}
