// Exemple pour Home.jsx (adaptez pour vos autres pages)
import { useEffect, useState } from 'react'

function Presentation() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)

    return () => {
      setIsVisible(false)
    }
  }, [])

  return (
    <div
      className={`page-container ${
        isVisible ? 'page-enter-active' : 'page-enter'
      }`}
    >
      <h1>Presentation</h1>
      <p>Contenu de votre page de presentation</p>
      <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '2rem' }}>
        Utilisez la molette de la souris ou les flèches du clavier pour naviguer
      </p>
    </div>
  )
}

export default Presentation
