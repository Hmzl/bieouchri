import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  isAppInstalled,
  isChromiumInstallable,
  markAppInstalled,
  rememberIfInstalled,
} from '../lib/install'
import { IconClose, IconDownload, IconShare } from './Icons'
import { Logo } from './Logo'

const DISMISS_KEY = 'awani-chawki-install-dismiss'
const ENTERED_KEY = 'awani-chawki-entered-at'
const DELAY_MS = 20_000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (rememberIfInstalled() || sessionStorage.getItem(DISMISS_KEY)) return

    const hide = () => {
      markAppInstalled()
      setVisible(false)
    }

    const onPrompt = (event: Event) => {
      event.preventDefault()
      const next = event as BeforeInstallPromptEvent
      deferredRef.current = next
      setDeferred(next)
    }
    const onInstalled = () => hide()
    const media = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)')
    const onDisplay = () => {
      if (media.matches || rememberIfInstalled()) hide()
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    media.addEventListener?.('change', onDisplay)

    void navigator.getInstalledRelatedApps?.().then((apps) => {
      if (apps && apps.length > 0) hide()
    })

    const started = Number(sessionStorage.getItem(ENTERED_KEY) || Date.now())
    sessionStorage.setItem(ENTERED_KEY, String(started))
    const wait = Math.max(0, DELAY_MS - (Date.now() - started))
    const timer = window.setTimeout(() => {
      if (rememberIfInstalled()) return
      if (isChromiumInstallable() && !deferredRef.current) return
      setVisible(true)
    }, wait)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      media.removeEventListener?.('change', onDisplay)
      window.clearTimeout(timer)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  async function download() {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') {
        markAppInstalled()
        setVisible(false)
      }
      return
    }
    setIosHelp(true)
  }

  if (isAppInstalled() || !visible) return null

  return (
    <aside className="install-banner" role="dialog" aria-label={t('install.title')}>
      <button type="button" className="install-banner-close" onClick={dismiss} aria-label={t('install.close')}>
        <IconClose size={18} />
      </button>
      <div className="install-banner-icon" aria-hidden="true">
        <Logo size="sm" />
      </div>
      <div className="install-banner-copy">
        <strong>{t('install.title')}</strong>
        <p>{iosHelp ? t('install.ios') : t('install.text')}</p>
      </div>
      <button type="button" className="btn btn-primary install-banner-btn" onClick={() => void download()}>
        {iosHelp ? <IconShare size={18} /> : <IconDownload size={18} />}
        {t('install.btn')}
      </button>
    </aside>
  )
}
