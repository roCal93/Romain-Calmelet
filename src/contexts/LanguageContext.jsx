import { useState, useEffect } from 'react'
import { LanguageContext } from '../utils/LanguageUtils'

export const LanguageProvider = ({ children }) => {
  // Récupère la langue sauvegardée ou utilise 'fr' par défaut
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('portfolio-language') || 'fr'
  })

  // Sauvegarde la langue dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('portfolio-language', language)
  }, [language])

  const switchLanguage = () => {
    setLanguage((prev) => (prev === 'fr' ? 'en' : 'fr'))
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        switchLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}
