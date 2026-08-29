import type { Product } from '../types'

export const MAX_PRODUCT_IMAGES = 6

export function productImages(product: Pick<Product, 'image' | 'images'>): string[] {
  const list = product.images?.length ? product.images : product.image ? [product.image] : []
  return list.filter((src) => typeof src === 'string' && src.length > 0)
}

export function coverImage(product: Pick<Product, 'image' | 'images'>): string {
  return productImages(product)[0] ?? ''
}

export function hasProductImage(product: Pick<Product, 'image' | 'images'>): boolean {
  return productImages(product).length > 0
}

export function discountPercent(product: Pick<Product, 'discountPercent'>): number {
  const n = Number(product.discountPercent)
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, n))
}

export function salePrice(product: Pick<Product, 'price' | 'discountPercent'>): number {
  const pct = discountPercent(product)
  if (pct <= 0) return product.price
  return Math.round((product.price * (100 - pct)) / 100)
}

export function hasDiscount(product: Pick<Product, 'discountPercent'>): boolean {
  return discountPercent(product) > 0
}

export function normalizeBarcode(value: string): string {
  return value.replace(/[\s-]/g, '').trim()
}

export function findProductByBarcode(products: Product[], code: string): Product | undefined {
  const needle = normalizeBarcode(code).toLowerCase()
  if (!needle) return undefined
  return products.find((p) => normalizeBarcode(p.barcode || '').toLowerCase() === needle)
}

export function normalizeProduct(product: Product): Product {
  const images = productImages(product)
  return {
    ...product,
    images,
    image: images[0] ?? '',
    discountPercent: discountPercent(product),
    barcode: normalizeBarcode(product.barcode || ''),
  }
}
