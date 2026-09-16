import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatDateShort, formatMoney, formatTime, mapsUrl } from '../../lib/format'
import { EmptyState } from '../../components/EmptyState'
import { useI18n } from '../../i18n/I18nContext'

export function Orders() {
  const { data, updateOrderStatus } = useStore()
  const { t, err } = useI18n()
  const { orders, invoices } = data
  const [error, setError] = useState('')

  async function setStatus(id: string, status: 'completed' | 'cancelled') {
    setError('')
    try {
      await updateOrderStatus(id, status)
    } catch (e) {
      setError(e instanceof Error ? err(e.message) : t('orders.error'))
    }
  }

  return (
    <div className="page page--nav">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t(orders.length > 1 ? 'orders.count_plural' : 'orders.count', { n: orders.length })}</p>
          <h1>{t('orders.title')}</h1>
        </div>
      </header>

      {error && <p className="field-error">{error}</p>}

      {orders.length === 0 ? (
        <EmptyState title={t('orders.emptyTitle')} text={t('orders.emptyText')} />
      ) : (
        <ul className="order-list">
          {orders.map((o) => {
            const invoice = invoices.find((i) => i.orderId === o.id)
            const fee = o.deliveryFee ?? 0
            return (
              <li key={o.id} className="card order-card">
                <div className="order-card-head">
                  <div>
                    <strong>{o.customerName || t('client.shop')}</strong>
                    <p>
                      {formatDateShort(o.createdAt)} · {formatTime(o.createdAt)}
                    </p>
                  </div>
                  <span className={`status status--${o.status}`}>{t(`status.${o.status}`)}</span>
                </div>
                <ul className="order-items">
                  {o.items.map((item) => (
                    <li key={item.productId + item.name}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
                {fee > 0 && (
                  <p className="muted">
                    {t('cart.delivery')} {formatMoney(fee)}
                  </p>
                )}
                <p className="order-address">
                  {o.source === 'pos' ? t('orders.shopSale') : o.address}
                  {o.lat != null && o.lng != null && (
                    <>
                      {' · '}
                      <a href={mapsUrl(o.lat, o.lng)} target="_blank" rel="noreferrer">
                        {t('orders.map')}
                      </a>
                    </>
                  )}
                </p>
                {o.customerPhone && <p className="muted">{t('orders.tel', { n: o.customerPhone })}</p>}
                <div className="order-card-foot">
                  <strong>{formatMoney(o.total)}</strong>
                  <div className="row-actions">
                    {o.status === 'confirmed' && (
                      <>
                        <button type="button" className="btn btn-ghost" onClick={() => void setStatus(o.id, 'completed')}>
                          {t('orders.done')}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => void setStatus(o.id, 'cancelled')}>
                          {t('orders.cancel')}
                        </button>
                      </>
                    )}
                    {invoice && (
                      <Link to={`/merchant/factures/${invoice.id}`} className="btn btn-ghost">
                        {t('orders.invoice')}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
