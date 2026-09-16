import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../context/StoreContext'
import { Header } from '../../components/Header'
import { PhotoPicker } from '../../components/PhotoPicker'
import { Modal } from '../../components/Modal'
import { BarcodeScan } from '../../components/BarcodeScan'
import { IconScan } from '../../components/Icons'
import { useI18n } from '../../i18n/I18nContext'
import { formatMoney } from '../../lib/format'
import { findProductByBarcode, MAX_PRODUCT_IMAGES, productImages, salePrice } from '../../lib/product'

export function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, upsertProduct, deleteProduct, addCategory } = useStore()
  const { t, cat, err } = useI18n()
  const existing = id && id !== 'nouveau' ? data.products.find((p) => p.id === id) : undefined
  const isNew = !existing

  const [name, setName] = useState(existing?.name ?? '')
  const [price, setPrice] = useState(existing ? String(existing.price) : '')
  const [cost, setCost] = useState(existing && existing.cost ? String(existing.cost) : '')
  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : '1')
  const [category, setCategory] = useState(existing?.category ?? data.categories[0] ?? 'Autre')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [images, setImages] = useState(() => (existing ? productImages(existing) : []))
  const [discount, setDiscount] = useState(existing ? String(existing.discountPercent || '') : '')
  const [barcode, setBarcode] = useState(existing?.barcode ?? '')
  const [scanOpen, setScanOpen] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (id && id !== 'nouveau' && !existing) navigate('/merchant/produits')
  }, [id, existing, navigate])

  const priceN = Number(String(price).replace(',', '.'))
  const discountN = discount.trim() === '' ? 0 : Number(String(discount).replace(',', '.'))
  const preview =
    Number.isFinite(priceN) && priceN >= 0 && Number.isFinite(discountN)
      ? salePrice({ price: priceN, discountPercent: discountN })
      : null

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    const costN = cost.trim() === '' ? 0 : Number(cost.replace(',', '.'))
    const qtyN = Number(quantity.replace(',', '.'))
    if (trimmed.length < 2) {
      setError(t('form.errName'))
      return
    }
    if (!Number.isFinite(priceN) || priceN < 0) {
      setError(t('form.errPrice'))
      return
    }
    if (!Number.isFinite(costN) || costN < 0) {
      setError(t('form.errCost'))
      return
    }
    if (!Number.isFinite(discountN) || discountN < 0 || discountN > 100) {
      setError(t('form.errDiscount'))
      return
    }
    if (!Number.isInteger(qtyN) || qtyN < 0) {
      setError(t('form.errQty'))
      return
    }
    if (!images.length) {
      setError(t('form.errPhoto'))
      return
    }
    try {
      await upsertProduct({
        id: existing?.id,
        name: trimmed,
        price: priceN,
        cost: costN,
        quantity: qtyN,
        category,
        description: description.trim(),
        image: images[0] ?? '',
        images: images.slice(0, MAX_PRODUCT_IMAGES),
        discountPercent: discountN,
        barcode: barcode.trim(),
      })
      navigate('/merchant/produits')
    } catch (caught) {
      setError(caught instanceof Error ? err(caught.message) : t('form.errPrice'))
    }
  }

  function onScanned(code: string) {
    const value = code.trim()
    if (!value) return
    setBarcode(value)
    setScanOpen(false)
    const other = findProductByBarcode(data.products, value)
    if (other && other.id !== existing?.id) {
      setError(t('form.barcodeDup', { name: other.name }))
      return
    }
    setError('')
  }

  async function addCat() {
    const value = newCat.trim()
    if (!value) return
    setError('')
    try {
      await addCategory(value)
      setCategory(value)
      setNewCat('')
    } catch (caught) {
      setError(caught instanceof Error ? err(caught.message) : t('form.errCat'))
    }
  }

  return (
    <div className="page">
      <Header
        title={isNew ? t('form.new') : t('form.edit')}
        subtitle={isNew ? t('form.sub') : existing?.name}
        backTo="/merchant/produits"
      />

      <form className="form" onSubmit={(e) => void submit(e)}>
        <PhotoPicker values={images} onChange={setImages} />

        <label className="field">
          <span>{t('form.name')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('form.namePh')} required />
        </label>

        <div className="field-row">
          <label className="field">
            <span>{t('form.price')}</span>
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="0" required />
          </label>
          <label className="field">
            <span>{t('form.cost')}</span>
            <input value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" placeholder="0" />
          </label>
        </div>

        <label className="field">
          <span>{t('form.discount')}</span>
          <input
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            inputMode="decimal"
            placeholder="0"
          />
          <small>
            {preview != null && Number.isFinite(discountN) && discountN > 0
              ? t('form.discountHint', { price: formatMoney(preview) })
              : t('form.discountNone')}
          </small>
        </label>

        <label className="field">
          <span>{t('form.barcode')}</span>
          <div className="barcode-row">
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              autoCapitalize="none"
              autoComplete="off"
              placeholder={t('form.barcodePh')}
            />
            <button
              type="button"
              className="scan-btn"
              onClick={() => {
                setError('')
                setScanOpen(true)
              }}
              aria-label={t('form.scan')}
            >
              <IconScan />
            </button>
          </div>
          <small>{t('form.barcodeHint')}</small>
        </label>

        <label className="field">
          <span>{t('form.qty')}</span>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" required />
        </label>

        <label className="field">
          <span>{t('form.cat')}</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {data.categories.map((c) => (
              <option key={c} value={c}>
                {cat(c)}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-add">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder={t('form.newCat')} />
          <button type="button" className="btn btn-ghost" onClick={() => void addCat()}>
            {t('form.add')}
          </button>
        </div>

        <label className="field">
          <span>{t('form.desc')}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder={t('form.descPh')}
          />
        </label>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block">
          {isNew ? t('form.save') : t('form.saveEdit')}
        </button>

        {!isNew && (
          <button type="button" className="btn btn-danger-ghost btn-block" onClick={() => setConfirmDelete(true)}>
            {t('form.delete')}
          </button>
        )}
      </form>

      <Modal
        open={confirmDelete}
        title={t('form.deleteTitle')}
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
              {t('form.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (!existing) return
                void deleteProduct(existing.id)
                  .then(() => navigate('/merchant/produits'))
                  .catch((caught: unknown) => {
                    setConfirmDelete(false)
                    setError(caught instanceof Error ? err(caught.message) : t('form.errFail'))
                  })
              }}
            >
              {t('form.deleteConfirm')}
            </button>
          </>
        }
      >
        <p>{t('form.deleteText')}</p>
      </Modal>

      <BarcodeScan
        open={scanOpen}
        submitLabel={t('form.scanUse')}
        onClose={() => setScanOpen(false)}
        onDetected={onScanned}
      />
    </div>
  )
}
