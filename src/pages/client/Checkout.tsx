import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { formatMoney, mapsUrl, osmEmbed } from '../../lib/format'
import { getCurrentPosition, reverseGeocode } from '../../lib/geo'
import { buildOrderMessage, digitsOnly, openWhatsApp } from '../../lib/whatsapp'
import { Header } from '../../components/Header'
import { IconMap, IconRefresh } from '../../components/Icons'
import { useI18n } from '../../i18n/I18nContext'
import { salePrice } from '../../lib/product'

export function Checkout() {
  const { data, cart, placeOrder } = useStore()
  const { t, lang, err } = useI18n()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locating, setLocating] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [geoHint, setGeoHint] = useState('')

  const lines = cart
    .map((c) => {
      const product = data.products.find((p) => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter((x) => x !== null)

  const subtotal = lines.reduce((s, l) => s + salePrice(l.product) * l.quantity, 0)
  const delivery = Math.max(0, data.settings.deliveryFee || 0)
  const total = subtotal + delivery

  useEffect(() => {
    if (cart.length === 0) navigate('/panier')
  }, [cart.length, navigate])

  async function locate() {
    setLocating(true)
    setError('')
    setGeoHint('')
    setConfirmed(false)
    try {
      const pos = await getCurrentPosition()
      setLat(pos.lat)
      setLng(pos.lng)
      try {
        const label = await reverseGeocode(pos.lat, pos.lng, lang)
        setAddress(label)
        setGeoHint(t('checkout.geoOk'))
      } catch {
        setAddress((prev) => prev || `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`)
        setGeoHint(t('checkout.geoGps'))
      }
    } catch (e) {
      setError(e instanceof Error ? err(e.message) : t('geo.fail'))
    } finally {
      setLocating(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) {
      setError(t('checkout.errName'))
      return
    }
    if (digitsOnly(phone).length < 8) {
      setError(t('checkout.errPhone'))
      return
    }
    if (!address.trim()) {
      setError(t('checkout.errAddress'))
      return
    }
    if (!confirmed) {
      setError(t('checkout.errConfirm'))
      return
    }
    if (!data.settings.whatsapp) {
      setError(t('checkout.errWa'))
      return
    }

    try {
      const order = await placeOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        address: address.trim(),
        lat,
        lng,
        notes,
        source: 'client',
      })
      const message = buildOrderMessage(
        order,
        data.settings.storeName,
        data.settings.currencySymbol,
        data.settings.currency,
        lang,
      )
      const opened = openWhatsApp(data.settings.whatsapp, message)
      navigate('/merci', { state: { orderId: order.id, whatsappOpened: opened } })
    } catch (e) {
      setError(e instanceof Error ? err(e.message) : t('checkout.errFail'))
    }
  }

  return (
    <div className="page">
      <Header title={t('checkout.title')} subtitle={t('checkout.sub')} backTo="/panier" />

      <ul className="recap">
        {lines.map((l) => (
          <li key={l.productId}>
            <span>
              {l.product.name} × {l.quantity}
            </span>
            <span>{formatMoney(salePrice(l.product) * l.quantity)}</span>
          </li>
        ))}
        <li>
          <span>{t('cart.subtotal')}</span>
          <span>{formatMoney(subtotal)}</span>
        </li>
        <li>
          <span>{t('cart.delivery')}</span>
          <span>{formatMoney(delivery)}</span>
        </li>
        <li className="recap-total">
          <span>{t('cart.total')}</span>
          <strong>{formatMoney(total)}</strong>
        </li>
      </ul>

      <form className="form" onSubmit={(e) => void submit(e)}>
        <label className="field">
          <span>{t('checkout.name')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </label>
        <label className="field">
          <span>{t('checkout.phone')}</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>

        <div className="location-card">
          <div className="location-head">
            <IconMap />
            <div>
              <strong>{t('checkout.addressTitle')}</strong>
              <p>{t('checkout.addressHint')}</p>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => void locate()} disabled={locating}>
            <IconRefresh size={18} />
            {locating ? t('checkout.locating') : lat == null ? t('checkout.locate') : t('checkout.refresh')}
          </button>
          {lat != null && lng != null && (
            <div className="map-frame">
              <iframe title={t('checkout.map')} src={osmEmbed(lat, lng)} loading="lazy" />
              <a href={mapsUrl(lat, lng)} target="_blank" rel="noreferrer">
                {t('checkout.openMaps')}
              </a>
            </div>
          )}
          <label className="field">
            <span>{t('checkout.addressEdit')}</span>
            <textarea
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                setConfirmed(false)
              }}
              rows={3}
              placeholder={t('checkout.addressPh')}
            />
          </label>
          {geoHint && <p className="muted">{geoHint}</p>}
          <label className="check">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            {t('checkout.confirm')}
          </label>
          <label className="field">
            <span>{t('checkout.notes')}</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('checkout.notesPh')}
            />
          </label>
        </div>

        {error && <p className="field-error">{error}</p>}
        {!data.settings.whatsapp && <p className="field-error">{t('checkout.errWaHint')}</p>}

        <button type="submit" className="btn btn-primary btn-block">
          {t('checkout.send')}
        </button>
      </form>
    </div>
  )
}
