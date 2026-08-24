import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  consumeInstallPrompt,
  hasInstallPrompt,
  installHint,
  isAppInstalled,
  markAppInstalled,
  onInstallPromptReady,
  rememberIfInstalled,
} from '../lib/install'
import { IconClose, IconDownload } from './Icons'

const DISMISS_KEY = 'awani-chawki-install-dismiss'

export function InstallBanner() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(DISMISS_KEY)
    } catch {
      return true
    }
  })
  const [canPrompt, setCanPrompt] = useState(hasInstallPrompt())
  const installedRef = useRef(rememberIfInstalled())

  useEffect(() => {
    return onInstallPromptReady(() => setCanPrompt(true))
  }, [])

  useEffect(() => {
    const hideInstalled = () => {
      installedRef.current = true
      markAppInstalled()
      setVisible(false)
    }

    if (installedRef.current || isAppInstalled()) {
      hideInstalled()
      return
    }

    window.addEventListener('appinstalled', hideInstalled)
    const media = window.matchMedia('(display-mode: standalone)')
    const onDisplay = () => {
      if (media.matches) hideInstalled()
    }
    media.addEventListener?.('change', onDisplay)

    return () => {
      window.removeEventListener('appinstalled', hideInstalled)
      media.removeEventListener?.('change', onDisplay)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  async function download() {
    const event = consumeInstallPrompt()
    setCanPrompt(false)
    const promptPromise = event ? event.prompt() : null
    dismiss()
    if (!event || !promptPromise) return
    try {
      await promptPromise
      const choice = await event.userChoice
      if (choice.outcome === 'accepted') markAppInstalled()
    } catch {
      /* the browser may reject a second prompt */
    }
  }

  if (isAppInstalled() || !visible) return null

  const hint = installHint() === 'ios' ? t('install.ios') : canPrompt ? t('install.text') : t('install.android')

  return (
    <div className="install-overlay" role="presentation">
      <aside className="install-banner" role="dialog" aria-modal="true" aria-label={t('install.title')}>
        <button type="button" className="install-banner-close" onClick={dismiss} aria-label={t('install.close')}>
          <IconClose size={18} />
        </button>
        <div className="install-banner-icon" aria-hidden="true">
          <img src="/logo.png" alt="" width={72} height={72} className="brand-logo brand-logo-lg" />
        </div>
        <div className="install-banner-copy">
          <strong>{t('install.title')}</strong>
          <p>{hint}</p>
        </div>
        <button type="button" className="btn btn-primary install-banner-btn" onClick={() => void download()}>
          <IconDownload size={18} />
          {t('install.btn')}
        </button>
      </aside>
    </div>
  )
}
