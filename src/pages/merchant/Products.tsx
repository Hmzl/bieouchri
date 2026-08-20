import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { IconPlus, IconSearch } from '../../components/Icons'
import { ProductImage } from '../../components/ProductImage'
import { EmptyState } from '../../components/EmptyState'
import { PriceTag } from '../../components/PriceTag'
import { useI18n } from '../../i18n/I18nContext'

type StockFilter = 'tous' | 'faible' | 'rupture' | 'ok'

export function Products() {
  const { data } = useStore()
  const { t, cat } = useI18n()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const category = params.get('cat') ?? 'tous'
  const stock = (params.get('stock') as StockFilter) || 'tous'
  const threshold = data.settings.lowStockThreshold

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return data.products.filter((p) => {
      const matchQ =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      const matchCat = category === 'tous' || p.category === category
      const matchStock =
        stock === 'tous' ||
        (stock === 'rupture' && p.quantity <= 0) ||
        (stock === 'faible' && p.quantity > 0 && p.quantity <= threshold) ||
        (stock === 'ok' && p.quantity > threshold)
      return matchQ && matchCat && matchStock
    })
  }, [data.products, q, category, stock, threshold])

  function setStock(value: StockFilter) {
    const next = new URLSearchParams(params)
    if (value === 'tous') next.delete('stock')
    else next.set('stock', value)
    setParams(next)
  }

  function setCat(value: string) {
    const next = new URLSearchParams(params)
    if (value === 'tous') next.delete('cat')
    else next.set('cat', value)
    setParams(next)
  }

  const stockFilters: [StockFilter, string][] = [
    ['tous', t('products.stockAll')],
    ['ok', t('products.stockOk')],
    ['faible', t('products.stockLow')],
    ['rupture', t('products.stockOut')],
  ]

  return (
    <div className="page page--nav">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            {t(data.products.length > 1 ? 'products.count_plural' : 'products.count', { n: data.products.length })}
          </p>
          <h1>{t('products.title')}</h1>
        </div>
        <Link to="/merchant/produits/nouveau" className="icon-btn icon-btn--solid" aria-label={t('products.new')}>
          <IconPlus />
        </Link>
      </header>

      <label className="search">
        <IconSearch size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchProduct')} type="search" />
      </label>

      <div className="chips" role="tablist" aria-label={t('products.cats')}>
        <button type="button" className={`chip ${category === 'tous' ? 'is-on' : ''}`} onClick={() => setCat('tous')}>
          {t('all')}
        </button>
        {data.categories.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${category === c ? 'is-on' : ''}`}
            onClick={() => setCat(c)}
          >
            {cat(c)}
          </button>
        ))}
      </div>

      <div className="chips chips--small">
        {stockFilters.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`chip ${stock === key ? 'is-on' : ''}`}
            onClick={() => setStock(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={data.products.length === 0 ? t('products.emptyTitle') : t('products.emptySearch')}
          text={data.products.length === 0 ? t('products.emptyText') : t('products.emptySearchText')}
          action={
            data.products.length === 0 ? (
              <Link to="/merchant/produits/nouveau" className="btn btn-primary">
                {t('products.add')}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ul className="product-list">
          {filtered.map((p) => {
            const isLow = p.quantity > 0 && p.quantity <= threshold
            const empty = p.quantity <= 0
            return (
              <li key={p.id}>
                <Link to={`/merchant/produits/${p.id}`} className="product-row">
                  <ProductImage product={p} />
                  <div className="product-meta">
                    <strong>{p.name}</strong>
                    <p>{cat(p.category)}</p>
                    <PriceTag product={p} />
                  </div>
                  <span className={`stock-pill ${empty ? 'is-out' : isLow ? 'is-low' : ''}`}>
                    {empty ? t('products.stockOut') : t('inStock', { n: p.quantity })}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
