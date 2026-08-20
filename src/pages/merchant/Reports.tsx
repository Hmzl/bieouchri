import { useMemo, useState } from 'react'
import { useStore } from '../../context/StoreContext'
import { computeAnalytics, lastNDaysSales, lastNMonthsSales } from '../../lib/analytics'
import { endOfDay, endOfMonth, formatMoney, startOfDay, startOfMonth } from '../../lib/format'
import { BarChart } from '../../components/BarChart'
import { useI18n } from '../../i18n/I18nContext'

type Mode = 'jour' | 'mois'

export function Reports() {
  const { data } = useStore()
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('jour')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const range = useMemo(() => {
    if (mode === 'jour') {
      const d = new Date(`${date}T12:00:00`)
      return { from: startOfDay(d), to: endOfDay(d) }
    }
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1, 1)
    return { from: startOfMonth(d), to: endOfMonth(d) }
  }, [mode, date, month])

  const stats = computeAnalytics(data.orders, range)
  const chart = mode === 'jour' ? lastNDaysSales(data.orders, 7) : lastNMonthsSales(data.orders, 6)

  return (
    <div className="page page--nav">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('reports.kicker')}</p>
          <h1>{t('reports.title')}</h1>
        </div>
      </header>

      <div className="segmented">
        <button type="button" className={mode === 'jour' ? 'is-on' : ''} onClick={() => setMode('jour')}>
          {t('reports.daily')}
        </button>
        <button type="button" className={mode === 'mois' ? 'is-on' : ''} onClick={() => setMode('mois')}>
          {t('reports.monthly')}
        </button>
      </div>

      <label className="field">
        <span>{mode === 'jour' ? t('reports.day') : t('reports.month')}</span>
        {mode === 'jour' ? (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        ) : (
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        )}
      </label>

      <section className="stats-grid">
        <article className="stat-card">
          <p>{t('reports.sales')}</p>
          <strong>{formatMoney(stats.totalSales)}</strong>
        </article>
        <article className="stat-card">
          <p>{t('reports.profit')}</p>
          <strong>{formatMoney(stats.profit)}</strong>
        </article>
        <article className="stat-card">
          <p>{t('reports.sold')}</p>
          <strong>{stats.itemsSold}</strong>
        </article>
        <article className="stat-card">
          <p>{t('reports.orders')}</p>
          <strong>{stats.orderCount}</strong>
        </article>
      </section>

      <section className="section card">
        <h2>{mode === 'jour' ? t('reports.last7') : t('reports.last6')}</h2>
        <BarChart data={chart} />
      </section>

      <section className="section">
        <h2>{t('reports.top')}</h2>
        {stats.topProducts.length === 0 ? (
          <p className="muted">{t('reports.empty')}</p>
        ) : (
          <ul className="top-list">
            {stats.topProducts.map((p, i) => (
              <li key={p.name}>
                <span className="rank">{i + 1}</span>
                <div>
                  <strong>{p.name}</strong>
                  <p>
                    {p.quantity} · {formatMoney(p.revenue)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
