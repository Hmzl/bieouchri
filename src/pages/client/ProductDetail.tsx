import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { Header } from '../../components/Header'
import { ProductImage } from '../../components/ProductImage'
import { PriceTag } from '../../components/PriceTag'
import { QtyStepper } from '../../components/QtyStepper'
import { IconCart } from '../../components/Icons'
import { useI18n } from '../../i18n/I18nContext'
import { hasDiscount, productImages, discountPercent } from '../../lib/product'

export function ProductDetail() {
  const { id } = useParams()
  const { data, addToCart } = useStore()
  const { t, cat } = useI18n()
  const product = data.products.find((p) => p.id === id)
  const [qty, setQty] = useState(1)
  const [photo, setPhoto] = useState(0)

  if (!product) {
    return (
      <div className="page">
        <Header title={t('product.missing')} backTo="/" />
      </div>
    )
  }

  const max = Math.max(product.quantity, 0)
  const gallery = productImages(product)
  const current = gallery[photo] ?? gallery[0]

  function add() {
    if (!product) return
    addToCart(product.id, qty)
  }

  return (
    <div className="page page--nav">
      <Header title={product.name} subtitle={cat(product.category)} backTo="/" />
      <div className="detail-hero">
        {current ? (
          <div className="product-img-wrap">
            <img src={current} alt={product.name} className="product-img" />
            {hasDiscount(product) && (
              <span className="discount-badge">{t('sale.off', { n: discountPercent(product) })}</span>
            )}
          </div>
        ) : (
          <ProductImage product={product} showDiscount />
        )}
        {gallery.length > 1 && (
          <div className="gallery-thumbs">
            {gallery.map((src, i) => (
              <button
                key={`${src.slice(0, 16)}-${i}`}
                type="button"
                className={i === photo ? 'is-on' : ''}
                onClick={() => setPhoto(i)}
                aria-label={`${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      <PriceTag product={product} className="detail-price" />
      <p className="muted">
        {product.quantity > 0
          ? t(product.quantity > 1 ? 'product.available_plural' : 'product.available', { n: product.quantity })
          : t('product.out')}
      </p>
      {product.description && <p className="detail-desc">{product.description}</p>}

      {max > 0 ? (
        <>
          <div className="detail-qty">
            <span>{t('product.qty')}</span>
            <QtyStepper value={qty} min={1} max={max} onChange={setQty} />
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={add}>
            {t('product.add')}
          </button>
          <Link to="/panier" className="btn btn-secondary btn-block">
            <IconCart size={18} />
            {t('product.seeCart')}
          </Link>
        </>
      ) : (
        <p className="field-error">{t('product.unavailable')}</p>
      )}
    </div>
  )
}
