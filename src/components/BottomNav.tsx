import { NavLink } from 'react-router-dom'
import { IconBag, IconBox, IconCart, IconChart, IconHome, IconStore } from './Icons'
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
        <IconBag />
        <span>{t('nav.orders')}</span>
      </NavLink>
      <NavLink to="/merchant/plus" className="nav-item">
        <IconChart />
        <span>{t('nav.more')}</span>
      </NavLink>
    </nav>
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
