import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconClose } from './Icons'
import { useI18n } from '../i18n/I18nContext'

interface BarcodeScanProps {
  open: boolean
  onClose: () => void
  onDetected: (code: string) => void
  linger?: boolean
  submitLabel?: string
  notice?: string
  extra?: ReactNode
}

type Detector = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>
}

function createDetector(): Detector | null {
  const Ctor = (window as Window & { BarcodeDetector?: new (opts?: { formats?: string[] }) => Detector }).BarcodeDetector
  if (!Ctor) return null
  try {
    return new Ctor({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code', 'data_matrix'] })
  } catch {
    try {
      return new Ctor()
    } catch {
      return null
    }
  }
}

export function BarcodeScan({
  open,
  onClose,
  onDetected,
  linger = false,
  submitLabel,
  notice,
  extra,
}: BarcodeScanProps) {
  const { t } = useI18n()
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected
  const lingerRef = useRef(linger)
  lingerRef.current = linger
  const lastScanRef = useRef({ code: '', at: 0 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [manual, setManual] = useState('')
  const [error, setError] = useState('')
  const [camera, setCamera] = useState(true)

  useEffect(() => {
    if (!open) return
    setError('')
    setManual('')
    setCamera(true)
    lastScanRef.current = { code: '', at: 0 }
    const detector = createDetector()
    let stopped = false
    let timer = 0

    async function start() {
      if (!detector || !navigator.mediaDevices?.getUserMedia) {
        setCamera(false)
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        let video = videoRef.current
        for (let i = 0; i < 12 && !video && !stopped; i += 1) {
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve())
          })
          video = videoRef.current
        }
        if (!video || stopped) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        video.srcObject = stream
        await video.play()

        const tick = async () => {
          if (stopped || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            const value = codes[0]?.rawValue?.trim()
            if (value) {
              const now = Date.now()
              if (value === lastScanRef.current.code && now - lastScanRef.current.at < 1400) {
                timer = window.setTimeout(() => void tick(), 280)
                return
              }
              lastScanRef.current = { code: value, at: now }
              onDetectedRef.current(value)
              if (!lingerRef.current) return
            }
          } catch {
            /* keep scanning */
          }
          timer = window.setTimeout(() => void tick(), 280)
        }
        void tick()
      } catch {
        setCamera(false)
        setError(t('scan.camFail'))
      }
    }

    void start()
    return () => {
      stopped = true
      window.clearTimeout(timer)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [open, t])

  if (!open) return null

  function submitManual() {
    const code = manual.trim()
    if (!code) {
      setError(t('scan.empty'))
      return
    }
    setError('')
    onDetected(code)
    setManual('')
  }

  const host = document.querySelector('.app-root')
  if (!host) return null
  const shownError = error || notice

  return createPortal(
    <div className="scan-overlay" role="dialog" aria-modal="true" aria-labelledby="scan-title">
      <div className="scan-sheet">
        <div className="scan-head">
          <h2 id="scan-title">{t('scan.title')}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('scan.close')}>
            <IconClose />
          </button>
        </div>
        {camera && (
          <div className="scan-video-wrap">
            <video ref={videoRef} className="scan-video" playsInline muted autoPlay />
            <div className="scan-frame" aria-hidden="true" />
          </div>
        )}
        <p className="muted">{t('scan.hint')}</p>
        <label className="field">
          <span>{t('scan.manual')}</span>
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder={t('scan.manualPh')}
          />
        </label>
        {shownError && <p className="field-error">{shownError}</p>}
        <button type="button" className="btn btn-primary btn-block" onClick={submitManual}>
          {submitLabel || t('scan.submit')}
        </button>
        {extra}
      </div>
    </div>,
    host,
  )
}
