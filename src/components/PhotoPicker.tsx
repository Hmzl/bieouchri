import { useRef, useState } from 'react'
import { compressImage } from '../lib/image'
import { MAX_PRODUCT_IMAGES } from '../lib/product'
import { IconCamera, IconImage, IconTrash } from './Icons'
import { useI18n } from '../i18n/I18nContext'

interface PhotoPickerProps {
  values: string[]
  onChange: (images: string[]) => void
  max?: number
}

export function PhotoPicker({ values, onChange, max = MAX_PRODUCT_IMAGES }: PhotoPickerProps) {
  const { t } = useI18n()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const remaining = Math.max(0, max - values.length)

  async function addFiles(files: FileList | File[] | null | undefined) {
    if (!files || remaining <= 0) return
    setError('')
    const next = [...values]
    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        next.push(await compressImage(file, 720, 0.65))
      }
      onChange(next)
    } catch {
      setError(t('photo.err'))
    }
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index))
  }

  function setCover(index: number) {
    if (index <= 0) return
    const next = [...values]
    const [picked] = next.splice(index, 1)
    onChange([picked, ...next])
  }

  return (
    <div className="photo-picker">
      {values.length === 0 ? (
        <div className="photo-empty">{t('photo.label')}</div>
      ) : (
        <div className="photo-grid">
          {values.map((src, i) => (
            <div key={`${src.slice(0, 24)}-${i}`} className={`photo-tile ${i === 0 ? 'is-cover' : ''}`}>
              <img src={src} alt="" />
              {i === 0 && <span className="photo-tile-label">{t('photo.cover')}</span>}
              <div className="photo-tile-actions">
                {i > 0 && (
                  <button type="button" onClick={() => setCover(i)} aria-label={t('photo.setCover')}>
                    ★
                  </button>
                )}
                <button type="button" onClick={() => removeAt(i)} aria-label={t('photo.remove')}>
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="muted photo-count">{t('photo.count', { n: values.length, max })}</p>
      <div className="photo-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => cameraRef.current?.click()}
          disabled={remaining <= 0}
        >
          <IconCamera size={18} />
          {t('photo.camera')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => galleryRef.current?.click()}
          disabled={remaining <= 0}
        >
          <IconImage size={18} />
          {t('photo.gallery')}
        </button>
      </div>
      {remaining <= 0 && <p className="muted">{t('photo.max', { n: max })}</p>}
      {error && <p className="field-error">{error}</p>}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void addFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void addFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
