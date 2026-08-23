import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { I18nProvider } from './i18n/I18nContext'
import App from './App'
import { captureInstallState, initInstallCapture, registerServiceWorker } from './lib/install'
import './index.css'

initInstallCapture()
registerServiceWorker()
captureInstallState()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
