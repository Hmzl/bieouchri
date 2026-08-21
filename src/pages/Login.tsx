import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useStore } from '../context/StoreContext'
import { useI18n } from '../i18n/I18nContext'

export function Login() {
  const { isMerchant, login, recoverViaWhatsApp } = useStore()
  const { t, lang, err } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/merchant'
  const [username, setUsername] = useState('awani')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (isMerchant) return <Navigate to="/merchant" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      const ok = await login(username, password)
      if (!ok) {
        setError(t('login.error'))
        return
      }
      navigate(from.startsWith('/merchant') ? from : '/merchant', { replace: true })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'login.unavailable'
      setError(message === 'login.error' ? t('login.error') : err(message || 'login.unavailable'))
    } finally {
      setBusy(false)
    }
  }

  async function forgot() {
    setError('')
    setInfo('')
    setBusy(true)
    try {
      const result = await recoverViaWhatsApp(lang)
      if (!result.ok) {
        setError(t(result.reason === 'no-wa' ? 'login.forgotNoWa' : 'login.forgotFail'))
        return
      }
      setInfo(t(result.reset ? 'login.forgotNew' : 'login.forgotOk'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page page--welcome">
      <div className="welcome-hero">
        <Logo size="lg" />
        <p className="eyebrow">{t('login.kicker')}</p>
        <h1>{t('login.title')}</h1>
        <p className="lede">{t('login.lead')}</p>
        <p className="muted">{t('login.hint')}</p>
      </div>
      <form className="form" onSubmit={(e) => void submit(e)}>
        <label className="field">
          <span>{t('login.user')}</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            required
          />
        </label>
        <label className="field">
          <span>{t('login.pass')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="field-error">{error}</p>}
        {info && <p className="field-ok">{info}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? t('login.busy') : t('login.submit')}
        </button>
        <button type="button" className="btn btn-text btn-block" disabled={busy} onClick={() => void forgot()}>
          {t('login.forgot')}
        </button>
      </form>
      <p className="welcome-foot">
        <Link to="/" className="text-link">
          {t('login.back')}
        </Link>
      </p>
    </div>
  )
}
