import React, { ReactNode } from 'react'
import './Tooltip.css'

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
  return (
    <div className={`shared-tooltip ${position} ${className}`}>
      {onClose && (
        <button 
          className="tooltip-close" 
          onClick={onClose}
          aria-label="Close tooltip"
        >
          ×
        </button>
      )}
      
      <div className="tooltip-header">
        <div className="tooltip-title">{title}</div>
        {subtitle && <div className="tooltip-subtitle">{subtitle}</div>}
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className="tooltip-section">
          <div className="section-label">Stats</div>
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className={`stat-row ${stat.highlight ? 'highlight' : ''}`}
              >
                <span className="stat-label">{stat.label}:</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources Section */}
      {sources && sources.length > 0 && (
        <div className="tooltip-section">
          <div className="section-label">Sources</div>
          <div className="sources-list">
            {sources.map((source, idx) => (
              <div key={idx} className="source-row">
                <span className="source-name">{source.source}</span>
                <span className="source-value">+{source.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Breakpoint Section */}
      {nextBreakpoint && (
        <div className="tooltip-section breakpoint-section">
          <div className="section-label">{nextBreakpoint.label}</div>
          <div className="breakpoint-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, (nextBreakpoint.current / nextBreakpoint.next) * 100)}%` }}
              />
            </div>
            <div className="progress-text">
              {nextBreakpoint.current} / {nextBreakpoint.next}
            </div>
          </div>
          <div className="breakpoint-benefit">{nextBreakpoint.benefit}</div>
        </div>
      )}

      {/* Custom Sections */}
      {sections && sections.map((section, idx) => (
        <div key={idx} className="tooltip-section">
          {section.title && <div className="section-label">{section.title}</div>}
          <div className="section-content">{section.content}</div>
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

  return (
    <div 
      className="inline-tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`inline-tooltip ${position}`}>
          {content}
        </div>
      )}
    </div>
  )
}
