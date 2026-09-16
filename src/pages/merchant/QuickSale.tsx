import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatMoney } from '../../lib/format'
import { Header } from '../../components/Header'
import { ProductImage } from '../../components/ProductImage'
import { QtyStepper } from '../../components/QtyStepper'
import { EmptyState } from '../../components/EmptyState'
import { BarcodeScan } from '../../components/BarcodeScan'
import { IconScan, IconTrash } from '../../components/Icons'
import { useI18n } from '../../i18n/I18nContext'
import { findProductByBarcode, salePrice } from '../../lib/product'
import { PriceTag } from '../../components/PriceTag'

export function QuickSale() {
  const { data, placeOrder } = useStore()
  const { t, err } = useI18n()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [qty, setQty] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [scanOpen, setScanOpen] = useState(() => params.get('scan') === '1')

  useEffect(() => {
    if (params.get('scan') !== '1') return
    setScanOpen(true)
    const next = new URLSearchParams(params)
    next.delete('scan')
    setParams(next, { replace: true })
  }, [params, setParams])

  const stocked = useMemo(
    () => data.products.filter((p) => p.quantity > 0),
    [data.products],
  )

  const lines = useMemo(
    () =>
      Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    [qty],
  )

  function addProduct(productId: string) {
    const product = data.products.find((p) => p.id === productId)
    if (!product) return
    const current = qty[product.id] ?? 0
    if (product.quantity <= 0 || current >= product.quantity) {
      setError(t('sale.max'))
      return
    }
    setError('')
    setQty((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }))
  }

  const total = lines.reduce((s, line) => {
    const p = data.products.find((x) => x.id === line.productId)
    return s + (p ? salePrice(p) * line.quantity : 0)
  }, 0)

  function addScanned(code: string) {
    const product = findProductByBarcode(data.products, code)
    if (!product) {
      setError(t('scan.notFound'))
      return
    }
    if (product.quantity <= 0) {
      setError(t('scan.out'))
      return
    }
    const current = qty[product.id] ?? 0
    if (current >= product.quantity) {
      setError(t('sale.max'))
      return
    }
    setError('')
    setQty((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }))
  }

  async function confirm() {
    if (lines.length === 0 || busy) return
    setScanOpen(false)
    setError('')
    setBusy(true)
    try {
      await placeOrder({
        customerName: '',
        customerPhone: '',
        address: '',
        lat: null,
        lng: null,
        source: 'pos',
        items: lines,
      })
      navigate('/merchant/commandes')
    } catch (e) {
      setError(e instanceof Error ? err(e.message) : t('sale.fail'))
    } finally {
      setBusy(false)
    }
  }

  const verifyBtn = (
    <button type="button" className="btn btn-primary" disabled={lines.length === 0 || busy} onClick={() => void confirm()}>
      {busy ? t('sale.busy') : t('sale.ok')}
    </button>
  )

  return (
    <div className="page">
      <Header title={t('sale.title')} subtitle={t('sale.sub')} backTo="/merchant" />

      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={() => {
          setError('')
          setScanOpen(true)
        }}
      >
        <IconScan size={18} />
        {t('sale.scan')}
      </button>
      <p className="muted">{t('sale.hint')}</p>

      {stocked.length === 0 ? (
        <EmptyState title={t('sale.emptyTitle')} text={t('sale.emptyText')} />
      ) : (
        <ul className="sale-list">
          {stocked.map((p) => {
            const quantity = qty[p.id] ?? 0
            return (
              <li key={p.id} className="sale-row">
                <button type="button" className="sale-pick" onClick={() => addProduct(p.id)}>
                  <ProductImage product={p} className="thumb" />
                  <div className="product-meta">
                    <strong>{p.name}</strong>
                    <p>
                      <PriceTag product={p} /> · {t('sale.stock', { n: p.quantity })}
                    </p>
                  </div>
                </button>
                <div className="cart-row-tools">
                  <QtyStepper
                    value={quantity}
                    min={0}
                    max={p.quantity}
                    onChange={(v) => {
                      setError('')
                      setQty((prev) => ({ ...prev, [p.id]: v }))
                    }}
                  />
                  {quantity > 0 && (
                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => setQty((prev) => ({ ...prev, [p.id]: 0 }))}
                    >
                      <IconTrash size={16} />
                      {t('cart.remove')}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {error && <p className="field-error">{error}</p>}

      <div className="checkout-bar">
        <div>
          <p>{t('sale.total')}</p>
          <strong>{formatMoney(total)}</strong>
        </div>
        {verifyBtn}
      </div>

      <BarcodeScan
        open={scanOpen}
        linger
        submitLabel={t('sale.add')}
        notice={error}
        onClose={() => setScanOpen(false)}
        onDetected={addScanned}
        extra={
          lines.length > 0 ? (
            <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={() => void confirm()}>
              {busy ? t('sale.busy') : `${t('sale.ok')} · ${formatMoney(total)}`}
            </button>
          ) : null
        }
      />
    </div>
  )
}
