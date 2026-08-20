import { Link } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatMoney } from '../../lib/format'
import { ProductImage } from '../../components/ProductImage'
import { QtyStepper } from '../../components/QtyStepper'
import { EmptyState } from '../../components/EmptyState'
import { PriceTag } from '../../components/PriceTag'
import { useI18n } from '../../i18n/I18nContext'
import { salePrice } from '../../lib/product'

export function Cart() {
  const { data, cart, setCartQty, removeFromCart } = useStore()
  const { t } = useI18n()
  const lines = cart
    .map((c) => {
      const product = data.products.find((p) => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter((x) => x !== null)

  const subtotal = lines.reduce((s, l) => s + salePrice(l.product) * l.quantity, 0)
  const delivery = Math.max(0, data.settings.deliveryFee || 0)
  const total = subtotal + delivery
  const blocked = lines.some((l) => l.quantity > l.product.quantity)

  return (
    <div className="page page--nav">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t(lines.length > 1 ? 'cart.items_plural' : 'cart.items', { n: lines.length })}</p>
          <h1>{t('cart.title')}</h1>
        </div>
      </header>

      {lines.length === 0 ? (
        <EmptyState
          title={t('cart.emptyTitle')}
          text={t('cart.emptyText')}
          action={
            <Link to="/" className="btn btn-primary">
              {t('cart.seeShop')}
            </Link>
          }
        />
      ) : (
        <>
          <ul className="cart-list">
            {lines.map((l) => (
              <li key={l.productId} className="cart-row">
                <ProductImage product={l.product} className="thumb" />
                <div>
                  <strong>{l.product.name}</strong>
                  <PriceTag product={l.product} />
                  {l.quantity > l.product.quantity && (
                    <p className="field-error">{t('cart.stockLeft', { n: l.product.quantity })}</p>
                  )}
                  <button type="button" className="text-link" onClick={() => removeFromCart(l.productId)}>
                    {t('cart.remove')}
                  </button>
                </div>
                <QtyStepper
                  value={l.quantity}
                  min={1}
                  max={Math.max(l.product.quantity, 1)}
                  onChange={(v) => setCartQty(l.productId, v)}
                />
              </li>
            ))}
          </ul>
          <div className="checkout-bar">
            <div>
              <p className="muted">
                {t('cart.subtotal')} {formatMoney(subtotal)}
              </p>
              <p className="muted">
                {t('cart.delivery')} {formatMoney(delivery)}
              </p>
              <strong>
                {t('cart.total')} {formatMoney(total)}
              </strong>
            </div>
            {blocked ? (
              <button type="button" className="btn btn-primary" disabled>
                {t('cart.noStock')}
              </button>
            ) : (
              <Link to="/commande" className="btn btn-primary">
                {t('cart.order')}
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}
