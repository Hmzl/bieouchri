import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconBack } from './Icons'

interface HeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  action?: ReactNode
}

export function Header({ title, subtitle, backTo, action }: HeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-left">
        {backTo && (
          <Link to={backTo} className="icon-btn" aria-label={title}>
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
