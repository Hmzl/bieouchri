import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { IconBack } from './Icons'

interface HeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  action?: ReactNode
}

export function Header({ title, subtitle, backTo, action }: HeaderProps) {
  const { t } = useI18n()
  return (
    <header className="page-header">
      <div className="page-header-left">
        {backTo && (
          <Link to={backTo} className="icon-btn" aria-label={t('back')}>
            <IconBack className="icon-back" />
          </Link>
        )}
        <div>
          {subtitle && <p className="eyebrow">{subtitle}</p>}
          <h1>{title}</h1>
        </div>
      </div>
      {action}
    </header>
  )
}
