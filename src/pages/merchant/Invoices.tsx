import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatDateShort, formatMoney } from '../../lib/format'
import { EmptyState } from '../../components/EmptyState'
import { useI18n } from '../../i18n/I18nContext'

export function Invoices() {
  const { data } = useStore()
  const { t } = useI18n()

  return (
    <div className="page page--nav">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            {t(data.invoices.length > 1 ? 'invoices.count_plural' : 'invoices.count', { n: data.invoices.length })}
          </p>
          <h1>{t('invoices.title')}</h1>
        </div>
      </header>

      {data.invoices.length === 0 ? (
        <EmptyState title={t('invoices.emptyTitle')} text={t('invoices.emptyText')} />
      ) : (
        <ul className="invoice-list">
          {data.invoices.map((inv) => {
            const order = data.orders.find((o) => o.id === inv.orderId)
            return (
              <li key={inv.id}>
                <Link to={`/merchant/factures/${inv.id}`} className="invoice-row">
                  <div>
                    <strong>{inv.number}</strong>
                    <p>
                      {order?.customerName || t('invoices.client')} · {formatDateShort(inv.createdAt)}
                    </p>
                  </div>
                  <span>{order ? formatMoney(order.total) : '—'}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
