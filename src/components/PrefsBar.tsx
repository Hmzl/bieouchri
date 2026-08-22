import { useI18n } from '../i18n/I18nContext'

export function PrefsBar() {
  const { lang, theme, setLang, setTheme, t } = useI18n()
  return (
    <div className="prefs-bar no-print">
      <div className="prefs-group" role="group" aria-label={t('prefs.lang')}>
        <button type="button" className={lang === 'ar' ? 'is-on' : ''} onClick={() => setLang('ar')}>
          عربي
        </button>
        <button type="button" className={lang === 'fr' ? 'is-on' : ''} onClick={() => setLang('fr')}>
          FR
        </button>
      </div>
      <div className="prefs-group" role="group" aria-label={t('prefs.theme')}>
        <button type="button" className={theme === 'light' ? 'is-on' : ''} onClick={() => setTheme('light')}>
          {t('prefs.light')}
        </button>
        <button type="button" className={theme === 'dark' ? 'is-on' : ''} onClick={() => setTheme('dark')}>
          {t('prefs.dark')}
        </button>
      </div>
    </div>
  )
}
