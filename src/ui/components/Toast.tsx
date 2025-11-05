import { useEffect } from 'react'

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

  const getTypeClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500 bg-gradient-to-br from-green-900/50 to-[#2a2a2a]'
      case 'error':
        return 'border-red-500 bg-gradient-to-br from-red-900/50 to-[#2a2a2a]'
      case 'warning':
        return 'border-orange-500 bg-gradient-to-br from-orange-900/50 to-[#2a2a2a]'
      case 'info':
        return 'border-blue-500 bg-gradient-to-br from-blue-900/50 to-[#2a2a2a]'
      default:
        return 'border-gray-500 bg-[#2a2a2a]'
    }
  }

  return (
    <button
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)] min-w-[300px] max-w-[400px] pointer-events-auto cursor-pointer animate-slide-in transition-all duration-200 hover:-translate-x-1 ${getTypeClasses()}`}
      onClick={() => onClose(toast.id)}
      type="button"
    >
      <span className="text-xl flex-shrink-0">{getIcon()}</span>
      <span className="flex-1 text-white text-sm font-medium leading-[1.4]">{toast.message}</span>
      <button
        className="bg-transparent border-0 text-white/60 text-2xl leading-none p-0 cursor-pointer flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-all duration-200 hover:bg-white/10 hover:text-white"
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
