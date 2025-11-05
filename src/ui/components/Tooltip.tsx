import React, { ReactNode } from 'react'

export interface TooltipSection {
  title?: string
  content: ReactNode
}

export interface TooltipProps {
  readonly title: string
  readonly subtitle?: string
  readonly sections?: TooltipSection[]
  readonly stats?: Array<{ label: string; value: string | number; highlight?: boolean }>
  readonly sources?: Array<{ source: string; value: string | number }>
  readonly nextBreakpoint?: { label: string; current: number; next: number; benefit: string }
  readonly position?: 'top' | 'bottom' | 'left' | 'right'
  readonly onClose?: () => void
  readonly className?: string
}

/**
 * Shared Tooltip Component for displaying rich information
 * Supports stats, sources, breakpoints, and custom sections
 */
export default function Tooltip({
  title,
  subtitle,
  sections,
  stats,
  sources,
  nextBreakpoint,
  position = 'top',
  onClose,
  className = ''
}: TooltipProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2'
      case 'bottom':
        return 'top-[calc(100%+8px)] left-1/2 -translate-x-1/2'
      case 'left':
        return 'right-[calc(100%+8px)] top-1/2 -translate-y-1/2'
      case 'right':
        return 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2'
      default:
        return 'bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2'
    }
  }

  return (
    <div className={`absolute bg-[#2a2f3a] border-2 border-white/20 rounded-xl p-4 text-xs text-text whitespace-normal z-[1000] shadow-[0_8px_24px_rgba(0,0,0,0.4)] min-w-[200px] max-w-[320px] animate-[tooltipFadeIn_0.2s_ease-out] ${getPositionClasses()} ${className}`}>
      {onClose && (
        <button
          className="absolute top-2 right-2 bg-transparent border-0 text-muted cursor-pointer text-lg leading-none p-1 transition-colors hover:text-text"
          onClick={onClose}
          aria-label="Close tooltip"
        >
          ×
        </button>
      )}

      <div className="mb-3 border-b border-white/10 pb-2">
        <div className="text-sm font-bold text-text">{title}</div>
        {subtitle && <div className="text-[11px] text-muted mt-0.5">{subtitle}</div>}
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold text-muted uppercase mb-1.5 tracking-wider">Stats</div>
          <div className="flex flex-col gap-1">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center px-1 py-0.5 rounded transition-colors ${stat.highlight ? 'bg-yellow-500/10 border-l-2 border-l-gold pl-1.5' : ''}`}
              >
                <span className="text-muted text-[11px]">{stat.label}:</span>
                <span className="text-text font-bold text-xs">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources Section */}
      {sources && sources.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold text-muted uppercase mb-1.5 tracking-wider">Sources</div>
          <div className="flex flex-col gap-0.5">
            {sources.map((source, idx) => (
              <div key={idx} className="flex justify-between items-center py-0.5">
                <span className="text-muted text-[11px]">{source.source}</span>
                <span className="text-[#6fe19a] font-semibold text-[11px]">+{source.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Breakpoint Section */}
      {nextBreakpoint && (
        <div className="mb-3 bg-yellow-500/5 border border-yellow-500/20 rounded-md p-2">
          <div className="text-[10px] font-bold text-muted uppercase mb-1.5 tracking-wider">{nextBreakpoint.label}</div>
          <div className="my-1.5">
            <div className="w-full h-1.5 bg-black/30 rounded-sm overflow-hidden mb-1">
              <div
                className="h-full bg-gradient-to-r from-gold to-[#f59e0b] transition-[width] duration-300"
                style={{ width: `${Math.min(100, (nextBreakpoint.current / nextBreakpoint.next) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-muted text-center">
              {nextBreakpoint.current} / {nextBreakpoint.next}
            </div>
          </div>
          <div className="text-[11px] text-gold font-medium mt-1 italic">{nextBreakpoint.benefit}</div>
        </div>
      )}

      {/* Custom Sections */}
      {sections && sections.map((section, idx) => (
        <div key={idx} className="mb-3 last:mb-0">
          {section.title && <div className="text-[10px] font-bold text-muted uppercase mb-1.5 tracking-wider">{section.title}</div>}
          <div className="text-text leading-relaxed">{section.content}</div>
        </div>
      ))}
    </div>
  )
}

// Helper component for inline tooltips (hover behavior)
interface InlineTooltipProps {
  readonly content: ReactNode
  readonly children: ReactNode
  readonly position?: 'top' | 'bottom' | 'left' | 'right'
}

export function InlineTooltip({ content, children, position = 'top' }: InlineTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#2a2f3a]'
      case 'bottom':
        return 'top-[calc(100%+6px)] left-1/2 -translate-x-1/2 after:content-[""] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-[#2a2f3a]'
      case 'left':
        return 'right-[calc(100%+6px)] top-1/2 -translate-y-1/2 after:content-[""] after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-4 after:border-transparent after:border-l-[#2a2f3a]'
      case 'right':
        return 'left-[calc(100%+6px)] top-1/2 -translate-y-1/2 after:content-[""] after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-4 after:border-transparent after:border-r-[#2a2f3a]'
      default:
        return 'bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#2a2f3a]'
    }
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute bg-[#2a2f3a] border border-white/20 rounded-lg px-3 py-2 text-[11px] text-text whitespace-nowrap z-[1000] shadow-[0_4px_12px_rgba(0,0,0,0.3)] pointer-events-none animate-[tooltipFadeIn_0.2s_ease-out] ${getPositionClasses()}`}>
          {content}
        </div>
      )}
    </div>
  )
}
