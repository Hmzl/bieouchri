import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { PrefsBar } from './components/PrefsBar'
import { ClientNav, MerchantNav } from './components/BottomNav'
import { InstallBanner } from './components/InstallBanner'
import { useStore } from './context/StoreContext'
import { useI18n } from './i18n/I18nContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/merchant/Dashboard'
import { Products } from './pages/merchant/Products'
import { ProductForm } from './pages/merchant/ProductForm'
import { Orders } from './pages/merchant/Orders'
import { Reports } from './pages/merchant/Reports'
import { Invoices } from './pages/merchant/Invoices'
import { InvoiceView } from './pages/merchant/InvoiceView'
import { More } from './pages/merchant/More'
import { Settings } from './pages/merchant/Settings'
import { QuickSale } from './pages/merchant/QuickSale'
import { Catalog } from './pages/client/Catalog'
import { ProductDetail } from './pages/client/ProductDetail'
import { Cart } from './pages/client/Cart'
import { Checkout } from './pages/client/Checkout'
import { Thanks } from './pages/client/Thanks'

function Phone({ nav }: { nav?: 'merchant' | 'client' }) {
  const location = useLocation()
  const showInstall = nav === 'client' && location.pathname === '/'
  return (
    <div className="app-root">
      <PrefsBar />
      <Outlet />
      {showInstall && <InstallBanner />}
      {nav === 'merchant' && <MerchantNav />}
      {nav === 'client' && <ClientNav />}
    </div>
  )
}

function RedirectProduct() {
  const { id } = useParams()
  return <Navigate to={`/produit/${id ?? ''}`} replace />
}

function RequireMerchant() {
  const { isMerchant } = useStore()
  const location = useLocation()
  if (!isMerchant) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export default function App() {
  const { loading, error, refresh } = useStore()
  const { t } = useI18n()

  if (loading || error) {
    return (
      <div className="app-root">
        <PrefsBar />
        <div className="page page--center">
          {loading ? (
            <p className="muted">{t('boot.loading')}</p>
          ) : (
            <>
              <h1>{t('boot.errorTitle')}</h1>
              <p className="lede">{t('boot.errorText')}</p>
              <p className="field-error">{error}</p>
              <button type="button" className="btn btn-primary" onClick={() => void refresh()}>
                {t('boot.retry')}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Phone nav="client" />}>
        <Route path="/" element={<Catalog />} />
        <Route path="/panier" element={<Cart />} />
      </Route>
      <Route element={<Phone />}>
        <Route path="/produit/:id" element={<ProductDetail />} />
        <Route path="/commande" element={<Checkout />} />
        <Route path="/merci" element={<Thanks />} />
        <Route path="/connexion" element={<Login />} />
      </Route>

      <Route element={<RequireMerchant />}>
        <Route element={<Phone />}>
          <Route path="/merchant/produits/nouveau" element={<ProductForm />} />
          <Route path="/merchant/produits/:id" element={<ProductForm />} />
          <Route path="/merchant/parametres" element={<Settings />} />
          <Route path="/merchant/vente" element={<QuickSale />} />
          <Route path="/merchant/factures/:id" element={<InvoiceView />} />
        </Route>
        <Route element={<Phone nav="merchant" />}>
          <Route path="/merchant" element={<Dashboard />} />
          <Route path="/merchant/produits" element={<Products />} />
          <Route path="/merchant/commandes" element={<Orders />} />
          <Route path="/merchant/plus" element={<More />} />
          <Route path="/merchant/rapports" element={<Reports />} />
          <Route path="/merchant/factures" element={<Invoices />} />
        </Route>
      </Route>

      <Route path="/client" element={<Navigate to="/" replace />} />
      <Route path="/client/panier" element={<Navigate to="/panier" replace />} />
      <Route path="/client/commande" element={<Navigate to="/commande" replace />} />
      <Route path="/client/merci" element={<Navigate to="/merci" replace />} />
      <Route path="/client/produit/:id" element={<RedirectProduct />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
