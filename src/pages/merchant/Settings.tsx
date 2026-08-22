import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { Header } from '../../components/Header'
import { LogoPicker } from '../../components/LogoPicker'
import { buildAccessMessage, digitsOnly, openWhatsApp } from '../../lib/whatsapp'
import { useI18n } from '../../i18n/I18nContext'

export function Settings() {
  const { data, saveSettings } = useStore()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [form, setForm] = useState(data.settings)
  const [username, setUsername] = useState(data.settings.username || 'awani')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const whatsapp = digitsOnly(form.whatsapp)
    if (form.whatsapp.trim() && whatsapp.length < 8) {
      setError(t('settings.errWa'))
      return
    }
    const threshold = Number(form.lowStockThreshold)
    if (!Number.isInteger(threshold) || threshold < 1) {
      setError(t('settings.errLow'))
      return
    }
    const deliveryFee = Number(form.deliveryFee)
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
      setError(t('settings.errDelivery'))
      return
    }
    if (!username.trim()) {
      setError(t('settings.errUser'))
      return
    }
    if (password && password.length < 4) {
      setError(t('settings.errPassLen'))
      return
    }
    if (password && password !== password2) {
      setError(t('settings.errPass'))
      return
    }
    setBusy(true)
    try {
      await saveSettings(
        {
          ...form,
          storeName: form.storeName.trim() || 'Awani Chawki',
          merchantName: form.merchantName.trim(),
          whatsapp,
          lowStockThreshold: threshold,
          deliveryFee,
          currency: 'MAD',
          currencySymbol: 'DH',
          address: form.address.trim(),
          username: username.trim(),
          logo: form.logo || '',
        },
        password || undefined,
      )
      if (password && whatsapp) {
        openWhatsApp(
          whatsapp,
          buildAccessMessage(form.storeName.trim() || 'Awani Chawki', username.trim(), password, lang),
        )
      }
      setPassword('')
      setPassword2('')
      setSaved(true)
      window.setTimeout(() => navigate('/merchant'), 700)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('settings.errFail'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <Header title={t('settings.title')} subtitle={t('settings.sub')} backTo="/merchant/plus" />
      <form className="form" onSubmit={(e) => void submit(e)}>
        <LogoPicker value={form.logo || ''} onChange={(logo) => set('logo', logo)} />
        <label className="field">
          <span>{t('settings.store')}</span>
          <input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
        </label>
        <label className="field">
          <span>{t('settings.firstName')}</span>
          <input value={form.merchantName} onChange={(e) => set('merchantName', e.target.value)} placeholder="Awani" />
        </label>
        <label className="field">
          <span>{t('settings.wa')}</span>
          <input
            value={form.whatsapp}
            onChange={(e) => set('whatsapp', e.target.value)}
            inputMode="tel"
            placeholder="2126…"
          />
          <small>{t('settings.waHint')}</small>
        </label>
        <label className="field">
          <span>{t('settings.address')}</span>
          <input value={form.address} onChange={(e) => set('address', e.target.value)} />
        </label>
        <label className="field">
          <span>{t('settings.currency')}</span>
          <input value={t('settings.currencyValue')} readOnly />
        </label>
        <label className="field">
          <span>{t('settings.delivery')}</span>
          <input
            value={String(form.deliveryFee ?? 0)}
            onChange={(e) => set('deliveryFee', Number(e.target.value) || 0)}
            inputMode="decimal"
          />
          <small>{t('settings.deliveryHint')}</small>
        </label>
        <label className="field">
          <span>{t('settings.low')}</span>
          <input
            value={String(form.lowStockThreshold)}
            onChange={(e) => set('lowStockThreshold', Number(e.target.value) || 0)}
            inputMode="numeric"
          />
        </label>

        <h2 className="section-title">{t('settings.account')}</h2>
        <p className="muted">{t('settings.accountHint')}</p>
        <label className="field">
          <span>{t('settings.user')}</span>
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setSaved(false)
            }}
            autoComplete="username"
            autoCapitalize="none"
          />
        </label>
        <label className="field">
          <span>{t('settings.newPass')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setSaved(false)
            }}
            autoComplete="new-password"
            placeholder={t('settings.newPassPh')}
          />
        </label>
        <label className="field">
          <span>{t('settings.confirmPass')}</span>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        {error && <p className="field-error">{error}</p>}
        {saved && <p className="field-ok">{t('settings.saved')}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? t('settings.saving') : t('settings.save')}
        </button>
      </form>
    </div>
  )
}
