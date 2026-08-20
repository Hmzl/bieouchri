import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { computeAnalytics, lowStockProducts, outOfStockProducts } from '../../lib/analytics'
import { formatDateLong, formatMoney, greeting, initials } from '../../lib/format'
import { IconAlert, IconPlus } from '../../components/Icons'
import { Logo } from '../../components/Logo'
import { ProductImage } from '../../components/ProductImage'
import { useI18n } from '../../i18n/I18nContext'

export function Dashboard() {
  const { data } = useStore()
  const { t } = useI18n()
  const { settings, products, orders } = data
  const stats = computeAnalytics(orders)
  const low = lowStockProducts(products, settings.lowStockThreshold)
  const out = outOfStockProducts(products)
  const name = settings.merchantName || settings.storeName
  const recent = orders.slice(0, 4)

  return (
    <div className="page page--nav">
      <header className="page-header">
        <div className="brand-row">
          <Logo size="sm" />
          <div>
            <p className="eyebrow">{formatDateLong(new Date())}</p>
            <h1>
              {greeting()}
              {name ? `, ${name.split(' ')[0]}` : ''}
            </h1>
          </div>
        </div>
        <Link to="/merchant/parametres" className="avatar" aria-label={t('dash.settings')}>
          {initials(name || 'Awani Chawki')}
        </Link>
      </header>

      {(low.length > 0 || out.length > 0) && (
        <Link to="/merchant/produits?stock=faible" className="alert-banner">
          <IconAlert size={18} />
          <div>
            <strong>{t('dash.stockAlert')}</strong>
            <p>
              {out.length > 0 && t(out.length > 1 ? 'dash.out_plural' : 'dash.out', { n: out.length })}
              {out.length > 0 && low.length > 0 && ' · '}
              {low.length > 0 && t(low.length > 1 ? 'dash.low_plural' : 'dash.low', { n: low.length })}
            </p>
          </div>
        </Link>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <p>{t('dash.sales')}</p>
          <strong>{formatMoney(stats.totalSales)}</strong>
        </article>
        <article className="stat-card">
          <p>{t('dash.profit')}</p>
          <strong>{formatMoney(stats.profit)}</strong>
        </article>
        <article className="stat-card">
          <p>{t('dash.sold')}</p>
          <strong>{stats.itemsSold}</strong>
        </article>
        <article className="stat-card">
          <p>{t('dash.orders')}</p>
          <strong>{stats.orderCount}</strong>
        </article>
      </section>

      <div className="quick-row">
        <Link to="/merchant/produits/nouveau" className="btn btn-primary">
          <IconPlus size={18} />
          {t('dash.addProduct')}
        </Link>
        <Link to="/merchant/vente" className="btn btn-secondary">
          {t('dash.quickSale')}
        </Link>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>{t('dash.top')}</h2>
          <Link to="/merchant/rapports">{t('dash.reports')}</Link>
        </div>
        {stats.topProducts.length === 0 ? (
          <p className="muted">{t('dash.topEmpty')}</p>
        ) : (
          <ul className="top-list">
            {stats.topProducts.map((p, i) => {
              const product = products.find((x) => x.name === p.name)
              return (
                <li key={p.name}>
                  <span className="rank">{i + 1}</span>
                  {product ? <ProductImage product={product} className="thumb" /> : <div className="thumb ph" />}
                  <div>
                    <strong>{p.name}</strong>
                    <p>
                      {t(p.quantity > 1 ? 'dash.soldCount_plural' : 'dash.soldCount', { n: p.quantity })} ·{' '}
                      {formatMoney(p.revenue)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>{t('dash.recent')}</h2>
          <Link to="/merchant/commandes">{t('dash.seeAll')}</Link>
        </div>
        {recent.length === 0 ? (
          <p className="muted">{t('dash.noOrders')}</p>
        ) : (
          <ul className="order-mini">
            {recent.map((o) => (
              <li key={o.id}>
                <div>
                  <strong>{o.customerName || t('client.shop')}</strong>
                  <p>{t(o.items.reduce((s, i) => s + i.quantity, 0) > 1 ? 'cart.items_plural' : 'cart.items', { n: o.items.reduce((s, i) => s + i.quantity, 0) })}</p>
                </div>
                <span>{formatMoney(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
