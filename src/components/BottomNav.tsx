import { NavLink } from 'react-router-dom'
import { IconBox, IconCart, IconChart, IconHome, IconStore } from './Icons'
import { useStore } from '../context/StoreContext'
import { useI18n } from '../i18n/I18nContext'

export function MerchantNav() {
  const { t } = useI18n()
  return (
    <nav className="bottom-nav bottom-nav--merchant" aria-label={t('nav.merchant')}>
      <NavLink to="/merchant" end className="nav-item">
        <IconHome />
        <span>{t('nav.home')}</span>
      </NavLink>
      <NavLink to="/merchant/produits" className="nav-item">
        <IconBox />
        <span>{t('nav.products')}</span>
      </NavLink>
      <NavLink to="/merchant/commandes" className="nav-item">
        <IconBagIcon />
        <span>{t('nav.orders')}</span>
      </NavLink>
      <NavLink to="/merchant/plus" className="nav-item">
        <IconChart />
        <span>{t('nav.more')}</span>
      </NavLink>
    </nav>
  )
}

function IconBagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8h12l-1 13H7zM9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export function ClientNav() {
  const { cart } = useStore()
  const { t } = useI18n()
  const count = cart.reduce((s, i) => s + i.quantity, 0)
  return (
    <nav className="bottom-nav bottom-nav--client" aria-label={t('nav.client')}>
      <NavLink to="/" end className="nav-item">
        <IconStore />
        <span>{t('nav.shop')}</span>
      </NavLink>
      <NavLink to="/panier" className="nav-item">
        <span className="nav-icon-wrap">
          <IconCart />
          {count > 0 && <i className="nav-badge">{count > 9 ? '9+' : count}</i>}
        </span>
        <span>{t('nav.cart')}</span>
      </NavLink>
    </nav>
  )
}
