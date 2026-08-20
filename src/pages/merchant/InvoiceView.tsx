import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatDateShort, formatMoney, mapsUrl } from '../../lib/format'
import { Header } from '../../components/Header'
import { IconShare } from '../../components/Icons'
import { Logo } from '../../components/Logo'
import { buildOrderMessage, openWhatsApp } from '../../lib/whatsapp'
import { useI18n } from '../../i18n/I18nContext'

export function InvoiceView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data } = useStore()
  const { t, lang } = useI18n()
  const invoice = data.invoices.find((i) => i.id === id)
  const order = useMemo(
    () => (invoice ? data.orders.find((o) => o.id === invoice.orderId) : undefined),
    [invoice, data.orders],
  )

  if (!invoice || !order) {
    return (
      <div className="page">
        <Header title={t('invoice.missing')} backTo="/merchant/factures" />
      </div>
    )
  }

  const currentInvoice = invoice
  const currentOrder = order
  const { settings } = data
  const fee = order.deliveryFee ?? 0
  const subtotal = order.total - fee

  function printInvoice() {
    window.print()
  }

  function shareInvoice() {
    const text = `${t('invoice.label')} ${currentInvoice.number} — ${settings.storeName}\n${t('cart.total')} : ${formatMoney(currentOrder.total)}`
    if (navigator.share) {
      void navigator.share({ title: currentInvoice.number, text })
      return
    }
    if (settings.whatsapp) {
      openWhatsApp(settings.whatsapp, text)
    }
  }

  function sendWhatsAppCopy() {
    if (!settings.whatsapp) {
      navigate('/merchant/parametres')
      return
    }
    openWhatsApp(
      settings.whatsapp,
      buildOrderMessage(currentOrder, settings.storeName, settings.currencySymbol, settings.currency, lang),
    )
  }

  return (
    <div className="page">
      <div className="no-print">
        <Header
          title={invoice.number}
          subtitle={t('invoice.label')}
          backTo="/merchant/factures"
          action={
            <button type="button" className="icon-btn" onClick={shareInvoice} aria-label={t('invoice.share')}>
              <IconShare />
            </button>
          }
        />
      </div>

      <article className="invoice paper">
        <header className="invoice-brand">
          <Logo size="md" />
          <h1>{settings.storeName}</h1>
          {settings.address && <p>{settings.address}</p>}
          {settings.whatsapp && <p>WhatsApp {settings.whatsapp}</p>}
        </header>
        <div className="invoice-meta">
          <div>
            <p className="eyebrow">{t('invoice.label')}</p>
            <strong>{invoice.number}</strong>
          </div>
          <div>
            <p className="eyebrow">{t('invoice.date')}</p>
            <strong>{formatDateShort(invoice.createdAt)}</strong>
          </div>
        </div>
        <div className="invoice-client">
          <p className="eyebrow">{t('invoices.client')}</p>
          <strong>{order.customerName || t('invoice.shopClient')}</strong>
          {order.customerPhone && <p>{order.customerPhone}</p>}
          <p>{order.address}</p>
          {order.lat != null && order.lng != null && (
            <a href={mapsUrl(order.lat, order.lng)} target="_blank" rel="noreferrer">
              {order.lat.toFixed(5)}, {order.lng.toFixed(5)}
            </a>
          )}
        </div>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>{t('invoice.product')}</th>
              <th>{t('invoice.qty')}</th>
              <th>{t('invoice.price')}</th>
              <th>{t('invoice.total')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId + item.name}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatMoney(item.price)}</td>
                <td>{formatMoney(item.price * item.quantity)}</td>
              </tr>
            ))}
            {fee > 0 && (
              <tr>
                <td>{t('invoice.delivery')}</td>
                <td>1</td>
                <td>{formatMoney(fee)}</td>
                <td>{formatMoney(fee)}</td>
              </tr>
            )}
          </tbody>
        </table>
        {fee > 0 && (
          <p className="muted">
            {t('invoice.subtotal')} {formatMoney(subtotal)}
          </p>
        )}
        <p className="invoice-total">
          {t('invoice.due')}
          <strong>{formatMoney(order.total)}</strong>
        </p>
        <p className="invoice-thanks">{t('invoice.thanks')}</p>
      </article>

      <div className="no-print stack-gap">
        <button type="button" className="btn btn-primary btn-block" onClick={printInvoice}>
          {t('invoice.print')}
        </button>
        <button type="button" className="btn btn-secondary btn-block" onClick={sendWhatsAppCopy}>
          {t('invoice.wa')}
        </button>
        <Link to="/merchant/commandes" className="btn btn-ghost btn-block">
          {t('invoice.back')}
        </Link>
      </div>
    </div>
  )
}
