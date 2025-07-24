import { useLanguage } from '../../utils/LanguageUtils'
import styles from './languageSwitcher.module.scss'

const LanguageSwitcher = () => {
  const { language, switchLanguage } = useLanguage()

  return (
    <div className={styles.languageSwitcher}>
      <button
        onClick={switchLanguage}
        className={`${styles.button} ${language === 'en' ? styles.active : ''}`}
        aria-label="Switch language"
        lang={language === 'fr' ? 'en' : 'fr'}
      >
        {language === 'fr' ? 'Shakespeare mode' : 'Mode Molière'}
      </button>
    </div>
  )
}

export default LanguageSwitcher
