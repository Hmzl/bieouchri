import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import defaultLogo from '../assets/logo.png'
import { useStore } from '../context/StoreContext'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  src?: string
  onHold?: () => void
  holdMs?: number
}

const sizes = {
  sm: 40,
  md: 56,
  lg: 88,
}

export function Logo({ size = 'md', className = '', src, onHold, holdMs = 5000 }: LogoProps) {
  const { data } = useStore()
  const image = src || data.settings.logo || defaultLogo
  const alt = data.settings.storeName || 'Awani Chawki'
  const s = sizes[size]
  const timer = useRef<number | null>(null)
  const [holding, setHolding] = useState(false)

  function clearHold() {
    setHolding(false)
    if (timer.current != null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  function startHold(e: PointerEvent<HTMLSpanElement>) {
    if (!onHold) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    clearHold()
    setHolding(true)
    timer.current = window.setTimeout(() => {
      timer.current = null
      setHolding(false)
      onHold()
    }, holdMs)
  }

  useEffect(() => () => clearHold(), [])

  const img = (
    <img
      src={image}
      alt={alt}
      width={s}
      height={s}
      draggable={false}
      className={`brand-logo brand-logo-${size} ${className}`.trim()}
    />
  )

  if (!onHold) return img

  return (
    <span
      className={`brand-logo-hold ${holding ? 'is-holding' : ''}`}
      onPointerDown={startHold}
      onPointerUp={clearHold}
      onPointerCancel={clearHold}
      onContextMenu={(e) => e.preventDefault()}
      style={{ '--hold-ms': `${holdMs}ms` } as CSSProperties}
    >
      {img}
    </span>
  )
}
