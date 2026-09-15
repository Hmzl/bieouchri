import { useRef, useState } from 'react'
import defaultLogo from '../assets/logo.png'
import { compressSquareImage } from '../lib/image'
import { IconCamera, IconImage } from './Icons'
import { useI18n } from '../i18n/I18nContext'

interface LogoPickerProps {
  value: string
  onChange: (dataUrl: string) => void
  titleKey?: string
  hintKey?: string
  resetKey?: string
  errorKey?: string
  maxSize?: number
}

export function LogoPicker({
  value,
  onChange,
  titleKey = 'settings.logo',
  hintKey = 'settings.logoHint',
  resetKey = 'settings.logoReset',
  errorKey = 'settings.logoErr',
  maxSize = 256,
}: LogoPickerProps) {
  const { t } = useI18n()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const src = value || defaultLogo

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError('')
    try {
      onChange(await compressSquareImage(file, maxSize))
    } catch {
      setError(t(errorKey))
    }
  }

  return (
    <div className="logo-picker">
      <span className="logo-picker-preview">
        <img src={src} alt={t(titleKey)} className="brand-logo brand-logo-lg" />
      </span>
      <div className="logo-picker-actions">
        <span className="field">
          <span>{t(titleKey)}</span>
          <small>{t(hintKey)}</small>
        </span>
        <div className="photo-actions">
          <button type="button" className="btn btn-ghost" onClick={() => cameraRef.current?.click()}>
            <IconCamera size={18} />
            {t('photo.camera')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => galleryRef.current?.click()}>
            <IconImage size={18} />
            {t('photo.gallery')}
          </button>
        </div>
        {value ? (
          <button type="button" className="btn btn-text" onClick={() => onChange('')}>
            {t(resetKey)}
          </button>
        ) : null}
        {error && <p className="field-error">{error}</p>}
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
