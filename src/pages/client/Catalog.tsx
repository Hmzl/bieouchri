import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { IconSearch } from '../../components/Icons'
import { ProductImage } from '../../components/ProductImage'
import { Logo } from '../../components/Logo'
import { EmptyState } from '../../components/EmptyState'
import { PriceTag } from '../../components/PriceTag'
import { useI18n } from '../../i18n/I18nContext'

export function Catalog() {
  const { data } = useStore()
  const { t, cat } = useI18n()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('tous')
  const available = (data.products ?? []).filter((p) => p.quantity > 0)
  const cats = ['tous', ...new Set(available.map((p) => p.category))]

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return available.filter((p) => {
      const matchQ = !query || p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      const matchCat = category === 'tous' || p.category === category
      return matchQ && matchCat
    })
  }, [available, q, category])

  return (
    <div className="page page--nav">
      <header className="page-header">
        <div className="brand-row">
          <Logo size="sm" onHold={() => navigate('/connexion')} holdMs={5000} />
          <div>
            <p className="eyebrow">{data.settings.storeName}</p>
            <h1>{t('nav.shop')}</h1>
          </div>
        </div>
      </header>

      <label className="search">
        <IconSearch size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} type="search" />
      </label>

      <div className="chips">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${category === c ? 'is-on' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c === 'tous' ? t('all') : cat(c)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t('shop.emptyTitle')} text={t('shop.emptyText')} />
      ) : (
        <div className="catalog-grid">
          {filtered.map((p) => (
            <Link key={p.id} to={`/produit/${p.id}`} className="catalog-card">
              <ProductImage product={p} showDiscount />
              <div className="catalog-card-body">
                <strong>{p.name}</strong>
                <p>{cat(p.category)}</p>
                <PriceTag product={p} />
                <p>{t('inStock', { n: p.quantity })}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
