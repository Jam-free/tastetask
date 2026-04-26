import { useRef } from 'react'

interface ToastProps {
  message: string
  show: boolean
}

export function Toast({ message, show }: ToastProps) {
  return (
    <div id="toast" className={`toast ${show ? 'show' : ''}`}>
      {message}
    </div>
  )
}

/**
 * Toast Hook
 */
export function useToast() {
  const toast = useRef<{
    message: string
    show: boolean
    timer: ReturnType<typeof setTimeout> | null
  }>({
    message: '',
    show: false,
    timer: null,
  })

  const showToast = (message: string, duration = 2200) => {
    if (toast.current.timer) {
      clearTimeout(toast.current.timer)
    }

    toast.current.message = message
    toast.current.show = true

    // 触发重新渲染
    updateToast()

    toast.current.timer = setTimeout(() => {
      toast.current!.show = false
      updateToast()
    }, duration)
  }

  return { toast, showToast }
}

// 简单的全局状态用于触发更新
let updateFn: (() => void) | null = null

function updateToast() {
  updateFn?.()
}

export function setToastUpdate(fn: () => void) {
  updateFn = fn
}
