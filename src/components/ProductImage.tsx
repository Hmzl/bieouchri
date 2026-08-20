import type { Product } from '../types'
import { coverImage, discountPercent, hasDiscount } from '../lib/product'
import { useI18n } from '../i18n/I18nContext'

const PALETTE = [
  ['#12b5a8', '#f0b429'],
  ['#3b82f6', '#fbbf24'],
  ['#ff7a45', '#f0c14a'],
  ['#0ea5a0', '#ffd36a'],
  ['#6366f1', '#f59e0b'],
  ['#14b8a6', '#fb7185'],
]

function hashColor(value: string): string[] {
  let h = 0
  for (let i = 0; i < value.length; i++) h = value.charCodeAt(i) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

interface ProductImageProps {
  product: Pick<Product, 'name' | 'category' | 'image' | 'images' | 'discountPercent'>
  className?: string
  showDiscount?: boolean
}

export function ProductImage({ product, className = '', showDiscount = false }: ProductImageProps) {
  const { t } = useI18n()
  const src = coverImage(product)
  const badge =
    showDiscount && hasDiscount(product) ? (
      <span className="discount-badge">{t('sale.off', { n: discountPercent(product) })}</span>
    ) : null

  if (src) {
    return (
      <div className={`product-img-wrap ${className}`.trim()}>
        <img src={src} alt={product.name} className="product-img" />
        {badge}
      </div>
    )
  }
  const [a, b] = hashColor(product.category || product.name)
  return (
    <div className={`product-img-wrap ${className}`.trim()}>
      <div
        className="product-img product-img--ph"
        style={{ background: `linear-gradient(145deg, ${a}, ${b})` }}
        aria-hidden="true"
      >
        <span>AC</span>
      </div>
      {badge}
    </div>
  )
}
