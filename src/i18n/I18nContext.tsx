import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PREFS_KEY, categoryLabel, mapError, translate, type Lang, type Theme } from './translations'
import { setFormatLocale } from '../lib/format'

interface Prefs {
  lang: Lang
  theme: Theme
}

interface I18nValue {
  lang: Lang
  theme: Theme
  t: (key: string, vars?: Record<string, string | number>) => string
  cat: (name: string) => string
  err: (message: string) => string
  setLang: (lang: Lang) => void
  setTheme: (theme: Theme) => void
}

const I18nContext = createContext<I18nValue | null>(null)

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { lang: 'ar', theme: 'light' }
    const parsed = JSON.parse(raw) as Partial<Prefs>
    return {
      lang: parsed.lang === 'fr' ? 'fr' : 'ar',
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    }
  } catch {
    return { lang: 'ar', theme: 'light' }
  }
}

function applyPrefs(prefs: Prefs) {
  document.documentElement.lang = prefs.lang
  document.documentElement.dir = prefs.lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dataset.theme = prefs.theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', prefs.theme === 'dark' ? '#121820' : '#fff8f1')
  setFormatLocale(prefs.lang)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    const initial = loadPrefs()
    applyPrefs(initial)
    return initial
  })

  useEffect(() => {
    applyPrefs(prefs)
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  }, [prefs])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(prefs.lang, key, vars),
    [prefs.lang],
  )
  const cat = useCallback((name: string) => categoryLabel(prefs.lang, name), [prefs.lang])
  const err = useCallback((message: string) => mapError(prefs.lang, message), [prefs.lang])
  const setLang = useCallback((lang: Lang) => setPrefs((p) => ({ ...p, lang })), [])
  const setTheme = useCallback((theme: Theme) => setPrefs((p) => ({ ...p, theme })), [])

  const value = useMemo(
    () => ({ lang: prefs.lang, theme: prefs.theme, t, cat, err, setLang, setTheme }),
    [prefs, t, cat, err, setLang, setTheme],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
