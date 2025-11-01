import { create } from 'zustand'
import type { Toast, ToastType } from '@/ui/components/Toast'

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (message: string, type: ToastType, duration?: number) => {
    const id = `${Date.now()}-${Math.random()}`
    const toast: Toast = {
      id,
      message,
      type,
      duration: duration || 3000
    }
    
    set((state) => ({
      toasts: [...state.toasts, toast]
    }))
  },
  
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  }
}))
