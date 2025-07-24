import { useLanguage } from '../utils/LanguageUtils'
import frTranslations from '../assets/data/fr.json'
import enTranslations from '../assets/data/en.json'

const translations = {
  fr: frTranslations,
  en: enTranslations,
}

export const useTranslation = () => {
  const { language } = useLanguage()

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key // Retourne la clé si traduction non trouvée
  }

  return { t, language }
}
