import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { Modal } from '../../components/Modal'
import { IconFile, IconChart, IconSettings, IconStore } from '../../components/Icons'
import { useI18n } from '../../i18n/I18nContext'

export function More() {
  const { loadDemo, resetAll, logout, data } = useStore()
  const { t, err } = useI18n()
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function demo() {
    setError('')
    setBusy(true)
    try {
      await loadDemo()
    } catch (e) {
      setError(e instanceof Error ? err(e.message) : t('more.error'))
    } finally {
      setBusy(false)
    }
  }

  async function confirmReset() {
    setError('')
    setBusy(true)
    try {
      await resetAll()
      setResetOpen(false)
      navigate('/connexion')
    } catch (e) {
      setError(e instanceof Error ? err(e.message) : t('more.error'))
      setResetOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page page--nav">
      <header className="page-header">
        <div>
          <p className="eyebrow">{data.settings.storeName}</p>
          <h1>{t('more.title')}</h1>
        </div>
      </header>

      <nav className="menu-list">
        <Link to="/merchant/rapports" className="menu-item">
          <IconChart />
          <div>
            <strong>{t('more.reports')}</strong>
            <p>{t('more.reportsSub')}</p>
          </div>
        </Link>
        <Link to="/merchant/factures" className="menu-item">
          <IconFile />
          <div>
            <strong>{t('more.invoices')}</strong>
            <p>{t('more.invoicesSub')}</p>
          </div>
        </Link>
        <Link to="/merchant/parametres" className="menu-item">
          <IconSettings />
          <div>
            <strong>{t('more.settings')}</strong>
            <p>{t('more.settingsSub')}</p>
          </div>
        </Link>
        <Link to="/" className="menu-item">
          <IconStore />
          <div>
            <strong>{t('more.shop')}</strong>
            <p>{t('more.shopSub')}</p>
          </div>
        </Link>
      </nav>

      {error && <p className="field-error">{error}</p>}

      <div className="stack-gap">
        <button type="button" className="btn btn-secondary btn-block" disabled={busy} onClick={() => void demo()}>
          {t('more.demo')}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          disabled={busy}
          onClick={() => {
            logout()
            navigate('/connexion')
          }}
        >
          {t('more.logout')}
        </button>
        <button type="button" className="btn btn-danger-ghost btn-block" disabled={busy} onClick={() => setResetOpen(true)}>
          {t('more.reset')}
        </button>
      </div>

      <Modal
        open={resetOpen}
        title={t('more.resetTitle')}
        onClose={() => setResetOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setResetOpen(false)}>
              {t('form.cancel')}
            </button>
            <button type="button" className="btn btn-danger" disabled={busy} onClick={() => void confirmReset()}>
              {t('more.resetOk')}
            </button>
          </>
        }
      >
        <p>{t('more.resetText')}</p>
      </Modal>
    </div>
  )
}
