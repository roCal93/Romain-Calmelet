// Dans votre LanguageContext.jsx
import { useState, useEffect } from 'react'
import { LanguageContext } from '../utils/LanguageUtils'

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('portfolio-language') || 'fr'
  })

  // Sauvegarde la langue dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('portfolio-language', language)
    //  Met à jour l'attribut lang de la balise HTML
    document.documentElement.lang = language
  }, [language])

  // Met à jour l'attribut lang au premier rendu
  useEffect(() => {
    document.documentElement.lang = language
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
