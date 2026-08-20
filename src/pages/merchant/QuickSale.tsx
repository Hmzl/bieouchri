import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatMoney } from '../../lib/format'
import { Header } from '../../components/Header'
import { ProductImage } from '../../components/ProductImage'
import { QtyStepper } from '../../components/QtyStepper'
import { useI18n } from '../../i18n/I18nContext'
import { salePrice } from '../../lib/product'
import { PriceTag } from '../../components/PriceTag'

export function QuickSale() {
  const { data, placeOrder } = useStore()
  const { t, err } = useI18n()
  const navigate = useNavigate()
  const [qty, setQty] = useState<Record<string, number>>({})
  const [customerName, setCustomerName] = useState('')
  const [error, setError] = useState('')

  const lines = useMemo(
    () =>
      Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    [qty],
  )

  const total = lines.reduce((s, line) => {
    const p = data.products.find((x) => x.id === line.productId)
    return s + (p ? salePrice(p) * line.quantity : 0)
  }, 0)

  async function confirm() {
    setError('')
    try {
      await placeOrder({
        customerName: customerName.trim() || t('sale.clientPh'),
        customerPhone: '',
        address: t('orders.shopSale'),
        lat: null,
        lng: null,
        source: 'pos',
        items: lines,
      })
      navigate('/merchant/commandes')
    } catch (e) {
      setError(e instanceof Error ? err(e.message) : t('sale.fail'))
    }
  }

  return (
    <div className="page">
      <Header title={t('sale.title')} subtitle={t('sale.sub')} backTo="/merchant" />
      <label className="field">
        <span>{t('sale.client')}</span>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t('sale.clientPh')} />
      </label>
      <ul className="sale-list">
        {data.products.map((p) => (
          <li key={p.id} className="sale-row">
            <ProductImage product={p} className="thumb" />
            <div>
              <strong>{p.name}</strong>
              <p>
                <PriceTag product={p} /> · {t('sale.stock', { n: p.quantity })}
              </p>
            </div>
            <QtyStepper
              value={qty[p.id] ?? 0}
              min={0}
              max={p.quantity}
              onChange={(v) => setQty((prev) => ({ ...prev, [p.id]: v }))}
            />
          </li>
        ))}
      </ul>
      {error && <p className="field-error">{error}</p>}
      <div className="checkout-bar">
        <div>
          <p>{t('sale.total')}</p>
          <strong>{formatMoney(total)}</strong>
        </div>
        <button type="button" className="btn btn-primary" disabled={lines.length === 0} onClick={() => void confirm()}>
          {t('sale.ok')}
        </button>
      </div>
    </div>
  )
}
