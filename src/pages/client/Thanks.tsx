import { Link, useLocation } from 'react-router-dom'
import { IconCheck } from '../../components/Icons'
import { useI18n } from '../../i18n/I18nContext'

interface LocationState {
  orderId?: string
  whatsappOpened?: boolean | 'skipped'
}

export function Thanks() {
  const location = useLocation()
  const { t } = useI18n()
  const state = (location.state ?? {}) as LocationState

  return (
    <div className="page page--center">
      <div className="thanks">
        <div className="thanks-icon" aria-hidden="true">
          <IconCheck size={32} />
        </div>
        <h1>{t('thanks.title')}</h1>
        <p>{t('thanks.text')}</p>
        {state.whatsappOpened === 'skipped' && <p className="muted">{t('thanks.noWa')}</p>}
        {state.whatsappOpened === false && <p className="field-error">{t('thanks.waFail')}</p>}
        <p className="muted">{t('thanks.received')}</p>
        <Link to="/" className="btn btn-primary btn-block">
          {t('thanks.back')}
        </Link>
      </div>
    </div>
  )
}
