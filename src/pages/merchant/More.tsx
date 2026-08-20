import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { Modal } from '../../components/Modal'
import { IconFile, IconChart, IconSettings, IconStore } from '../../components/Icons'
import { useI18n } from '../../i18n/I18nContext'

export function More() {
  const { loadDemo, resetAll, logout, data } = useStore()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)

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

      <div className="stack-gap">
        <button type="button" className="btn btn-secondary btn-block" onClick={() => void loadDemo()}>
          {t('more.demo')}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={() => {
            logout()
            navigate('/connexion')
          }}
        >
          {t('more.logout')}
        </button>
        <button type="button" className="btn btn-danger-ghost btn-block" onClick={() => setResetOpen(true)}>
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
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                void resetAll().then(() => {
                  setResetOpen(false)
                  navigate('/connexion')
                })
              }}
            >
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
