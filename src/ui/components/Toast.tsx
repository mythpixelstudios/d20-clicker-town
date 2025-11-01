import { useEffect } from 'react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  readonly toast: Toast
  readonly onClose: (id: string) => void
}

export function ToastNotification({ toast, onClose }: Readonly<ToastProps>) {
  useEffect(() => {
    const duration = toast.duration || 3000
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return ''
    }
  }

  return (
    <button 
      className={`toast toast-${toast.type}`} 
      onClick={() => onClose(toast.id)}
      type="button"
    >
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{toast.message}</span>
      <button 
        className="toast-close" 
        onClick={(e) => {
          e.stopPropagation()
          onClose(toast.id)
        }}
        type="button"
      >
        ×
      </button>
    </button>
  )
}
