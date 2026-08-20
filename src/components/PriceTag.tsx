import type { Product } from '../types'
import { formatMoney } from '../lib/format'
import { discountPercent, hasDiscount, salePrice } from '../lib/product'
import { useI18n } from '../i18n/I18nContext'

interface PriceTagProps {
  product: Pick<Product, 'price' | 'discountPercent'>
  className?: string
}

export function PriceTag({ product, className = '' }: PriceTagProps) {
  const { t } = useI18n()
  const sale = salePrice(product)
  if (!hasDiscount(product)) {
    return <span className={`price ${className}`.trim()}>{formatMoney(sale)}</span>
  }
  return (
    <span className={`price-wrap ${className}`.trim()}>
      <span className="price-old">{formatMoney(product.price)}</span>
      <span className="price">{formatMoney(sale)}</span>
      <span className="discount-chip">{t('sale.off', { n: discountPercent(product) })}</span>
    </span>
  )
}
